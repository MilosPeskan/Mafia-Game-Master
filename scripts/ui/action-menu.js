import { ROLES } from "../data.js";
import { UiController } from "./ui-controller.js";
import { ROLE_BEHAVIOURS, getValidTargets } from "../utils/role-behaviours.js";

export class ActionMenu extends UiController {
    /**
     * @param {HTMLElement} rootElement - Html element that contains the menu ui
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(rootElement, gameState) {
        super(rootElement);
        this.gameState = gameState;
        this.currentRole = null;
        this.currentPlayer = null;
        this.selectedTarget = null;
        this.players = null;
        this.secondaryAction = "";
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Queries and stores all required DOM elements for the menu
     */
    initializeElements() {
        this.elements = {
            roleTitle: this.rootElement.querySelector("#role-title"),
            roleDescription: this.rootElement.querySelector("#role-description"),
            playerHolder: this.rootElement.querySelector("#player-button-holder"),
            targetHolder: this.rootElement.querySelector("#target-holder"),
            confirmButton: this.rootElement.querySelector("#confirm-action"),
            secondaryButton: this.rootElement.querySelector("#secondary-action"),
            skipButton: this.rootElement.querySelector("#skip-action"),
            resultDisplay: this.rootElement.querySelector("#action-result"),
            popupWindow: this.rootElement.querySelector("#popup"),
            popupText: this.rootElement.querySelector("#popup-text"),
            popupButton: this.rootElement.querySelector("#popup-button")
        };
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners() {
        this.addEventListener(this.elements.targetHolder, "click", (e) => {
            if (e.target.classList.contains("target-card") || e.target.closest(".target-card")) {
                const card = e.target.classList.contains("target-card") 
                    ? e.target 
                    : e.target.closest(".target-card");
                this.selectTarget(card);
            }
        });

        this.addEventListener(this.elements.playerHolder, "click", (e) => {
            if (e.target.classList.contains("current-player-card") || e.target.closest(".current-player-card")) {
                const card = e.target.classList.contains("current-player-card") 
                    ? e.target 
                    : e.target.closest(".current-player-card");
                this.selectPlayer(card);
            }
        });

        this.addEventListener(this.elements.confirmButton, "click", () => {
            this.handleConfirm();
        });

        this.addEventListener(this.elements.secondaryButton, "click", () => {
            this.handleSecondary();
        });

        this.addEventListener(this.elements.skipButton, "click", () => {
            this.handleSkip();
        });
        this.addEventListener(this.elements.popupButton, "click", () =>{
            this.onPopupClicked();
        });
    }

    /**
     * Displays current role name and action, resets action button controlls, 
     * and calls for generation of valid targets
     * 
     * For roles where players act individualy generates player selection buttons
     * @param {number} roleId Key value from ROLES dictionary 
     * @param {import("../player-manager.js").PlayerClass[]} players List of player instances
     */
    setupAction(roleId, players) {
        this.currentRole = roleId;
        this.players = players;
        this.currentPlayer = this.players.find(p => p.isAlive);
        this.selectedTarget = null;

        const roleData = ROLES[roleId];
        const behaviour = ROLE_BEHAVIOURS[Number(roleId)];
        
        this.elements.roleTitle.textContent = `${roleData.role}`;

        this.elements.roleDescription.textContent = behaviour.name;

        this.elements.playerHolder.innerHTML = "";

        if(!behaviour.allForOne){
            this.generatePlayerButtons(players);
        }

        this.elements.skipButton.style.display = "block";
        this.elements.secondaryButton.style.display = "none"
        this.elements.confirmButton.disabled = false;
        this.elements.skipButton.disabled = false;
        this.elements.secondaryButton.disabled = false;

        if(behaviour.needsChoice){
            this.secondaryAction = behaviour.secondaryAction;
            this.elements.secondaryButton.textContent = behaviour.secondaryName || "Druga akcija";
            this.elements.secondaryButton.style.display = "block";
        }

        this.displayTargets();
    }

    /**
     * Generates current roles player buttons and disabels them if player is dead or blocked
     * 
     * Stores all players in list and picks first valid player to act
     * @param {import("../player-manager.js").PlayerClass[]} players List of player instances
     */
    generatePlayerButtons(players){
        players.forEach(player => {
            const card = document.createElement("button");
            card.classList.add("current-player-card");
            card.dataset.playerId = player.id;
            card._player = player;

            const name = document.createElement("h4");
            name.classList.add("player-name");
            name.textContent = player.name;

            // Disable selectiong if player is dead or blocked
            if (!player.checkIfPlayerAlive()) {
                card.classList.add("dead-player");
                card.disabled = true;
                const deadLabel = document.createElement("span");
                deadLabel.className = "dead-label";
                deadLabel.textContent = "†";
                player.acted = true;
                name.prepend(deadLabel);
            } else if(player.checkIfPlayerBlocked()){
                card.classList.add("blocked-player");
                card.disabled = true;
                const blockLabel = document.createElement("span");
                blockLabel.className = "block-label";
                blockLabel.textContent = "⦸";
                player.acted = true;
                name.prepend(blockLabel);
            }

            card.append(name);
            this.elements.playerHolder.appendChild(card);
        });
        const allCards = [...this.elements.playerHolder.querySelectorAll(".current-player-card")];
        const next = this.findFirstCanAct(allCards);
        if (next) this.selectPlayer(next);
    }

    /**
     * Generates all valid targets for action in a dynamic grid
     * 
     * Calls popup to show parasite new role if successfuly parasited
     */
    displayTargets() {        
        this.elements.targetHolder.innerHTML = "";

        // Uses helper function from role-behaviours
        const targets = getValidTargets(this.currentRole, this.currentPlayer, this.gameState);

        if (targets.length === 0) {
            this.elements.targetHolder.innerHTML = "<p>Nema dostupnih meta</p>";
            return;
        }

        if (this.currentPlayer.successParasite){
            const message = `Vaša nova uloga je ${this.currentPlayer.getRoleName()}`;
            this.displayPopup(message);
            this.currentPlayer.successParasite = false;
            this.currentPlayer.wasParasite = true;
            return;
        }

        const columnsPerRow = targets.length > 18 ? 5 : 6;
        this.elements.targetHolder.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;

        targets.forEach(player => {
            const card = this.createTargetCard(player);
            this.elements.targetHolder.appendChild(card);
        });
    }

    /**
     * Generates player target card
     * @param {import("../player-manager.js").PlayerClass[]} player Player instance
     * @returns {HTMLElement} Player target card
     */
    createTargetCard(player) {
        const card = document.createElement("div");
        card.classList.add("target-card");
        card.dataset.playerId = player.id;
        card._player = player;

        const icon = document.createElement("img");
        icon.classList.add("target-icon");
        icon.src = player.iconPath;

        const name = document.createElement("h4");
        name.classList.add("target-name");
        name.textContent = player.name;

        // Add indicator for dead players
        if (!player.isAlive) {
            card.classList.add("dead-player");
            const deadLabel = document.createElement("span");
            deadLabel.className = "dead-label";
            deadLabel.textContent = "†";
            name.prepend(deadLabel);
        }

        card.append(icon, name);
        return card;
    }

    /**
     * Handles player actor card selection and rerenders player action cards to show new selection
     * 
     * Rerender targets to show valid targets for specific player instance
     * @param {HTMLElement} card Player actor card
     */
    selectPlayer(card) {
        // Remove previous selection
        const allCards = this.elements.playerHolder.querySelectorAll(".current-player-card");
        allCards.forEach(c => c.classList.remove("selected"));
        
        // Add new selection
        card.classList.add("selected");
        this.currentPlayer = card._player;
        this.displayTargets();
    }

    /**
     * Handles target card selection and rerenders target cards to show new selection
     * @param {HTMLElement} card Player target card
     */
    selectTarget(card) {
        // Remove previous selection
        const allCards = this.elements.targetHolder.querySelectorAll(".target-card");
        allCards.forEach(c => c.classList.remove("selected"));

        // Add new selection
        card.classList.add("selected");
        this.selectedTarget = card._player;
    }

    /**
     * Executes primary role action based on current selection
     */
    async handleConfirm() {
        const behaviour = ROLE_BEHAVIOURS[Number(this.currentRole)];
        
        if (!behaviour) {
            this.displayResult("Ova uloga nema noćnu akciju");
            return;
        }

        // Check if target needed
        if (!behaviour.needsTarget && behaviour.execute) {
            const result = behaviour.execute(
                this.currentPlayer,
                null,
                this.gameState
            );
            
            this.handleActionResult(result);
            return;
        }

        if (!this.selectedTarget) {
            this.displayResult("Molimo izaberite metu!");
            return;
        }

        try {
            const result = behaviour.execute(
                this.currentPlayer,
                this.selectedTarget,
                this.gameState
            );

            this.elements.confirmButton.disabled = true;
            this.elements.skipButton.disabled = true;
            this.handleActionResult(result, behaviour);
            
        } catch(error) {
            console.error("Greška pri izvršavanju akcije:", error);
            this.displayResult("Došlo je do greške!");
        }
    }

    /**
     * Executes secondary role action based on current selection
     */
    handleSecondary() {
        const behaviour = ROLE_BEHAVIOURS[Number(this.currentRole)];
        
        if (!behaviour) {
            this.displayResult("Ova uloga nema sekondarnu akciju");
            return;
        }

        // Check if secondary action needs target
        if (!behaviour.needsSecondTarget && behaviour.execute) {
            const result = behaviour.execute(
                this.currentPlayer,
                null,
                this.gameState,
                this.secondaryAction
            );
            
            this.handleActionResult(result);
            return;
        }

        if (!this.selectedTarget) {
            this.displayResult("Molimo izaberite metu!");
            return;
        }

        try {
            const result = behaviour.execute(
                this.currentPlayer,
                this.selectedTarget,
                this.gameState,
                this.secondaryAction
            );

            this.elements.confirmButton.disabled = true;
            this.elements.skipButton.disabled = true;
            this.elements.secondaryButton.disabled = true;
            this.handleActionResult(result, behaviour);
            
        } catch(error) {
            console.error("Greška pri izvršavanju akcije:", error);
            this.displayResult("Došlo je do greške!");
        }
    }

    /**
     * Displays action results and progresses actors and night 
     * @param {{success: boolean, message?: string, popup?: string, result?: any}} result Action result
     * @param {import("../utils/role-behaviours.js").RoleBehaviour} behaviour Specific role behaviour
     * @returns 
     */
    handleActionResult(result, behaviour) {
        if (result && result.popup){
            this.displayPopup(result.popup);
            return;
        } 
        else if (result && result.message) {
            this.displayResult(result.message);
        }
        else {
            this.displayResult("Akcija izvršena");
        }
        this.currentPlayer.acted = true;
        // if every player acted, wait and progress night
        if(this.gameState.isEveryPlayerActed(this.players) || behaviour.allForOne){
            setTimeout(() => {
                this.onActionComplete?.();
            }, 1000);
        }
        // else find first valid actor
        else {
            const allCards = [...this.elements.playerHolder.querySelectorAll(".current-player-card")];
            allCards.forEach((card) => {
                if(card._player.acted === true){
                    card.disabled = true;
                    card.classList.add("acted")
                }
            })
            const next = this.findFirstCanAct(allCards);
            if (next) this.selectPlayer(next);
        }
    }
    
    /**
     * Finds first player actor that is valid for acting
     * @param {HTMLElement} cards Player actor cards 
     * @returns 
     */
    findFirstCanAct(cards){
        return cards.find(card => card._player.acted === false);
    }

    /** Informs that action was skipped and sets a timer for sending a signal to progress the night */
    handleSkip() {
        this.displayResult("Preskočeno");
        setTimeout(() => {
            this.onActionSkipped?.();
        }, 1000);
    }

    /**
     * Shows action summary if role has an action summary message.
     * 
     * Creates timer to automaticaly hide action summary
     * @param {string} message Action summary 
     */
    displayResult(message) {
        if(this.elements.resultDisplay) {
            this.elements.resultDisplay.textContent = message;
            this.changeElementDisplayType(this.elements.resultDisplay, "block");
            
            setTimeout(() => {
                this.changeElementDisplayType(this.elements.resultDisplay, "none");
            }, 3000);
        }
    }

    /**
     * Shows action result message in a popup window
     * @param {string} message Action result message 
     */
    displayPopup(message){
        this.popup();
        this.elements.popupText.textContent = message;
    }

    /**
     * Changes visibility of popup
     * @param {string} displayType css display type 
     */
    popup(displayType = "block"){
        this.changeElementDisplayType(this.elements.popupWindow, displayType);
    }

    /**
     * Hides popup window and starts a timer to send a signal that action was completed and to progress
     * night by transitioning to night menu
     */
    onPopupClicked(){
        this.popup("none");
        setTimeout(() => {
            this.onActionComplete?.();
        }, 500);
    }
}