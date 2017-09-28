# FUT Web App - TamperMonkey/GreaseMonkey scripts
FIFA 18's companion app for FIFA Ultimate Team, the FUT 18 Web App, is a website that let's you trade and manage your team on the go.

This collection of TamperMonkey/GreaseMonkey scripts are meant to enhance the FUT 18 Web App experience. You can install the individual scripts from below, depending on which features you want. Most scripts can be run independent of each other.

:warning: Using these scripts is at your own risk. EA might (temp-)ban you for automating parts of their Web App.

I started this project to learn about reverse engineering big Javascript codebases.

## Installation

1. Make sure you have user scripts enabled in your browser (these instructions refer to the latest versions of the browser):

	* Firefox - install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).
	* Chrome - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome).
	* Opera - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=opera) or [Violent Monkey](https://addons.opera.com/en/extensions/details/violent-monkey/).
	* Safari - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=safari).
	* Dolphin - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=dolphin).
	* UC Browser - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=ucweb).

2. Get information or install:
	* Install a script directly from GitHub by clicking on the "install" link in the table below.

	| Userscript Wiki                        | Depending<br>Scripts | Direct<br>Install | OpenUserJS<br>Install |
	|----------------------------------------|:------------------:|:------------------:|:----------:|
	| [FUT Tampermonkey Settings][settings-wiki] | FUT Remove Sold Auctions | [install][settings-install] | [install][settings-install-openuserjs] |
  
	| Userscript Wiki                        | Direct<br>Install | OpenUserJS<br>Install | Created    | Updated    |
	|----------------------------------------|:------------------:|:----------:|:----------:|:----------:|
	| [FUT Instant Transfer Search][instant-transfer-search-wiki] | [install][instant-transfer-search-install] | [install][instant-transfer-search-install-openuserjs] | 2017.09.22 | 2017.09.23 |
	| [FUT Show Futbin Player Price][show-futbin-player-price-wiki] | [install][show-futbin-player-price-install] | [install][show-futbin-player-price-install-openuserjs] | 2017.09.23 | 2017.09.28 |
	| [FUT Increase Transfer Search List Size][transfer-search-increase-list-size-wiki] | [install][transfer-search-increase-list-size-install] | [install][transfer-search-increase-list-size-install-openuserjs] | 2017.09.23 | 2017.09.23 |
	| [FUT Auto Relist Expired Auctions][auto-relist-expired-auctions-wiki] | [install][auto-relist-expired-auctions-install] | [install][auto-relist-expired-auctions-install-openuserjs] | 2017.09.24 | 2017.09.24 |
	| [FUT Remove Sold Auctions][remove-sold-auctions-wiki] | [install][remove-sold-auctions-install] | [install][remove-sold-auctions-install-openuserjs] | 2017.09.24 | 2017.09.28 |
	| [FUT Search BIN Price][search-bin-price-wiki] | [install][search-bin-price-install] | [install][search-bin-price-install-openuserjs] | 2017.09.24 | 2017.09.25 |
	| [FUT Refresh Transfer List][refresh-transfer-list-wiki] | [install][refresh-transfer-list-install] | [install][refresh-transfer-list-install-openuserjs] | 2017.09.25 | 2017.09.25 |
	| [FUT Show Contract and Fitness][show-contract-fitness-wiki] | [install][show-contract-fitness-install] | [install][show-contract-fitness-install-openuserjs] | 2017.09.25 | 2017.09.25 |
	| [FUT Confirm Buy Now Dialog][confirm-buynow-dialog-wiki] | [install][confirm-buynow-dialog-install] | [install][confirm-buynow-dialog-install-openuserjs] | 2017.09.25 | 2017.09.25 |

## Feature requests
If you feel there are missing features, feel free to add a request to the [issue list][issue-list]. Make sure to provide the necessary details, or even a mockup of what the feature would look like.

## Issues
File a bug report in the [issue list][issue-list].

## Contribute
Add a feature request or bug to the [issue list][issue-list] before doing a PR in order to discuss it before implementing a fix. Issues that are marked with the `help wanted` have priority if you want to help.

## Donation
If you benefit from this project, you can buy me a beer :beers: :+1:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VTXU8XUY8JS94)

[issue-list]: https://github.com/Mardaneus86/futwebapp-tampermonkey/issues

[instant-transfer-search-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Instant-Transfer-Search
[instant-transfer-search-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/instant-transfer-search.user.js
[instant-transfer-search-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Instant_Transfer_Search.user.js

[show-futbin-player-price-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Show-Futbin-Player-Price
[show-futbin-player-price-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/show-futbin-player-price.user.js
[show-futbin-player-price-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Show_Futbin_player_price.user.js

[transfer-search-increase-list-size-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Increase-Transfer-Search-List-Size
[transfer-search-increase-list-size-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/transfer-search-increase-list-size.user.js
[transfer-search-increase-list-size-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Increase_Transfer_Search_List_Size.user.js

[auto-relist-expired-auctions-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Auto-Relist-Expired-Auctions
[auto-relist-expired-auctions-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/auto-relist-expired-auctions.user.js
[auto-relist-expired-auctions-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Auto_Relist_Unsold_Transfers.user.js

[remove-sold-auctions-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Remove-Sold-Auctions
[remove-sold-auctions-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/remove-sold-auctions.user.js
[remove-sold-auctions-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Auto_Remove_Sold_Auctions.user.js

[search-bin-price-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Search-Bin-Price
[search-bin-price-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/search-bin-price.user.js
[search-bin-price-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Search_BIN.user.js

[refresh-transfer-list-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Refresh-Transfer-List
[refresh-transfer-list-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/refresh-transfer-list.user.js
[refresh-transfer-list-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Refresh_Transfer_List.user.js

[show-contract-fitness-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Show-Contract-Fitness
[show-contract-fitness-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/show-contract-fitness.user.js
[show-contract-fitness-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Show_Contracts_and_Fitness.user.js

[confirm-buynow-dialog-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Confirm-BuyNow-Dialog
[confirm-buynow-dialog-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/confirm-buynow-dialog.user.js
[confirm-buynow-dialog-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Confirm_Buy_Now_Dialog.user.js

[settings-wiki]: https://github.com/Mardaneus86/futwebapp-tampermonkey/wiki/Settings
[settings-install]: https://github.com/Mardaneus86/futwebapp-tampermonkey/raw/master/settings.user.js
[settings-install-openuserjs]: https://openuserjs.org/install/Mardaneus86/FUT_Settings_Page.user.js
