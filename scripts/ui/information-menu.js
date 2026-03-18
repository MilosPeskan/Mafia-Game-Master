import { ROLE_IDS } from "../constants.js";
import { UiController } from "./ui-controller.js";

export class InfoMenu extends UiController{
    /**
     * @param {HTMLElement} rootElement - Html element that contains the menu ui
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(rootElement, gameState){
        super(rootElement),
        this.gameState = gameState;

        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Queries and stores all required DOM elements for the menu
     */
    initializeElements(){
        this.elements = {
            infoRole: this.rootElement.querySelector("#info-holder"),
            name: this.rootElement.querySelector("#info-name"),
            role: this.rootElement.querySelector("#info-role"),
            alignment: this.rootElement.querySelector("#info-alignment"),
            desc: this.rootElement.querySelector("#info-desc"),
            target: this.rootElement.querySelector("#info-target"),
            backButton: this.rootElement.querySelector("#back-to-manager")
        }
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.addEventListener(this.elements.backButton, "click", ()=>{
            this.onBackClicked?.();
        })
    }

    displayInfo(player){
        this.displaySearched(player);

        if(player.roleId == ROLE_IDS.DZELAT){
            this.elements.target.style.display = "block";
            this.elements.target.textContent = `Tvoja meta je: ${this.gameState.getExecutionTarget()}`;
        }
    }

    displaySearched(player){
        this.elements.name.textContent = player.name;
        this.elements.role.textContent = player.getRoleName();
        this.elements.alignment.textContent = player.getRoleAlignment();
        this.elements.desc.textContent = player.getRoleDescription();
    }

    show(displayType){
        super.show(displayType);
        this.elements.target.style.display = "none";
    }
}