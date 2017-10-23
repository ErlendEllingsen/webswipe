/**
 * webswipe is a
 * @param {object} userOptsObj 
 */

var webswipe = function(userOptsObj){

    //--- START VARS ---

    const self = this;

    this.tools = {};
    
    let opts = {
        container: 'swipeContainer',
        size: {
            default: true,
            width: null,
            height: null
        }
    };

    let motherDOM;

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

        //Fetch mother 
        motherDOM = document.getElementById(opts.container);

        //Apply body styles
        document.body.style.height = '100%';
        document.body.style.width = '100%';

        //Prepare element

        alert(JSON.stringify(self.tools.getDefaultSize()));

        //end init
    }

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