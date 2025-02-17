import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;

// import { Web3Auth } from '@web3auth/modal';  web3auth/modal only appears after 3.0.0, when web3auth started to
// support react18, since mastodon is using react 16, we use @web3auth/web3auth instead
import { Web3Auth } from '@web3auth/web3auth';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';
// Adapters

import { WalletConnectV1Adapter } from '@web3auth/wallet-connect-v1-adapter';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';

(async function init() {
  // $(".btn-logged-in").hide();
  // $("#sign-tx").hide();
  // alert('init web3auth in javasript pack');

  const clientId = 'BAqTBAVYaw6XPqsGyr_4Mk4hMnSI7XIC4PEueaJBRlDH008L9982XbPs0IjW04S4Xy21TGnMVvPbmxwfTVwmeJo'; // get your clientId from https://dashboard.web3auth.io
  window.web3auth = new Web3Auth({
    clientId,
    chainConfig: {
      chainNamespace: 'eip155',
      chainId: '0x89',
      rpcTarget: 'https://rpc.ankr.com/polygon', // This is the public RPC we have added, please pass on your own endpoint while creating an app
    },
    uiConfig: {
      appName:'Chinese.org',
      appLogo:'/images/icon.png',
      theme:'light',
      loginMethodsOrder: ['twitter', 'google'],
    },
  });
  // window.web3auth = new Web3Auth({
  //   clientId,
  //   chainConfig: {
  //     chainNamespace: 'eip155',
  //     chainId: '0x7f93',
  //     rpcTarget: 'https://mainnet.fusionnetwork.io', // This is the public RPC we have added, please pass on your own endpoint while creating an app
  //   },
  // });
  // Add Torus Wallet Connector Plugin
  const torusPlugin =
    new TorusWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {
        whiteLabel: {
          theme: { isDark: true, colors: { primary: '#00a8ff' } },
          logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
          logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
        },
        useWalletConnect: true,
        enableLogging: true,
      },
    });
  await window.web3auth.addPlugin(torusPlugin);

  const metamaskAdapter = new MetamaskAdapter({
    clientId,
    sessionTime: 86400, // 1 hour in seconds

    // // web3AuthNetwork: 'testnet',
    // chainConfig: {
    //   chainNamespace: 'eip155',
    //   chainId: '0x7f93',
    //   rpcTarget: 'https://mainnet.fusionnetwork.io', // This is the public RPC we have added, please pass on your own endpoint while creating an app
    // },
  });
  window.web3auth.configureAdapter(metamaskAdapter);

  const walletConnectAdapter =
    new WalletConnectV1Adapter({
      adapterSettings: {
        bridge: 'https://bridge.walletconnect.org',
      },
      clientId,
    });
  window.web3auth.configureAdapter(walletConnectAdapter);
  const torusAdapter = new TorusWalletAdapter({
    clientId,
  });
  window.web3auth.configureAdapter(torusAdapter);
  await window.web3auth.initModal();
})();
