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

        // Prikaži skip dugme ako uloga može preskočiti akciju
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

    generatePlayerButtons(players){
        players.forEach(player => {
            const card = document.createElement("button");
            card.classList.add("current-player-card");
            card.dataset.playerId = player.id;
            card._player = player;

            const name = document.createElement("h4");
            name.classList.add("player-name");
            name.textContent = player.name;

            // Onemoguci selektovanje ako je igrac mrtav ili blokiran
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
                deadLabel.className = "block-label";
                deadLabel.textContent = "⦸";
                player.acted = true;
                name.prepend(blockLabel);
            }

            card.append(name);
            this.elements.playerHolder.appendChild(card);
        });
        const allCards = [...this.elements.playerHolder.querySelectorAll(".current-player-card")];
        this.selectPlayer(this.findFirstCanAct(allCards));
    }

    displayTargets() {        
        this.elements.targetHolder.innerHTML = "";

        // Koristi helper funkciju iz role-behaviours
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

        // Dodaj indicator za mrtve igrače
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

    selectPlayer(card) {
        // Ukloni prethodnu selekciju
        const allCards = this.elements.playerHolder.querySelectorAll(".current-player-card");
        allCards.forEach(c => c.classList.remove("selected"));
        
        // Dodaj novu selekciju
        card.classList.add("selected");
        this.currentPlayer = card._player;
        this.displayTargets();
    }

    selectTarget(card) {
        // Ukloni prethodnu selekciju
        const allCards = this.elements.targetHolder.querySelectorAll(".target-card");
        allCards.forEach(c => c.classList.remove("selected"));

        // Dodaj novu selekciju
        card.classList.add("selected");
        this.selectedTarget = card._player;
    }

    async handleConfirm() {
        const behaviour = ROLE_BEHAVIOURS[Number(this.currentRole)];
        
        // Proveri da li uloga uopšte ima akciju
        if (!behaviour) {
            this.displayResult("Ova uloga nema noćnu akciju");
            return;
        }

        // Proveri da li treba meta (neke uloge ne trebaju, npr. Špijun)
        if (!behaviour.needsTarget && behaviour.execute) {
            // Izvrši akciju bez mete
            const result = behaviour.execute(
                this.currentPlayer,
                null,
                this.gameState
            );
            
            this.handleActionResult(result);
            return;
        }

        // Za uloge koje trebaju metu
        if (!this.selectedTarget) {
            this.displayResult("Molimo izaberite metu!");
            return;
        }

        // Proveri da li je blokirano vrv ne treba funkcija
        if (this.currentPlayer.checkIfPlayerBlocked()) {
            this.displayResult("Blokirani ste! Ne možete koristiti sposobnost.");
            return;
        }

        // Izvrši akciju
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

    handleSecondary() {
        const behaviour = ROLE_BEHAVIOURS[Number(this.currentRole)];
        
        // Proveri da li uloga uopšte ima akciju
        if (!behaviour) {
            this.displayResult("Ova uloga nema sekondarnu akciju");
            return;
        }

        // Proveri da li treba meta (neke uloge ne trebaju, npr. Špijun)
        if (!behaviour.needsSecondTarget && behaviour.execute) {
            // Izvrši akciju bez mete
            const result = behaviour.execute(
                this.currentPlayer,
                null,
                this.gameState,
                this.secondaryAction
            );
            
            this.handleActionResult(result);
            return;
        }

        // Za uloge koje trebaju metu
        if (!this.selectedTarget) {
            this.displayResult("Molimo izaberite metu!");
            return;
        }

        // Proveri da li je blokirano vrv ne treba funkcija
        if (this.currentPlayer.checkIfPlayerBlocked()) {
            this.displayResult("Blokirani ste! Ne možete koristiti sposobnost.");
            return;
        }

        // Izvrši akciju
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
        if(this.gameState.isEveryPlayerActed(this.players) || behaviour.allForOne){
            // Sačekaj kratko pa nastavi
            setTimeout(() => {
                this.onActionComplete?.();
            }, 1000);
        }
        else {
            const allCards = [...this.elements.playerHolder.querySelectorAll(".current-player-card")];
            allCards.forEach((card) => {
                if(card._player.acted === true){
                    card.disabled = true;
                    card.classList.add("acted")
                }
            })
            this.selectPlayer(this.findFirstCanAct(allCards));
        }
    }
    
    findFirstCanAct(cards){
        return cards.find(card => card._player.acted === false);
    }

    handleSkip() {
        this.displayResult("Preskočeno");
        setTimeout(() => {
            this.onActionSkipped?.();
        }, 1000);
    }

    displayResult(message) {
        if(this.elements.resultDisplay) {
            this.elements.resultDisplay.textContent = message;
            this.changeElementDisplayType(this.elements.resultDisplay, "block");
            
            setTimeout(() => {
                this.changeElementDisplayType(this.elements.resultDisplay, "none");
            }, 3000);
        }
    }

    displayPopup(message){
        this.popup();
        this.elements.popupText.textContent = message;
    }

    popup(displayType = "block"){
        this.changeElementDisplayType(this.elements.popupWindow, displayType);
    }

    onPopupClicked(){
        this.popup("none");
        setTimeout(() => {
            this.onActionComplete?.();
        }, 500);
    }
}