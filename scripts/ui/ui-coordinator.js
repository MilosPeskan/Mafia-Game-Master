import { lockToLandscape } from "../utils/set-fullscreen.js";
import { ActionMenu } from "./action-menu.js";
import { GameMenu } from "./game-menu-ui.js";
import { InfoMenu } from "./information-menu.js";
import { LynchMenu } from "./lynch-menu-ui.js";
import { MainMenu } from "./main-menu-ui.js";
import { NightMenu } from "./night-menu-ui.js";
import { RoleMenu } from "./role-menu-ui.js";
import { RoleRevealMenu } from "./role-reveal-ui.js";
import { UiController } from "./ui-controller.js";

export class UiCoordinator{
    /**
     * @param {import("../game-state.js").GameState} gameState - Singleton instance that manages game flow
     */
    constructor(gameState){
        this.gameState = gameState;
        this.initializeControlers();
        this.setupCallbacks();
    }

    /**
     * Create all menu ui objects, hide all exept mainMenu
     */
    initializeControlers(){
        this.mainMenu = new MainMenu(
            document.getElementById("mainMenu"),
            this.gameState
        );

        this.roleMenu = new RoleMenu(
            document.getElementById("settingsMenu"),
            this.gameState
        );

        this.revealMenu = new RoleRevealMenu(
            document.getElementById("roleSelection"),
            this.gameState
        );

        this.gameMenu = new GameMenu(
            document.getElementById("managerMenu"),
            this.gameState
        );

        this.infoMenu = new InfoMenu(
            document.getElementById("playerInfoMenu"),
            this.gameState
        );

        this.nightMenu = new NightMenu(
            document.getElementById("nightMenu"),
            this.gameState
        );

        this.actionMenu = new ActionMenu(
            document.getElementById("actionMenu"),
            this.gameState
        );

        this.lynchMenu = new LynchMenu(
            document.getElementById("lynchMenu"),
            this.gameState
        );

        this.hideAll();
        this.mainMenu.show("flex");
    }

   /**
    * Initializes and binds all UI callbacks between menus.
    * 
    * Connects user interactions (clicks, actions) with application logic
    * and handles transitions between different menu screens.
    */
    setupCallbacks(){
        this.mainMenu.onNextClick = () => {
            this.transitionTo(this.mainMenu, this.roleMenu, "grid");
        };

        this.roleMenu.onStartGame = () => {
            this.gameState.initializeGame();
            this.transitionTo(this.roleMenu, this.revealMenu);
        };

        this.roleMenu.onBackClick = () => {
            this.backToMainMenu(this.roleMenu);
        };

        this.revealMenu.onRevealComplete = () => {
            this.transitionTo(this.revealMenu, this.gameMenu, "grid");
            this.gameMenu.displayPlayers();
            lockToLandscape();
        };

        this.revealMenu.onBackClick = () => {
            this.backToMainMenu(this.revealMenu);
        };

        this.gameMenu.onBackClick = () => {
            this.backToMainMenu(this.gameMenu);
        };

        this.gameMenu.onPlayerCardClicked = (player) => {
            this.transitionTo(this.gameMenu, this.infoMenu);
            this.infoMenu.displayInfo(player);
        };

        this.infoMenu.onBackClicked = () => {
            this.transitionTo(this.infoMenu, this.gameMenu, "grid");
        };

        this.gameMenu.onNightClicked = () => {
            this.transitionTo(this.gameMenu, this.nightMenu, "block");
            this.nightMenu.displayCurrentStep();
        }

        this.gameMenu.onLynchClicked = () => {
            this.transitionTo(this.gameMenu, this.lynchMenu, "grid");
        }

        this.actionMenu.onActionComplete = () => {
            this.transitionTo(this.actionMenu, this.nightMenu, "block");
            this.nightMenu.advanceToNextStep();
        };

        this.actionMenu.onActionSkipped = () => {
            this.transitionTo(this.actionMenu, this.nightMenu, "block");
            this.nightMenu.advanceToNextStep();
        };

        this.nightMenu.onNightComplete = (message) => {
            this.transitionTo(this.nightMenu, this.gameMenu, "grid");
            this.gameMenu.nightPopup(message);
        };

        this.nightMenu.onActionRequested = (roleId, players) => {
            this.transitionTo(this.nightMenu, this.actionMenu, "grid");
            this.actionMenu.setupAction(roleId, players);
        };

        this.lynchMenu.onCancelClicked = () => {
            this.transitionTo(this.lynchMenu, this.gameMenu, "grid");
        }

        this.lynchMenu.onLynchClicked = () => {
            this.transitionTo(this.lynchMenu, this.gameMenu, "grid");
            this.gameMenu.lynchPopup();
        }
    }

    /**
     * Handle transitions between menus
     * @param {UiController} fromController - Current menu controller
     * @param {UiController} toController - Target menu controller
     * @param {string} type - Display type
     */
    transitionTo(fromController, toController, type){
        fromController.hide();
        toController.show(type);
    }

    /**
     * Transition to main menu and reset game
     * @param {UiController} fromMenu - Current menu controller
     */
    backToMainMenu(fromMenu){
        // Reset game state
        this.gameState.players = [];
        this.gameState.pendingRoles = [];
        this.gameState.nightQueue = [];
        this.gameState.nightIndex = 0;
        
        this.transitionTo(fromMenu, this.mainMenu);
    }

    /**
     * Hide all menus
     */
    hideAll(){
        this.mainMenu.hide();
        this.roleMenu.hide();
        this.revealMenu.hide();
        this.gameMenu.hide();
        this.infoMenu.hide();
        this.nightMenu.hide();
        this.lynchMenu.hide();
    }

    /**
     * Cleanup all menus
     */
    cleanup(){
        this.mainMenu.cleanup();
        this.roleMenu.cleanup();
        this.revealMenu.cleanup();
        this.gameMenu.cleanup();
        this.infoMenu.cleanup();
        this.nightMenu.cleanup();
        this.lynchMenu.cleanup();
    }
}