# FUT Web App - TamperMonkey scripts

[![Join the chat at https://gitter.im/futwebapp-tampermonkey/Lobby](https://badges.gitter.im/futwebapp-tampermonkey/Lobby.svg)](https://gitter.im/futwebapp-tampermonkey/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

FIFA 19's companion app for FIFA Ultimate Team, the FUT 19 Web App, is a website that let's you trade and manage your team on the go.

This TamperMonkey script is meant to enhance the FUT 19 Web App experience. You can install the script following the instructions below. Afterwards you will get a settings button on the bottom right of the web app, where you can enable every feature by itself. The script provides a certain degree of customization possibilities.

:warning: Using this script is at your own risk. EA might (temp-)ban you for altering parts of their Web App.

:bangbang: Do not request autobuyer features. Because they are considered to be cheating, it will not be added.

I started this project to learn about reverse engineering big Javascript codebases.

If you benefit from this project, you can buy me a beer :beers: :+1:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/timklingeleers)

## Features
- [x] Futbin integration
  - [x] Show Futbin prices on all player cards throughout the app
  - [x] Show link to player on Futbin
  - [x] Mark bargains (BIN price lower then Futbin value)
- [x] Find minimum BIN value of players
- [x] Refresh transfer list
- [x] Increase transfer list size
- [x] Extra card information (contracts, fitness)
- [x] Total coin value for cards on the transfer list

## Installation
Make sure you have user scripts enabled in your browser (these instructions refer to the latest versions of the browser):

* Firefox - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=firefox). :warning: Has issues loading properly (see issue #115)
* Chrome - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome).
* Opera - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=opera).
* Safari - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=safari).
* Dolphin - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=dolphin).
* UC Browser - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=ucweb).

### Install scripts
Install the scripts via [OpenUserJS][install-script]. Or find the latest version and release notes at the [releases page](https://github.com/Mardaneus86/futwebapp-tampermonkey/releases).

## Feature requests
If you feel there are missing features, feel free to add a request to the [issue list][issue-list]. Make sure to provide the necessary details, or even a mockup of what the feature would look like.

## Issues
File a bug report in the [issue list][issue-list].

## Developing
Clone this repository and execute:
```
npm install
```

To start the bundling process and linting process, execute:
```
npm start
```

Make sure to enable `Allow access to file URLs` in `chrome://extensions/` for Tampermonkey, and add the following script snippet:
```
// ==UserScript==
// @name        FUT Enhancer
// @version     0.1
// @description
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       window.focus
// @require     file:///<path to repo>/dist/fut-enhancer.user.js
// @connect     ea.com
// @connect     maker.ifttt.com
// @connect     futbin.com
// ==/UserScript==
```

Remember to change the path after `@require` to the folder where you cloned the repository. It should point to the generated `fut-enhancer.user.js` in the `dist` folder.

## Contribute
Add a feature request or bug to the [issue list][issue-list] before doing a PR in order to discuss it before implementing a fix. Issues that are marked with the `help wanted` have priority if you want to help.

[issue-list]: https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
[install-script]: https://openuserjs.org/install/Mardaneus86/FUT_Enhancer.user.js
