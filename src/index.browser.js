'use strict'

import './assets/css/styles.css'
import './assets/css/clear.browser.css'

const includesMyMoneroAPI = (url) => {
  // regex to check for mymonero.com in url
  const regex = /mymonero\.com/
  return regex.test(url)
}

const getServerUrl = () => {
  const url = window._env_.MYMONERO_WEB_SERVER_URL
  if (!url) {
    console.log("No server URL set. Setting URL to localhost.")
    return "localhost"
  }

  if (includesMyMoneroAPI(url)) {
    console.log("Centralized Light Wallet API detected. Don't do that. Self-Host your own Monero Light Wallet Server using: https://github.com/vtnerd/monero-lws/ Setting URL to localhost in the meantime.")
    return "localhost"
  }

  console.log("Server URL set to: " + url)
  return url
}

window.BootApp = async function () { // encased in a function to prevent scope being lost/freed on mobile
  const coreBridgeInstance = await require('@mymonero/mymonero-app-bridge')({})
  const isMobile = ('ontouchstart' in document.documentElement) // an approximation for 'mobile'
  const config = {
    nettype: parseInt(window._env_.MYMONERO_WEB_NETTYPE) || 0, // critical setting 0 - MAINNET, 2 - STAGENET
    apiUrl: getServerUrl(),
    version: "1.3.2",
    name: "MyMonero-Self-Hosted",
    isDebug: false,
    isMobile: isMobile,
    TabBarView_thickness: isMobile ? 48 : 79,
    appDownloadLink_domainAndPath: 'https://mymonero.com',
    appRepoLink: 'https://www.github.com/mymonero/mymonero-app-js/releases/latest',
    HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false,
    monero_utils: coreBridgeInstance
  }
  // context
  const context = require('./MainWindow/Models/index_context.browser').NewHydratedContext(config)
  window.MyMonero_context = context
  // configure native UI elements
  document.addEventListener('touchstart', function () {}, true) // to allow :active styles to work in your CSS on a page in Mobile Safari:
  //
  if (isMobile) {
    // disable tap -> click delay on mobile browsers
    const attachFastClick = require('fastclick')
    attachFastClick.attach(document.body)
    //
    // when window resized on mobile (i.e. possibly when device rotated -
    // though we don't support that yet
    // if(/Android/.test(navigator.appVersion)) {
    const commonComponents_forms = require('./MMAppUICommonComponents/forms.web')
    window.addEventListener('resize', function () {
      console.log('💬  Window resized')
      commonComponents_forms.ScrollCurrentFormElementIntoView()
    })
    // }
  }
  { // root view
    const RootView = require('./MainWindow/Views/RootView.web')
    const rootView = new RootView({}, context) // hang onto reference
    rootView.superview = null // just to be explicit; however we will set a .superlayer
    // manually attach the rootView to the DOM and specify view's usual managed reference(s)
    const superlayer = document.body
    rootView.superlayer = superlayer
    superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
  }
  { // and remove the loader (possibly fade this out)
    const el = document.getElementById('loading-spinner')
    el.parentNode.removeChild(el)
  }
}
window.BootApp()
