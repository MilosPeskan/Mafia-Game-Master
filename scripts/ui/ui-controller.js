export class UiController{
    /**
    * @param {HTMLElement} rootElement - Html element that contains the menu ui
    */
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    /**
    *Show menu ui
    * @param {string} [displayType = "flex"] Css display value
    */
    show(displayType = "flex"){
        this.rootElement.style.display = displayType;
    }

    /**
    *Hide menu ui 
    */
    hide(){
        this.rootElement.style.display = "none";
    }

    /**
    *Check if menu is visible 
    */
    isVisible(){
        return this.rootElement.style.display !== "none";
    }

   /**
    * Change display of an element inside of the root element
    * @param {HTMLElement} element - The element whose display is changing
    * @param {string} displayType - Css display value 
    */
    changeElementDisplayType(element, displayType){
        element.style.display = displayType;
    }

    /**
     * Adds an event listener to specified element, with specified action and a callback function
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event type ("click", "hover")
     * @param {Function} handler - Callback function executed when event is triggered
     */
    addEventListener(element, event, handler){
        element.addEventListener(event, handler);
        if(!this.listeners) this.listeners = [];
        this.listeners.push({element, event, handler});
    }

    /**
   * Cleans all event listeners
   */
    cleanup() {
        if(this.listeners) {
            this.listeners.forEach(({element, event, handler}) => {
                element.removeEventListener(event, handler);
            });
            this.listeners = [];
        }
    }
}