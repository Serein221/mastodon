import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Icon from 'mastodon/components/icon';
import classNames from 'classnames';

const ColumnLink = ({ icon, text, to, href, method, badge, transparent, id, ...other }) => {
  const className = classNames('column-link', { 'column-link--transparent': transparent });
  const badgeElement = typeof badge !== 'undefined' ? <span className='column-link__badge'>{badge}</span> : null;
  const iconElement = typeof icon === 'string' ? <Icon id={icon} fixedWidth className='column-link__icon' /> : icon;

  if (href) {
    return (
      <a id={id} href={href} className={className} data-method={method} title={text} {...other}>
        {iconElement}
        <span>{text}</span>
        {badgeElement}
      </a>
    );
  } else {
    return (
      <NavLink to={to} className={className} title={text} {...other}>
        {iconElement}
        <span>{text}</span>
        {badgeElement}
      </NavLink>
    );
  }
};

ColumnLink.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string,
  href: PropTypes.string,
  method: PropTypes.string,
  badge: PropTypes.node,
  transparent: PropTypes.bool,
  id: PropTypes.string,
};

export default ColumnLink;
