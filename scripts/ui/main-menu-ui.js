import { IMAGE_PATH, IMAGES } from "../constants.js";
import { UiController } from "./ui-controller.js";

export class MainMenu extends UiController{
    /**
     * @param {HTMLElement} rootElement - Html element that contains the menu ui
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(rootElement, gameState){
        super(rootElement)

        this.gameState = gameState;
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Queries and stores all required DOM elements for the menu
     */
    initializeElements(){
        this.elements = {
            form: this.rootElement.querySelector("#player-input-form"),
            playerNameInput: this.rootElement.querySelector("#input-name"),
            description: this.rootElement.querySelector("#deskripcija"),
            playersList: this.rootElement.querySelector("#list-of-players"),
            addButton: this.rootElement.querySelector("#button-add-player"),
            nextButton: this.rootElement.querySelector("#next-button")
        };
    }

    /**
     * Attaches event listeners to ui elements
     */
    attachEventListeners(){
        this.addEventListener(this.elements.form, "submit", (e) => {
            e.preventDefault();

            this.handleAddPlayer();
        })

        this.addEventListener(this.elements.playersList, "click", (e) => {
            if(e.target.classList.contains("delete-button")){
                const li = e.target.closest("li");
                const name = li.dataset.playerName;
                this.handleDelete(name);
            }
        })

        this.addEventListener(this.elements.nextButton, "click", () => {
            this.handleNextClick();
        })
    }

    handleNextClick(){
        if(this.gameState.getNumberOfPlayers() < 4) {
            alert("Igra mora da ima minimum 4 igrača!");
            return;
        }
        this.onNextClick?.();
    }

    handleAddPlayer(){
        const name = this.elements.playerNameInput.value.trim();

        try{
            const sanitizedName = this.gameState.addPlayer(name);

            this.elements.description.style.display = "none";
            this.elements.playersList.style.display = "grid";

            this.createPlayerListItem(sanitizedName);

            this.elements.playerNameInput.value = '';

            if(this.gameState.hasMaxNumberOfPlayers()){
            this.elements.playerNameInput.disabled = true;
            this.elements.addButton.disabled = true;
            }
        }
        catch(error){
            alert(error.message);
        }
    }

    // funkcija za dodavanje igraca u listu i kreaciju HTML elementa
    createPlayerListItem(name){
        const li = document.createElement("li");
        li.dataset.playerName = name;
        li.style.backgroundImage = `url('${this.getRandomImage()}')`;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;
        nameSpan.className = "player-name";

        if(name.length > 15){
            li.style.fontSize = "3.3vh";
        }
        else if (name.length > 10){
            li.style.fontSize = "4vh";
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.className = "delete-button";

        li.append(nameSpan, deleteButton);
        this.elements.playersList.appendChild(li);
    }

    getRandomImage() {
        const randomIndex = Math.floor(Math.random() * IMAGES.length);
        return IMAGE_PATH + IMAGES[randomIndex];
    }

    removePlayerFromList(name){
        const items = this.elements.playersList.querySelectorAll("li");

        for (const item of items){
            if(item.dataset.playerName === name){
                item.remove();
                break;
            }
        }
    }

    handleDelete(name){
        this.gameState.removePlayer(name);
        this.removePlayerFromList(name);

        this.elements.playerNameInput.disabled = false;
        this.elements.addButton.disabled = false;
        
        if (this.gameState.players.length === 0){
            this.elements.description.style.display = "block";
            this.elements.playersList.style.display = "none";
        }

    }

    reset() {
        this.elements.playersList.innerHTML = "";
        this.playerNameInput.value = "";
        this.playerNameInput.disabled = false;
        this.elements.addButton.disabled = false;
    }

}