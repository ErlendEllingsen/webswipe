# webswipe
**WORK IN PROGRESS**

<img src="https://i.imgur.com/CpfSE89.png" width="300px" alt="webswipe logo">

## What's webswipe?
**w**ebswipe is a pure javascript library created for creating neat looking swiping-based page transitions for web applications. This is meant to replicate the user experienced many native applications have when "swiping back" in history on apps. 

Most modern popular applications have this, including Facebook Messenger, Snapchat, Reddit, Spotify, etc.

I made this library because I after relatively extensive research found no existing decent libraries that perform this task. 

## Installation
Currently not accessible. Please wait until first release.
Alternatively clone this project. 

## To do's
As written the project is WIP and has not reached an alpha stage. Contributors are more than welcome, but the to do's on this list is primarily a list of tasks I've written for myself.



* **Done** <s>When a previous page is loaded, a callback should be called. (E.g. set further history)</s>
* Implement a `setPreviousPage`-method (see above). Should work almost as `setPage` but should set previous div.
* **Done** <s>Implement a `rapidForceThreshold`-option that should fire if a sudden but "powerful" swipe has been performed. This will cause the switch to trigger even though `pageSwitchThreshold` may not be reached.</s>
* Make sure that width of `activePage` stays the same even though moved. (Currently wrap-text triggers because element gets smaller). (Handle off screen width)
* **Done** <s>Implement touch vs mouse detection</s>
* **Done** <s>Implement touch events (currently only mouse) (See above)</s>
* Create a better looking demo
* Create Usage guide

## Contributions
Contributions are **more than welcome!** See the To do's above or add your own features. Submit a PR when you're ready to go! 

## Other similar/related work
In an effort to introduce some normal native functions to native web apps I have made some other libraries: [pull to reload for web apps](https://github.com/ErlendEllingsen/pull-to-reload) and [a tab bar system for web apps](https://github.com/ErlendEllingsen/app-tab-bar)

## License
MIT

Copyright (c) 2017 Erlend Ellingsen