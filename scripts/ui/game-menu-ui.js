import { DEAD_ICON_PATH, STATUS } from "../constants.js";
import { UiController } from "./ui-controller.js";

export class GameMenu extends UiController{
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
            nightButton: this.rootElement.querySelector("#night-button"),
            backButton: this.rootElement.querySelector("#cancel-manager"),
            lynchButton: this.rootElement.querySelector("#lynch"),
            playerCardHolder: this.rootElement.querySelector("#player-holder"),
            popupWindow: this.rootElement.querySelector("#popup"),
            popupText: this.rootElement.querySelector("#popup-text"),
            popupButton: this.rootElement.querySelector("#popup-button")
        };
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.addEventListener(this.elements.nightButton, "click", ()=>{
            this.handleNightClicked();
        });
        this.addEventListener(this.elements.backButton, "click", ()=>{
            this.onBackClick?.();
        });
        this.addEventListener(this.elements.lynchButton, "click", () =>{
            this.onLynchClicked?.();
        });
        this.addEventListener(this.elements.popupButton, "click", () =>{
            this.onPopupClicked();
        });
        this.addEventListener(this.elements.playerCardHolder, "click", (e) => {
            if(e.target.classList.contains("player-card")){
                const div = e.target.closest("div");
                this.onPlayerCardClicked(div._player);
            }
        });
    }

    /**
     * Removes judge protections and sends signal for night to begin
     */
    handleNightClicked(){
        this.gameState.removeJudgedStatus();
        this.onNightClicked?.();
    }

    /**
     * Displays all players in a dynamic grid
     */
    displayPlayers(){
        this.elements.playerCardHolder.innerHTML = "";

        let columnsPerRow = 0;
        if(window.innerWidth > 768){
            columnsPerRow = this.gameState.players.length > 18 ? 5 : 6;
        } else columnsPerRow = 2;
        this.elements.playerCardHolder.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;

        for(const player of this.gameState.players){
            const card = this.createPlayerCard(player);
            this.elements.playerCardHolder.appendChild(card);
        }
    }

    /**
     * Creates player card element.
     * Gives dead players special player icon.
     * @param {import("../player-manager.js").PlayerClass} player Player instance
     * @returns {HTMLElement} player card element
     */
    createPlayerCard(player){
        const card = document.createElement("div");
        card.classList.add("player-card");
        card.dataset.name = player.name;
        card._player = player;

        const icon = document.createElement("img");
        icon.classList.add("player-icon");
        if(player.checkIfPlayerAlive()){
            icon.src = player.iconPath;
        } else icon.src = DEAD_ICON_PATH;

        const name = document.createElement("h3");
        name.classList.add("nametag");
        name.textContent = player.name;

        card.append(icon, name);

        return card;
    }

    /**
     * Calls popup ui to display lynch summary
     */
    lynchPopup(){
        this.elements.popupText.textContent = this.gameState.handleLynch();
        this.popup();
    }

    /**
     * Calls popup ui to display night summary
     * @param {string} message Html or text for night summary  
     */
    nightPopup(message){
        this.elements.popupText.innerHTML = message;
        this.popup();
    }

    /**
     * Changes popup visibility
     * @param {string} displayType Css display type 
     */
    popup(displayType = "block"){
        this.elements.popupWindow.style.display = displayType;
    }

    /** Closes popup ui and calls rerendering of player cards */
    onPopupClicked(){
        this.popup("none");
        this.displayPlayers();
    }
}