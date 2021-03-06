/**
 * webswipe Swiping UI library for mobile web apps. Create beautiful swiping transitions for your web app.
 * Dependency free.
 * @author Erlend Ellingsen <erlend.ame@gmail.com>
 * @version 1.0 
 * @license MIT
 */

 /**
  * @param {object} userOptsObj 
  */
var webswipe = function(userOptsObj){

    //--- START VARS ---

    const self = this;

    this.tools = {}, this.triggers = {};
    
    let opts = {
        container: 'swipeContainer',
        focussStealer: 'swipeFocusStealer',
        pageContainer: 'pageContainer',
        size: {
            default: true,
            width: null,
            height: null
        },
        pageSecurityMargin: 20, //Used for ensuring that elements such as wrap-text does not show
        baseZIndex: 100,
        tabIndex: 1, //Used for preventing scroll in certian cases
        pageSwitchThreshold: 0.4, //in percentage. 
        rapidForceThreshold: 0.05
    };

    //dom vars 
    let motherDOM, swipeFocusStealer, pageContainerDOM;
    
    let pageActive = null;
    let pagePrevious = null;

    let currentPageID = null;

    //trigger vars 
    let triggerIsMoving = false;
    let triggerMoveStartX = null;
    let triggerMoveLastX = null;
    let triggerReachedThreshold = false;
    let triggerReachedRapidForceThreshold = false;

    let onSwipeCallback = function(){};

    //misc vars
    let isTouchDevice = false;

    //--- END VARS ---
    //--- START METHODS ---

    this.init = function(userOptsObj) {

        //Detect environment
        isTouchDevice = self.tools.isTouchDevice();

        //Check for user present options
        if (userOptsObj != undefined || userOptsObj != null) {
            for (let prop in userOptsObj) {
                opts[prop] = userOptsObj[prop];
            }
        }

        //Check for custom webswipe dimensions
        if (opts.size.default) {
            let s = self.tools.getDefaultSize();
            opts.size.width = s.width,
            opts.size.height = s.height;
        }

        //Fetch DOM's 
        motherDOM = document.getElementById(opts.container);
        swipeFocusStealer = document.getElementById(opts.focussStealer);
        pageContainerDOM = document.getElementById(opts.pageContainer);

        //Apply body styles
        document.body.style.height = '100%';
        document.body.style.width = '100%';

        //Apply mother styles
        motherDOM.style.outline = 'none';
        motherDOM.style.position = 'relative';

        //Apply focus stealer styles & attributes
        swipeFocusStealer.setAttribute('tabindex', opts.tabIndex);
        
        //Prepare elements
        motherDOM.innerHTML = `
        <div id="pagePrevious"></div>
        <div id="pageActive"></div>
        `;

        pageContainerDOM.style.display = 'none';
        

        //Append event listeners
        let activePage = document.getElementById('pageActive');
        if (isTouchDevice) {
            //add touch "mouse" listeners
            activePage.addEventListener('touchstart', this.triggers.triggerDown);
            activePage.addEventListener('touchmove', this.triggers.triggerMove);
            
            activePage.addEventListener('touchend', this.triggers.triggerUp);
            activePage.addEventListener('touchcancel', this.triggers.triggerUp);
            
            //motherDOM.addeve, this.triggers.triggerLeave);

        } else {
            //add computer "mouse" listeners
            activePage.addEventListener('mousedown', this.triggers.triggerDown);
            activePage.addEventListener('mousemove', this.triggers.triggerMove);
            activePage.addEventListener('mouseup', this.triggers.triggerUp);
            activePage.addEventListener('mouseleave', this.triggers.triggerLeave);
        }
        


        //end init
    }

    this.initPage = function(DOMReference) {
        let elem = document.getElementById(DOMReference);

        //Apply page styles.
        elem.style.width = opts.size.width;
        elem.style.minWidth = opts.size.width;
        elem.style.height = opts.size.height; 
        elem.style.minHeight = opts.size.height; 

        elem.style.position = 'absolute';
        elem.style.wordWrap = 'break-word';
        elem.style.overflow = 'hidden';
        elem.style.whiteSpace = 'nowrap';

        return elem;
        //end initPage
    }

    this.initPreviousPage = function(DOMReference, newInnerHTML) {
        let elem = self.initPage(DOMReference);

        //Set html of previous page
        elem.innerHTML = newInnerHTML;

        //Set z- layer
        elem.style.zIndex = opts.baseZIndex;

        //Previous page should be positioned left for active page
        let newLeft = '-' + (elem.offsetWidth + opts.pageSecurityMargin) + 'px';
        elem.style.marginLeft = newLeft;

        return elem;
        //end initPreviousPage
    }

    this.initActivePage = function(DOMReference) {
        let elem = self.initPage(DOMReference);

        //Set z- layer 
        elem.style.zIndex = (opts.baseZIndex - 1);

        return elem;
        //end initActivePage
    }

    this.clearPreviousPage = function() {
        if (pagePrevious != null && pagePrevious.nodeName != undefined) pagePrevious.innerHTML = '';
        pagePrevious = null;
    }

    this.setPage = function(DOMReference, callback, useHistory) {

        //Set previous page
        if (pageActive != null && useHistory !== false) {
            pagePrevious = self.initPreviousPage('pagePrevious', pageActive.innerHTML);
        } else if (useHistory == false) {
            //We're not using history. Clear if previous set
            self.clearPreviousPage();
        }

        //Set current page
        let sourceHtml = document.getElementById(DOMReference);
        pageActive = self.initActivePage('pageActive');
        pageActive.innerHTML = sourceHtml.innerHTML;
        pageActive.setAttribute('ws-source-id', DOMReference);

        //Set onSwipeCallback
        if (callback != undefined) onSwipeCallback = callback;

        //Call arrange to organize changes.
        self.arrange();
        //end setPage 
    }
    
    this.setPreviousPage = function(DOMReference) {
        if (pageActive == null) throw "cannot call setPreviousPage before setPage (requires pageActive)";
        let sourceElem = document.getElementById(DOMReference);
        pagePrevious = self.initPreviousPage('pagePrevious', sourceElem.innerHTML);
    }

    this.arrange = function() {
        if (pageActive == null) return;

        //Change styles
        //Set pageActive-style
        pageActive.style.marginLeft = '0px';

        if (pagePrevious == null) return;

        //Set pagePrevious-style
        let newLeft = '-' + (pagePrevious.offsetWidth + opts.pageSecurityMargin) + 'px';
        pagePrevious.style.marginLeft = newLeft;

        //end arrange
    }

    this.swipeBack = function() {
        //Change content 
        let activePageDOMId = pageActive.getAttribute('ws-source-id');
        
        //Check if page previous is set. If then -> switch content.
        if (pagePrevious != null && pagePrevious.nodeName != undefined) {
            pageActive.innerHTML = pagePrevious.innerHTML;
            self.clearPreviousPage();
        }

        //Call callback
        if (typeof onSwipeCallback === 'function') onSwipeCallback();

        self.arrange();

        //end swipeBack
    }

    //-- TRIGGERS --
    this.triggers.triggerDown = function(e) {

        if (pageActive == null || pagePrevious == null) return;

        //Prevent default actions
        e.preventDefault();
        e.stopPropagation();

        let x = self.tools.getCurrentX(e);
        if (x === false) return;
        
        triggerIsMoving = true;
        triggerReachedThreshold = false;
        triggerReachedRapidForceThreshold = false;
        triggerMoveStartX = x;
        
        triggerMoveLastX = null;
        //end triggers.triggerDown
    }

    this.triggers.triggerMove = function(e) {
        //Check that pages are set
        if (pageActive == null || pagePrevious == null) return;       

        //Prevent default actions
        e.preventDefault();
        e.stopPropagation();
        
        //Check that is moving
        if (!triggerIsMoving) return false;

        let x = self.tools.getCurrentX(e);
        if (x === false) return;

        //Check that we're dragging correct way...
        if (x < triggerMoveStartX) return false; //TODO: Add support for reverse?
        let movement = x - triggerMoveStartX;


        //If movement is more than treshold, begin blocking normal behaviour 
        if (movement >= 100) {
            e.preventDefault();
            e.stopPropagation();

            //Set focus to mother dom 
            swipeFocusStealer.focus();
        }
        
        //Start moving the previous page...
        let previousPageNewLeft = '-' + ((pagePrevious.offsetWidth + opts.pageSecurityMargin) - (movement)) + 'px';
        pagePrevious.style.marginLeft = previousPageNewLeft;

        let activePageNewLeft = movement + 'px';
        pageActive.style.marginLeft = activePageNewLeft;

        //Check threshold
        let threshold = (opts.size.width * opts.pageSwitchThreshold);
        if (movement >= threshold) {
            triggerReachedThreshold = true;
        } else if (triggerMoveLastX != null) {
            //is RapidForceThreshold reached? 
            let rapidForceThreshold = (opts.size.width * opts.rapidForceThreshold);
            let lastMovement = x - triggerMoveLastX;

            if (lastMovement >= rapidForceThreshold) triggerReachedRapidForceThreshold = true;
        }

        triggerMoveLastX = x;
        
        //end triggers.triggerMove
    }

    this.triggers.triggerUp = function(e) {
        if (pageActive == null || pagePrevious == null) return;
        triggerIsMoving = false;

        //Either of thresholds reached?
        if (triggerReachedRapidForceThreshold || triggerReachedThreshold) {
            console.log(`
            triggerReachedRapidForceThreshold: ${triggerReachedRapidForceThreshold}
            triggerReachedThreshold: ${triggerReachedThreshold}
            `);
            self.swipeBack();
        } 

        //Re-adjust containers
        self.arrange();

        triggerReachedThreshold = false;
        triggerReachedRapidForceThreshold = false;
        //end triggers.triggerUp
    }

    this.triggers.triggerLeave = function(e) {
        if (pageActive == null || pagePrevious == null) return;
        if (!triggerIsMoving) return;
        
        //Shut down the current movement (reset vars and call "end" trigger)
        triggerReachedThreshold = false; 
        triggerReachedRapidForceThreshold = false;
        self.triggers.triggerUp();
    }

    

    //-- TOOLS --

    this.tools.getDefaultSize = function() {
        //Credit: https://www.w3schools.com/jsref/prop_win_innerheight.asp
        let w = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
        
        let h = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
        return {
            width: w,
            height: h
        }
    }

    this.tools.isTouchDevice = function() {
        //Credit: https://stackoverflow.com/a/4819886 (blmstr, Simon East)
        return (('ontouchstart' in window        // works on most browsers 
            || navigator.maxTouchPoints) == 0 ? false : true);       // works on IE10/11 and Surface
    }

    this.tools.getCurrentX = function(e) {
        let x;
        if (isTouchDevice) {
            if (e.touches.length <= 0) return false; //No touch points 
            let t = e.touches[0]; //Fetch first available touch point
            x = t.clientX;
        } else {
            x = e.clientX;
        }
        return x;
    }

    //--- END METHODS ---

    //Initialize the script 
    self.init(userOptsObj);

    //end webswipe
}