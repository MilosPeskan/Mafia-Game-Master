import { ROLE_REVEAL_TIMER } from "../constants.js";

export class HoldButton {
    /**
     * @param {HTMLElement} button - HTML element for the button 
     * @param {number} [holdTime=ROLE_REVEAL_TIMER] - Time required to hold in miliseconds
     */
    constructor(button, holdTime = ROLE_REVEAL_TIMER) {
        this.button = button;
        this.holdTime = holdTime;
        
        this.isHolding = false;
        this.startTime = null;
        this.holdTimer = null;
        this.progressInterval = null;
        
        /**
         * Function that triggers when hold is complete
         * @type {(() => void) | null}
         */
        this.onComplete = null;

        /** 
         * Function that triggers on progress update
         * @type {(progress: number) => void | null} 
        */
        this.onProgress = null;
        
        this.attachEventListeners();
    }

    /**
     * Attaches mouse and touch event listeners to the button
     */
    attachEventListeners() {
        // Click events
        this.button.addEventListener('mousedown', (e) => {
            this.startHold(e);
        });
    
        this.button.addEventListener('mouseup', () => {
            this.cancelHold();
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.cancelHold();
        });

        // Touch events
        this.button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startHold(e);
        });
        
        this.button.addEventListener('touchend', () => {
            this.cancelHold();
        });
        
        this.button.addEventListener('touchcancel', () => {
            this.cancelHold();
        });
    }

    /**
     * Start hold and update progress
     * @param {MouseEvent | TouchEvent} event - Trigger the event
     */
    startHold(event) {
        if (this.isHolding) return;
        
        this.isHolding = true;
        this.button.classList.add("holding");
        this.startTime = Date.now();
        
        // Update progress for updating ui
        this.progressInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const progress = Math.min((elapsed / this.holdTime) * 100, 100);
            
            if (this.onProgress) {
                this.onProgress(progress);
            }
        }, 50);

        // Trigger completion on time elapsed
        this.holdTimer = setTimeout(() => {
            this.completeHold();
        }, this.holdTime);
    }

    /**
     * Cancel current hold action and reset progress
     */
    cancelHold() {
        if (!this.isHolding) return;
                
        this.isHolding = false;
        this.button.classList.remove("holding");
        
        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        if (this.onProgress) {
            this.onProgress(0);
        }
    }

    /**
     * Complete hold and trigger onComplete callback
     */
    completeHold() {
        this.isHolding = false;
        this.button.classList.remove("holding");
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        if (this.onComplete) {
            this.onComplete();
        }
    }

    destroy() {
        this.cancelHold();
        // Cleanup event listeners ako treba
    }
}