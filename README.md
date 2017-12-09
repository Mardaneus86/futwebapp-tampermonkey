# FUT Web App - TamperMonkey scripts

[![Join the chat at https://gitter.im/futwebapp-tampermonkey/Lobby](https://badges.gitter.im/futwebapp-tampermonkey/Lobby.svg)](https://gitter.im/futwebapp-tampermonkey/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

FIFA 18's companion app for FIFA Ultimate Team, the FUT 18 Web App, is a website that let's you trade and manage your team on the go.

This TamperMonkey script is meant to enhance the FUT 18 Web App experience. You can install the scripts following the instructions below. Afterwards you will get a settings button on the bottom right of the web app, where you can enable every feature by itself. The scripts provide a certain degree of customization possibilities.

:warning: Using these scripts is at your own risk. EA might (temp-)ban you for automating parts of their Web App.

:bangbang: Do not request autobuyer features. Because they are considered to be cheating, it will not be added.

I started this project to learn about reverse engineering big Javascript codebases.

If you benefit from this project, you can buy me a beer :beers: :+1:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VTXU8XUY8JS94)

## Separate scripts
To find the old version of the scripts that you could install separately, please refer to the [separate-scripts tag](https://github.com/Mardaneus86/futwebapp-tampermonkey/tree/separate-scripts). Keep in mind that those scripts are no longer actively maintained.

## Installation
Make sure you have user scripts enabled in your browser (these instructions refer to the latest versions of the browser):

* Firefox - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=firefox).
* Chrome - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome).
* Opera - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=opera).
* Safari - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=safari).
* Dolphin - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=dolphin).
* UC Browser - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=ucweb).

### Install scripts
Install the scripts via [OpenUserJS][install-script] (this script has not been uploaded to OpenUserJS yet). Or find the latest version and release notes at the [releases page](https://github.com/Mardaneus86/futwebapp-tampermonkey/releases).

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

Remember to change the path after `@require` to the folder where you cloned the repository. It should point to the generated `bundle.js` in the `dist` folder.

## Contribute
Add a feature request or bug to the [issue list][issue-list] before doing a PR in order to discuss it before implementing a fix. Issues that are marked with the `help wanted` have priority if you want to help.

[issue-list]: https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
[install-script]: https://openuserjs.org/install/Mardaneus86/FUT_Enhancer.user.js
