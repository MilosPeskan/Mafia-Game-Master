import { UiController } from "./ui-controller.js";
import { ROLES } from "../data.js";
import { MESSAGES, UI_TEXT } from "../constants.js"
import { HoldButton } from "../utils/hold-button.js";

export class RoleRevealMenu extends UiController{
    /**
     * @param {HTMLElement} rootElement - Html element that contains the menu ui
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(rootElement, gameState){
        super(rootElement);

        this.gameState = gameState;
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Queries and stores all required DOM elements for the menu
     */
    initializeElements(){
        this.elements = {
            player: this.rootElement.querySelector("#player"),
            title: this.rootElement.querySelector("#role-menu-title"),
            name: this.rootElement.querySelector("#display-name"),
            alignment: this.rootElement.querySelector("#display-alignment"),
            desc: this.rootElement.querySelector("#display-desc"),
            executionTarget: this.rootElement.querySelector("#meta"),
            roleHolder: this.rootElement.querySelector("#role-holder"),
            backButton: this.rootElement.querySelector("#back"),
            revealButton: this.rootElement.querySelector("#reveal-role"),
            hideButton: this.rootElement.querySelector("#hide-role"),
            holdButtonHolder: this.rootElement.querySelector("#hold-button-holder"),
            progressMeter: this.rootElement.querySelector("#progress-meter")
        }
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.setupHoldButton();

        this.addEventListener(this.elements.hideButton, "pointerdown", ()=>{
            this.displayPlayerToGo();
        })

        this.addEventListener(this.elements.backButton, "click", ()=>{
            this.handleBackClick();
        })
    }

    /**
     * Handle back navigation with confirmation and resets game state
     */
    handleBackClick(){
        if (confirm(MESSAGES.BACK_CONFIRM)) {
            this.gameState.resetPlayerIndex();
            this.onBackClick?.();
        }
    }

    /**
     * Create instance of hold button and bind callbacks
     */
    setupHoldButton() {
        this.holdButton = new HoldButton(this.elements.revealButton);

        this.holdButton.onComplete = () => {
            this.handleRoleReveal();
        };

        this.holdButton.onProgress = (progress) => {
            this.updateProgress(progress);
        };
    }

    /**
     * Update ui to fill progress meter
     * @param {number} progress - Hold button progress value
     */
    updateProgress(progress) {
        this.elements.progressMeter.style.height = `${progress}%`;
    }

    /**
     * Handle role reveal logic on hold button complete and update ui
     */
    handleRoleReveal(){
        this.elements.progressMeter.style.height = "0%";

        if(!this.gameState.hasMorePlayers()){
            this.onRevealComplete?.();
            return;
        }
        this.displayRoleDetails();
        this.changeElementDisplayType(this.elements.roleHolder, "block");
        this.changeElementDisplayType(this.elements.hideButton, "block");
        this.changeElementDisplayType(this.elements.holdButtonHolder, "none");
        this.gameState.nextPlayer();
        this.elements.roleHolder.classList.add('revealed');
    }

    /**
     * Update ui elements to display role data
     */
    displayRoleDetails(){
        this.elements.title.textContent = UI_TEXT.REVEAL_INSTRUCTION;
        const currentRole = this.gameState.getCurrentRole();
        const roleData = ROLES[currentRole];

        this.elements.name.textContent = roleData.role;
        this.elements.alignment.textContent = roleData.alignment;
        this.elements.desc.textContent = roleData.description;

        if(this.gameState.isExecutioner()){
            this.gameState.generateExecutionTarget();
            this.elements.executionTarget.textContent = `Tvoja meta je: ${this.gameState.getExecutionTarget()}`;
            this.changeElementDisplayType(this.elements.executionTarget, "block");
        }
    }

    /**
     * Update ui to show the next player to learn their role
     */
    displayPlayerToGo(){
        this.changeElementDisplayType(this.elements.executionTarget, "none");
        if(this.gameState.hasMorePlayers()){
            this.elements.title.textContent = UI_TEXT.HIDE_INSTRUCTION;
            const playerName = this.gameState.getCurrentPlayer();
            this.elements.player.textContent = playerName;
        }
        else {
            this.elements.title.textContent = UI_TEXT.HIDE_INSTRUCTION_LAST;
            this.elements.player.textContent = UI_TEXT.NARRATOR;
        }
        this.changeElementDisplayType(this.elements.roleHolder, "none");
        this.changeElementDisplayType(this.elements.hideButton, "none");
        this.changeElementDisplayType(this.elements.holdButtonHolder, "block");
    }

    /**
     * Override base show method
     * Reset player index and display first player
     * @param {string} displayType - Css display value
     */
    show(displayType){
        super.show(displayType);
        this.gameState.resetPlayerIndex();
        this.displayPlayerToGo();
    }
}