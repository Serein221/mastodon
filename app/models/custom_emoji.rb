# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_emojis
#
#  id                           :bigint(8)        not null, primary key
#  shortcode                    :string           default(""), not null
#  domain                       :string
#  image_file_name              :string
#  image_content_type           :string
#  image_file_size              :bigint(8)
#  image_updated_at             :datetime
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  disabled                     :boolean          default(FALSE), not null
#  uri                          :string
#  image_remote_url             :string
#  visible_in_picker            :boolean          default(TRUE), not null
#  category_id                  :bigint(8)
#  image_storage_schema_version :integer
#

class CustomEmoji < ApplicationRecord
  include Attachmentable

  LIMIT = 256.kilobytes

  SHORTCODE_RE_FRAGMENT = '[a-zA-Z0-9_]{2,}'

  SCAN_RE = /(?<=[^[:alnum:]:]|\n|^)
    :(#{SHORTCODE_RE_FRAGMENT}):
    (?=[^[:alnum:]:]|$)/x
  SHORTCODE_ONLY_RE = /\A#{SHORTCODE_RE_FRAGMENT}\z/

  IMAGE_MIME_TYPES = %w(image/png image/gif image/webp).freeze

  belongs_to :category, class_name: 'CustomEmojiCategory', optional: true
  has_one :local_counterpart, -> { where(domain: nil) }, class_name: 'CustomEmoji', primary_key: :shortcode, foreign_key: :shortcode

  has_attached_file :image, styles: { static: { format: 'png', convert_options: '-coalesce +profile "!icc,*" +set modify-date +set create-date' } }, validate_media_type: false

  before_validation :downcase_domain

  validates_attachment :image, content_type: { content_type: IMAGE_MIME_TYPES }, presence: true, size: { less_than: LIMIT }
  validates :shortcode, uniqueness: { scope: :domain }, format: { with: SHORTCODE_ONLY_RE }, length: { minimum: 2 }

  scope :local, -> { where(domain: nil) }
  scope :remote, -> { where.not(domain: nil) }
  scope :alphabetic, -> { order(domain: :asc, shortcode: :asc) }
  scope :by_domain_and_subdomains, ->(domain) { where(domain: domain).or(where(arel_table[:domain].matches("%.#{domain}"))) }
  scope :listed, -> { local.where(disabled: false).where(visible_in_picker: true) }

  remotable_attachment :image, LIMIT

  after_commit :remove_entity_cache

  def local?
    domain.nil?
  end

  def object_type
    :emoji
  end

  def copy!
    copy = self.class.find_or_initialize_by(domain: nil, shortcode: shortcode)
    copy.image = image
    copy.tap(&:save!)
  end

  def to_log_human_identifier
    shortcode
  end

  class << self
    def from_text(text, domain = nil)
      return [] if text.blank?

      shortcodes = text.scan(SCAN_RE).map(&:first).uniq

      return [] if shortcodes.empty?

      EntityCache.instance.emoji(shortcodes, domain)
    end

    def search(shortcode)
      where('"custom_emojis"."shortcode" ILIKE ?', "%#{shortcode}%")
    end
  end

  private

  def remove_entity_cache
    Rails.cache.delete(EntityCache.instance.to_key(:emoji, shortcode, domain))
  end

  def downcase_domain
    self.domain = domain.downcase unless domain.nil?
  end
end
