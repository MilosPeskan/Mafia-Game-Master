import { ALIGNMENT } from "./constants.js";
import { ROLES } from "./data.js";

export class PlayerClass{
    static nextId = 1;
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
    }

    addVisitor(visitor){
        this.visitedBy.push(visitor);
        if(visitor.isMafiaAligned()){
            this.visitedByMafia = true;
        }
    }

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

    remember(){
        this.remembered = true;
    }

    isVisitedBySpecificPlayer(player){
        return this.visitedBy.includes(player);
    }

    isVisitedByMafia(){
        return this.visitedByMafia;
    }

    checkIfPlayerAlive(){
        return this.isAlive;
    }

    block(){
        this.isBlocked = true;
    }

    checkIfPlayerBlocked(){
        return this.isBlocked;
    }

    getRoleData(){
        if (this.roleId === null) return null;
        return ROLES[this.roleId];
    }

    getRoleName(){
        const roleData = this.getRoleData();
        return roleData ? roleData.role : null;
    }

    getRoleAlignment(){
        const roleData = this.getRoleData();
        return roleData ? roleData.alignment : null;
    }

    getRoleDescription(){
        const roleData = this.getRoleData();
        return roleData ? roleData.description : null;
    }

    isAlignment(alignment){
        return this.getRoleAlignment() == alignment;
    }

    isMafiaAligned(){
        return this.isAlignment(ALIGNMENT.MAFIA);
    }

    hasStatus(status){
        return this.statuses.has(status);
    }

    addStatus(status){
        this.statuses.add(status);
    }

    removeStatus(status){
        this.statuses.delete(status);
    }

    removeBodyguardedStatuses() {
        for (const status of this.statuses) {
            if (status.startsWith("zaštićen telohraniteljem")) {
                this.statuses.delete(status);
            }
        }
    }

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

    getLynchVotes(){
        return this.votes;
    }

    resetVotes(){
        this.votes = 0;
    }

    kill(){
        this.isAlive = false;
        this.clearStatuses();
    }
}