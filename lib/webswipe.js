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

    //--- END VARS ---
    //--- START METHODS ---

    this.init = function(userOptsObj) {

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
        

        //Append event listeners
        motherDOM.addEventListener('mousedown', this.triggers.triggerDown);
        motherDOM.addEventListener('mousemove', this.triggers.triggerMove);
        motherDOM.addEventListener('mouseup', this.triggers.triggerUp);
        motherDOM.addEventListener('mouseleave', this.triggers.triggerLeave);

        //Prepare elements
        motherDOM.innerHTML = `
        <div id="pagePrevious"></div>
        <div id="pageActive"></div>
        `;

        pageContainerDOM.style.display = 'none';

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
        console.log(newLeft);

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

    this.setPage = function(DOMReference, useHistory) {

        //Set previous page
        if (pageActive != null && useHistory !== false) {
            pagePrevious = self.initPreviousPage('pagePrevious', pageActive.innerHTML);
        }

        //Set current page
        let sourceHtml = document.getElementById(DOMReference);
        pageActive = self.initActivePage('pageActive');
        pageActive.innerHTML = sourceHtml.innerHTML;
        pageActive.setAttribute('ws-source-id', DOMReference);

        //Call arrange to organize changes.
        self.arrange();
        //end setPage 
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
        
        if (activePageDOMId == 'page2') {
            self.setPage('page1');
        }

        self.arrange();

        //end swipeBack
    }

    //-- TRIGGERS --
    this.triggers.triggerDown = function(e) {
        if (pageActive == null || pagePrevious == null) return;
        triggerIsMoving = true;
        triggerReachedThreshold = false;
        triggerReachedRapidForceThreshold = false;
        triggerMoveStartX = e.clientX;
        triggerMoveLastX = null;
        console.log(triggerMoveStartX);
        //end triggers.triggerDown
    }

    this.triggers.triggerMove = function(e) {
        //Check that pages are set
        if (pageActive == null || pagePrevious == null) return;        
        //Check that is moving
        if (!triggerIsMoving) return false;

        let x = e.clientX;

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

    //--- END METHODS ---

    //Initialize the script 
    self.init(userOptsObj);

    //end webswipe
}