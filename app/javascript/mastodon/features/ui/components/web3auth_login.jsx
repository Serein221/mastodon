import React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactOnRails from 'react-on-rails';
// import PropTypes from 'prop-types';

import { getPublicCompressed } from '@toruslabs/eccrypto';
import web3auth from 'packs/use_web3auth';

export default class Web3authLogin extends React.PureComponent {

  // static propTypes = {
  //     formLogin: PropTypes.func.isRequired,
  // };

  formLogin = async () => {
    const inputWeb3authAddress = document.getElementById('user_web3auth_address');
    const inputWeb3authPubkey = document.getElementById('user_web3auth_pubkey');
    const inputWeb3authIdToken = document.getElementById('user_web3auth_id_token');
    const inputUserEmail = document.getElementById('user_email');
    var Web3 = require('web3');
    const web3authForm = document.getElementById('new_user');
    try {
      void await web3auth.connect();
      const id_token = await web3auth.authenticateUser();
      const userInfo = await web3auth.getUserInfo();
      if (JSON.stringify(userInfo) === '{}') {
        //wallet, currently do nothing special
      } else {
        //social media
        const app_scoped_privkey = await web3auth.provider?.request({
          method: 'eth_private_key', // use "private_key" for other non-evm chains
        });
        const app_pub_key = getPublicCompressed(Buffer.from(app_scoped_privkey.padStart(64, '0'), 'hex')).toString('hex');
        inputWeb3authPubkey.value = app_pub_key;
        console.log('web3auth pubkey: ', app_pub_key);
        // const user = await web3auth.getUserInfo();
        // console.log('user info:', user);
        // console.log('social media email:', user.email);
        // console.log('social media name:', user.name);
        // console.log('social media profile image:', user.profileImage);
      }
      const web3 = new Web3(web3auth.provider);
      const address = (await web3.eth.getAccounts())[0];
      inputWeb3authAddress.value = address;
      // console.log('web3auth address: ', address);
      // console.log('web3auth id token:', id_token.idToken);
      inputWeb3authIdToken.value = id_token.idToken;
      const email = (address + '@web3.com');
      inputUserEmail.value = email;
      // console.log('email:', email);
      web3authForm.submit();
    } catch (error) {
      console.error(error.message);
    }
  };
  render() {
    const csrfToken = ReactOnRails.authenticityToken();

    return (
      <>
        <form id='new_user' className='simple_form new_user' noValidate='novalidate' action='/auth/sign_in' method='post' acceptCharset='UTF-8'>
          <input type='hidden' name='authenticity_token' value={csrfToken} />
          <input className='hidden' type='hidden' value='' name='user[email]' id='user_email' />
          <input className='hidden' type='hidden' name='user[web3auth_address]' id='user_web3auth_address' />
          <input className='hidden' type='hidden' name='user[web3auth_pubkey]' id='user_web3auth_pubkey' />
          <input className='hidden' type='hidden' name='user[web3auth_id_token]' id='user_web3auth_id_token' />
        </form>
        <button className='button button--block' onClick={this.formLogin}><FormattedMessage id='sign_in_banner.web3auth_login' defaultMessage='Web3Auth Login/up' /></button>
      </>
    );
  }

}