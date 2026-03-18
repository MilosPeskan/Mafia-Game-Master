import { UiController } from "./ui-controller.js";

export class LynchMenu extends UiController{
    /**
     * @param {HTMLElement} rootElement - Html element that contains the menu ui
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(rootElement, gameState){
        super(rootElement);

        this.gameState = gameState;
        this.initializeElements();
        this.attachEventListeners();

        this.playerCounterMap = new Map();
    }

    /**
     * Queries and stores all required DOM elements for the menu
     */
    initializeElements(){
        this.elements = {
            playerHolder: this.rootElement.querySelector("#lynch-holder"),
            votes: this.rootElement.querySelector("#votes-per-players"),
            confirmButton: this.rootElement.querySelector("#confirm-lynch"),
            cancelButton: this.rootElement.querySelector("#cancel-lynch")
        }
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.addEventListener(this.elements.confirmButton, "click", () =>{
            this.onLynchClicked?.();
        })
        this.addEventListener(this.elements.cancelButton, "click", () => {
            this.handleCancel();
        })
        this.addEventListener(this.elements.playerHolder, "click", (e) => {
            if(e.target.classList.contains("add-vote")){
                const player = e.target._player;
                this.handleAddVote(player);
            } else if(e.target.classList.contains("remove-vote")){
                const player = e.target._player;
                this.handleRemoveVote(player);
            }
        })
    }

    displayPlayers(){
        this.elements.playerHolder.innerHTML = "";

        const columnsPerRow = this.gameState.players.length > 18 ? 5 : 6;
        this.elements.playerHolder.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;

        for(const player of this.gameState.players){
            if(player.checkIfPlayerAlive()){
                const card = this.createPlayerCard(player);
                this.elements.playerHolder.appendChild(card);
            }
        }
    }

    createPlayerCard(player){
        const card = document.createElement("div");
        card.classList.add("player-card");
        card.dataset.name = player.name;
        card._player = player;

        const icon = document.createElement("img");
        icon.classList.add("player-icon");
        icon.src = player.iconPath;

        const name = document.createElement("h3");
        name.classList.add("nametag");
        name.textContent = player.name;

        const controls = this.createLynchControls(player);

        card.append(icon, name, controls);
        return card;
    }

    createLynchControls(player){
        const container = document.createElement("div");
        container.className = "controls-div";

        const removeVoteButton = document.createElement("button");
        removeVoteButton.className = "remove-vote";
        removeVoteButton._player = player;

        const counter = document.createElement("span");
        counter.textContent = 0;
        counter.className = "votes";
        counter._player = player;
        this.playerCounterMap.set(player.id, counter)
    
        const addVoteButton = document.createElement("button");
        addVoteButton.className = "add-vote";
        addVoteButton._player = player;

        container.append(removeVoteButton, counter, addVoteButton);

        return container;
    }

    handleAddVote(player){
        try{
            this.gameState.addLynchVote(player);
            this.updateCounter();
            this.updateVoteCounter(player);
        } catch (error){
            alert(error.message)
        }
    }

    handleRemoveVote(player){
        try{
            this.gameState.removeLynchVote(player);
            this.updateCounter();
            this.updateVoteCounter(player);
        } catch (error){
            alert(error.message)
        }
    }

    updateCounter(){
        this.elements.votes.textContent = `${this.gameState.getLynchVotes()} / ${this.gameState.getNumberOfAlivePlayers()}`
    }

    updateVoteCounter(player){
        const counter = this.playerCounterMap.get(player.id);

        if(counter){
            counter.textContent = player.getLynchVotes();
        }
    }

    handleCancel(){
        this.onCancelClicked?.();
        this.gameState.resetLynch();
    }

    show(displayType){
        super.show(displayType);
        this.displayPlayers();
        this.updateCounter();
    }
}