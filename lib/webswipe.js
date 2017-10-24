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
        pageSwitchThreshold: 0.4 //in percentage. 
    };

    //dom vars 
    let motherDOM, swipeFocusStealer, pageContainerDOM;
    
    let pageActive = null;
    let pagePrevious = null;

    //trigger vars 
    let triggerIsMoving = false;
    let triggerMoveStartX = null;
    let triggerReachedThreshold = false;

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

        return elem;
        //end initPage
    }

    this.initPreviousPage = function(DOMReference) {
        let elem = self.initPage(DOMReference);

        //Set z- layer
        elem.style.zIndex = opts.baseZIndex;

        //Previous page should be positioned left for active page
        let newLeft = '-' + (opts.size.width + opts.pageSecurityMargin) + 'px';
        elem.style.left = newLeft;
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
            if (pagePrevious === null) pagePrevious = self.initPreviousPage('pagePrevious');
            pagePrevious.innerHTML = pageActive.innerHTML;
        }

        //Set current page
        let sourceHtml = document.getElementById(DOMReference);
        if (pageActive === null) pageActive = self.initActivePage('pageActive');
        pageActive.innerHTML = sourceHtml.innerHTML;

        //Call arrange to organize changes.
        self.arrange();
        //end setPage 
    }

    this.arrange = function() {

        

        //end arrange
    }

    //-- TRIGGERS --
    this.triggers.triggerDown = function(e) {
        if (pageActive == null || pagePrevious == null) return;
        triggerIsMoving = true;
        triggerReachedThreshold = false;
        triggerMoveStartX = e.clientX;
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
        let previousPageNewLeft = '-' + ((opts.size.width + opts.pageSecurityMargin) - (movement)) + 'px';
        pagePrevious.style.left = previousPageNewLeft;

        let activePageNewLeft = 
        pageActive.style.left = movement + 'px';

        //Check threshold
        let threshold = (opts.size.width * opts.pageSwitchThreshold);
        if (movement >= threshold) {
            triggerReachedThreshold = true;
            self.triggres.triggerUp();
        }
        
        //end triggers.triggerMove
    }

    this.triggers.triggerUp = function(e) {
        if (pageActive == null || pagePrevious == null) return;
        triggerIsMoving = false;

        if (triggerReachedThreshold) {
            
        }

        triggerReachedThreshold = false;
        //end triggers.triggerUp
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