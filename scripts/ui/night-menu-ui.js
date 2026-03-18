import { UiController } from "./ui-controller.js";
import { getRoleTextForButton, hasNightAction } from "../utils/role-behaviours.js";
import { MESSAGES, ROLE_IDS } from "../constants.js";

export class NightMenu extends UiController {
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
            role: this.rootElement.querySelector("#wake-up-role"),
            playerName: this.rootElement.querySelector("#wake-up-player"),
            actionButton: this.rootElement.querySelector("#action"),
            skipButton: this.rootElement.querySelector("#skip-night-step"),
            progressText: this.rootElement.querySelector("#night-progress"),
            statusStamp: this.rootElement.querySelector("#status-stamp"),
            processButton: this.rootElement.querySelector("#process-night-btn")
        };
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.addEventListener(this.elements.actionButton, "click", () => {
            this.handleActionClicked();
        });

        this.addEventListener(this.elements.skipButton, "click", () => {
            this.handleSkip();
        });

        this.addEventListener(this.elements.processButton, "click", () => {
            this.handleNightComplete();
        })
    }

    /**
     * Hide process night button and begin processing night events
     */
    handleNightComplete(){
        this.elements.processButton.style.display = "none";
        this.onNightComplete?.(this.gameState.calculateNight());
    }

    /**
     * Transition to action menu with current players and role
     */
    handleActionClicked(){
        const currentStep = this.gameState.getCurrentNightStep();
        
        if (!currentStep) {
            console.error(MESSAGES.NO_CURRENT_STEP);
            return;
        }

        const { roleId, players } = currentStep;

        // Obavesti koordinator da otvori action menu
        this.onActionRequested?.(roleId, players);
    }

    /**
     * Display role that is waking up and all players with that role (or alignment)
     * If night is over, show narrator helper to wake up everyone
     * Call to update action buttons
     */
    displayCurrentStep(){
        const currentStep = this.gameState.getCurrentNightStep();

        if(!currentStep){
            this.displayNightEnd();
            return;
        }

        const { roleId, players } = currentStep;
        let roleName = players[0].getRoleName();
        // If mafia only has unique roles, show all mafia roles as mafia in this step
        if (roleId == ROLE_IDS.MAFIJAS){
            roleName = "Mafija";
        }
        // At amnesiac step, allways display amnesiac, regardless if he took another role
        else if( roleId == ROLE_IDS.AMNEZICAR){
            roleName = "Amnezičar";
        }
        // At parasite step, allways display parasite, regardless if he took another role
        else if( roleId == ROLE_IDS.PARAZIT){
            roleName = "Parazit"
        }

        this.elements.role.textContent = `Budi se ${roleName}`;
        if(players.length === 1){
            this.elements.playerName.textContent = players[0].name;
        }
        else {
            const names = [];
            players.forEach((p) => {
                names.push(p.name);
            })
            this.elements.playerName.textContent = names.join(', ');
        }
        this.elements.actionButton.style.display = "block";
        this.elements.skipButton.style.display = "block";
        this.elements.skipButton.textContent = "Preskoči";
        this.elements.statusStamp.style.display = "none";

        console.log(typeof roleId, typeof players)
        this.updateMenu(roleId, players);
    }

    /**
     * Update night progress
     */
    updateProgress() {
        const current = this.gameState.nightIndex + 1;
        const total = this.gameState.nightQueue.length;
        this.elements.progressText.textContent = `Korak ${current} / ${total}`;
    }

    /**
     * 
     * @param {number} roleId Key from ROLE dictionary
     * @param {import("../player-manager.js").PlayerClass[]} players Array of player objects in current night step
     * @returns 
     */
    updateMenu(roleId, players){
        this.updateProgress();
        // Proveri da li je igrač živ
        const allDead = this.gameState.isEveryPlayerWithRoleDead(players);
        const allBlocked = this.gameState.isEveryPlayerWithRoleBlocked(players);
        if(this.gameState.hasRemembered(players) && roleId == ROLE_IDS.AMNEZICAR){
            this.updateActionButton("se setio");
            return;
        } else if(this.gameState.hasParasitised(players) && roleId == ROLE_IDS.PARAZIT){
            this.updateActionButton("parazitirao");
            return;
        }
        else if(allDead) {
            this.updateActionButton("mrtav");
            return;
        }
        else if(allBlocked) {
            this.updateActionButton("blokiran");
            return;
        }
        this.elements.actionButton.textContent = getRoleTextForButton(roleId);
    }

    updateActionButton(text){
        this.elements.actionButton.style.display = "none";

        this.elements.statusStamp.style.display = "block";
        this.elements.statusStamp.textContent = text.toUpperCase();
        
        this.elements.skipButton.style.display = "block";
        this.elements.skipButton.textContent = `Nastavi (Igrač ${text})`;
    }

    handleSkip(){
        this.advanceToNextStep();
    }

    advanceToNextStep(){
        this.gameState.advanceNight();
        this.displayCurrentStep();
    }

    displayNightEnd() {
        // Noć je završena - prikaži rezime
        this.elements.role.textContent = "Noć je završena";
        this.elements.playerName.textContent = "grad se budi";
        this.elements.actionButton.style.display = "none";
        this.elements.skipButton.style.display = "none";

        // Prikaži dugme za procesiranje noći
        this.elements.processButton.style.display = "block";
    }

    processNight() {        
        // Pozovi game state da procesirajse sve akcije
        const winMessage = this.gameState.processNightResolution();

        // Sakrij process dugme
        this.elements.processButton.style.display = "none";

        // Prikaži rezultate
        this.showNightResults(winMessage);
    }

    showNightResults(winMessage) {
        // Nađi sve igrače koji su ubijeni
        const killed = this.gameState.players.filter(p => 
            !p.isAlive && !p.wasDeadLastNight
        );

        // Označi da su bili mrtvi (za sledeću noć)
        this.gameState.players.forEach(p => {
            p.wasDeadLastNight = !p.isAlive;
        });

        let resultText = "";

        if (killed.length > 0) {
            resultText = `Ubijeni tokom noći:\n${killed.map(p => p.name).join(", ")}`;
        } else {
            resultText = "Niko nije ubijen tokom noći.";
        }

        if (winMessage) {
            resultText += `\n\n${winMessage}`;
        }

        // Prikaži rezultat
        alert(resultText);
    }
}