import { ALIGNMENT } from "./constants.js";
import { ROLES } from "./data.js";

export class PlayerClass{
    // autoincrement index
    static nextId = 1;
    /**
     * @param {string} name Player name
     * @param {string | null} roleId Player role id
     * @param {string | null} iconPath Path to player icon
     */
    constructor(name, roleId, iconPath = null){
        this.id = PlayerClass.nextId++;
        this.name = name;
        this.roleId = roleId;
        this.iconPath = iconPath;

        this.isAlive = true;
        this.statuses = new Set();
        this.visitedBy = [];
        this.isBlocked = false;
        this.visitedByMafia = false;

        this.acted = false;
        this.remembered = false;
        this.wasAmnesiac = false;
        this.successParasite = false;
        this.wasParasite = false;
        this.votes = 0;

        console.log(typeof roleId)
    }

    /**
     * Registers a visitor for this player, flags if any visitor is mafia-aligned
     * 
     * @param {PlayerClass} visitor Player who visited this player
     */
    addVisitor(visitor){
        this.visitedBy.push(visitor);
        if(visitor.isMafiaAligned()){
            this.visitedByMafia = true;
        }
    }

    /**
     * Returns a message describing which players visited this player
     *
     * @returns {string} Visitor message
     */
    getVisitors(){
        const listOfVisitors = this.visitedBy.map(p => p.name);
        if(this.visitedBy.length<1){
            return `Niko nije posetio igrača ${this.name}`;
        }
        else if(this.visitedBy.length>1){
            return `Igrača ${this.name} su posetili ${listOfVisitors.slice(0, -1)} ${listOfVisitors.at(-1)}`;
        }
        else{
            return `Igrača ${this.name} je posetio igrač ${listOfVisitors[0]}`;
        }
    }

    /** Marks player as having remembered a role, used for amnesiac */
    remember(){
        this.remembered = true;
    }

    /**
     * Checks if a specific player has visited this player
     * @param {PlayerClass} player
     * @returns {boolean}
     */
    isVisitedBySpecificPlayer(player){
        return this.visitedBy.includes(player);
    }

    /**
     * Checks if mafia has visited this player
     * @returns {boolean}
     */
    isVisitedByMafia(){
        return this.visitedByMafia;
    }

    /**
     * Checks if player is alive
     *
     * @returns {boolean}
     */
    checkIfPlayerAlive(){
        return this.isAlive;
    }

    /**
     * Applies block status to player, preventing actions
     */
    block(){
        this.isBlocked = true;
    }

    /**
     * Checks if player is currently blocked
     * @returns {boolean}
     */
    checkIfPlayerBlocked(){
        return this.isBlocked;
    }

    /**
     * Returns full role data object for this player
     * @returns {Object | null} Role data or null if role not assigned
     */
    getRoleData(){
        if (this.roleId === null) return null;
        return ROLES[this.roleId];
    }

    /**
     * Returns role name of the player
     * @returns {string | null}
     */
    getRoleName(){
        const roleData = this.getRoleData();
        return roleData ? roleData.role : null;
    }

    /**
     * Returns alignment of the player
     * @returns {string | null}
     */
    getRoleAlignment(){
        const roleData = this.getRoleData();
        return roleData ? roleData.alignment : null;
    }

    /**
     * Returns role description of the player
     * @returns {string | null}
     */
    getRoleDescription(){
        const roleData = this.getRoleData();
        return roleData ? roleData.description : null;
    }

    /**
     * Checks if player matches given alignment
     * @param {string} alignment
     * @returns {boolean}
     */
    isAlignment(alignment){
        return this.getRoleAlignment() == alignment;
    }

    /**
     * Checks if player has mafia alignment
     * @returns {boolean}
     */
    isMafiaAligned(){
        return this.isAlignment(ALIGNMENT.MAFIA);
    }

    /**
     * Checks if player has a specific status effect
     * @param {string} status
     * @returns {boolean}
     */
    hasStatus(status){
        return this.statuses.has(status);
    }

    /**
     * Adds a status effect to the player
     * @param {string} status
     */
    addStatus(status){
        this.statuses.add(status);
    }

    /**
     * Adds a specific status effect to the player
     * @param {string} status
     */
    removeStatus(status){
        this.statuses.delete(status);
    }

    /**
     * Removes all bodyguard protection statuses
     */
    removeBodyguardedStatuses() {
        for (const status of this.statuses) {
            if (status.startsWith("zaštićen telohraniteljem")) {
                this.statuses.delete(status);
            }
        }
    }

    /**
     * Resets all temporary player statuses.
     * Clears visits, blocks, and action flags.
     */
    clearStatuses(){
        this.statuses.clear();
        this.visitedBy = [];
        this.isBlocked = false;
        this.visitedByMafia = false;
        this.acted = false;
    }

    addLynchVote(){
        this.votes++;
    }

    removeLynchVote(){
        this.votes--;
    }

    /**
     * Returns number of lynch votes assigned to player.
     *
     * @returns {number}
     */
    getLynchVotes(){
        return this.votes;
    }

    /**
     * Resets player's lynch votes to zero.
     */
    resetVotes(){
        this.votes = 0;
    }

    /**
     * Kills the player and clears all active statuses.
     */
    kill(){
        this.isAlive = false;
        this.clearStatuses();
    }
}