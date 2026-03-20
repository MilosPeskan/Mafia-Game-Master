import { ALIGNMENT, CONFIG, LYNCH_MESSAGE, MESSAGES, ORDER_OF_ROLES, ROLE_IDS, ROLE_MESSAGE, STATUS, WIN_MESSAGE } from './constants.js';
import { ROLES } from './data.js';
import { PlayerClass } from './player-manager.js';
import { IconManager } from './utils/icon-manager.js';
import { ROLE_BEHAVIOURS } from './utils/role-behaviours.js';

export class GameState{
    constructor() {
        /** PlayerClass object list */
        this.players = []; 
        /** Number value of role index */
        this.pendingRoles = [];
        /** Number value of total lynch votes */
        this.lynchVotes = 0;
        /** Number value of current player index in queue */
        this.currentPlayerIndex = 0;
        /** Icon manager object */
        this.iconManager = new IconManager;
        /** PlayerObject execution target */
        this.executionTarget = null;

        /** Order for waking up - roleId[number] - Array[PlayerObject] */
        this.nightQueue = [];
        /** Number of current possition in night queue */
        this.nightIndex = 0;

        /** Array of night actions */
        this.nightActions = {
            /** Map attacker[PlayerObject] -> target[PlayerObject] */
            kills: new Map(),
            /** Map bodyguard[PlayerObject] -> target[PlayerObject] */
            bodyguard: new Map(),
            /** Array of PlayerObject */
            silenced: [],
            /** Map attacker[PlayerObject] -> target[PlayerObject] */
            exposed: new Map(),
            /** Map target[PlayerObject] -> parasite[PlayerObject] */
            parasited: new Map()
        };

        /** Array of strings - player names */
        this.deaths = [];
        /** Array of strings - player names */
        this.survived = [];
        /** Number of total players visited by visitor that are alive */
        this.visitorVisited = 0;
        /** Is visitor event active */
        this.visitorEvent = false;
        /** Number of nights passed durring visitor event */
        this.visitorEventNights = 0;
    }

    /**
     * Validate sanitized inputed name and create PlayerObject and add it to players list
     * @param {string} name Player name
     * @returns {string} Sanitized player name string
     */
    addPlayer(name){
        const sanitizedName = this.sanitizeName(name);

        if(!sanitizedName){
            throw new Error(MESSAGES.EMPTY_NAME);
        }

        if(sanitizedName.length > CONFIG.MAX_NAME_LENGTH){
            throw new Error(MESSAGES.NAME_TOO_LONG(CONFIG.MAX_NAME_LENGTH));
        }

        if(this.players.some(p => p.name === sanitizedName)){
            throw new Error(MESSAGES.NAME_EXISTS(sanitizedName));
        }

        if(this.players.length >= CONFIG.MAX_PLAYERS) {
            throw new Error(MESSAGES.MAX_PLAYERS_REACHED(CONFIG.MAX_PLAYERS));
        }

        this.players.push(new PlayerClass(sanitizedName, null, null));
        return sanitizedName;
    }

    /**
     * Sanitize string by removing spetial caracters, keep all letters (icluding serbian latin), nubers and spaces
     * Make first letter upper case, rest lover case
     * @param {string} name Player name 
     * @returns {string} Sanitized player name string
     */
    sanitizeName(name) {
        if (!name) return '';
        
        let sanitized = name
            .trim()
            .replace(/[^a-zA-ZčćžšđČĆŽŠĐ0-9\s]/g, '')
            .replace(/\s+/g, ' '); // Replace multiple spaces with one space
        
        if (sanitized.length > 0) {
            sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();
        }
        
        return sanitized;
    }


    /**
     * Remove player object from player array whose name matches parameter
     * @param {string} name Player name string
     */
    removePlayer(name) {
        const index = this.players.findIndex(p => p.name === name);
        if (index > -1) {
            this.players.splice(index, 1);
        }
        if(this.pendingRoles.length > 0){
            this.pendingRoles.pop();
        }
    }

    /** Check if max number of players added */
    hasMaxNumberOfPlayers(){
        return this.players.length >= CONFIG.MAX_PLAYERS;
    }

    /**
     * Get every player name
     * @returns {String[]} Array of player names as strings
     */
    getPlayers(){
        return this.players.map(p => p.name);
    }

    /**
     * @returns {number} Total number of players added to players array
     */
    getNumberOfPlayers(){
        return this.players.length;
    }

    /**
     * Check if minimum number of players have been added to start the game
     * @returns {boolean} True if equal or more than minimum
     */
    hasMinimumRequiredPlayers(){
        return this.getNumberOfPlayers() >= CONFIG.MIN_PLAYERS
    }

    /**
     * Add role id to pendingRoles array if number of pending roles is less than number of players and that role hasn`t reached max number
     * @param {string} roleId Key from ROLES dictionary
     */
    addRole(roleId){
        if(this.pendingRoles.length !== this.players.length && this.maxSpecificRole(roleId)){
            this.pendingRoles.push(String(roleId));
        }
    }

    /**
     * Check if role has a set maximum of repetitions and check if that maximum has been reached
     * @param {string} roleId Key from ROLES dictionary
     * @returns {boolean} Return false if role has reached maximum 
     */
    maxSpecificRole(roleId){
        if(ROLES[roleId].hasMaximum){
            return this.getSpecificRoleCount(roleId) < ROLES[roleId].hasMaximum;
        }
        else return true
    }

    /**
     * Remove first instance of role id from pendingRoles array
     * @param {string} roleId Key from ROLES dictionary
     */
    removeRole(roleId){
        const position = this.pendingRoles.indexOf(String(roleId));

        if(position >= 0){
            this.pendingRoles.splice(position, 1);
        }
    }

    /**
     * Get number of specific role in pending roles
     * @param {string} roleID Key from ROLES dictionary
     * @returns {number} Number of specific role instances
     */
    getSpecificRoleCount(roleID){
        return this.pendingRoles.filter((id) => (id === String(roleID))).length;
    }

    /**
     * Get number of roles in pendingRoles
     * @returns {number} Number of roles
     */
    getNumberOfRoles(){
        return this.pendingRoles.length;
    }

    /**
     * Get difference between numbers of added roles and players
     * @returns {number} Number of roles to be added
     */
    getNumberOfMissingRoles(){
        return this.getNumberOfRoles() - this.getNumberOfPlayers();
    }

    /**
     * Get name of player current in line to learn role 
     * @returns {string} Player name string
     */
    getCurrentPlayer(){
        return this.players[this.currentPlayerIndex]?.name;
    }

    /**
     * Check if any players left to learn role, if true progress currentPlayerIndex
     * @returns {boolean} False if no more players left
     */
    nextPlayer(){
        if(this.hasMorePlayers()){
            this.currentPlayerIndex++;
            return true;
        }
        else{
            return false;
        }
    }

    /** Check if any more players left to learn role */
    hasMorePlayers(){
        return this.currentPlayerIndex < this.players.length;
    }

    /**
     * Get current players role id
     * @returns {string} String key from ROLES dictionary assigned to player
     */
    getCurrentRole(){
        return this.players[this.currentPlayerIndex].roleId;
    }

    /**
     * Check if current players role is executioner
     * @returns {boolean} true if is executioner
     */
    isExecutioner(){
        return this.getCurrentRole() == ROLE_IDS.DZELAT;
    }

    /**
     * @returns {string} String name of execution target
     */
    getExecutionTarget(){
        return this.executionTarget?.name;
    }

    /** Filters players to remove executioner and jester and assigns a random player object from filtered players to executionTarget */
    generateExecutionTarget(){
        //executioners and jesters cant be execution targets
        const filterExecutioner = this.players.filter(p => p.roleId != ROLE_IDS.DZELAT && p.roleId != ROLE_IDS.LUDAK)
        this.executionTarget = filterExecutioner[Math.floor((Math.random()*filterExecutioner.length))];
    }

    /**
     * Get player with executioner role
     * @returns {PlayerClass} Player object of executioner player
     */
    getExecutioner(){
        return this.players.find(p => p.roleId === ROLE_IDS.DZELAT);
    }

    /** Reset currentPlayerIndex */
    resetPlayerIndex(){
        this.currentPlayerIndex = 0;
    }

    /**
     * Shuffle player and pending roles
     * Assign roles and icons to players
     * Call buildNightQueue
     */
    initializeGame(){
        this.shuffleArray(this.players);
        this.shuffleArray(this.pendingRoles);

        const icons = this.iconManager.getShuffledIcons(this.players.length);

        this.players.forEach((player, index) =>{
            player.roleId = this.pendingRoles[index];
            console.log(typeof icons[index])
            player.iconPath = icons[index];
        });

        this.nightQueue = this.buildNightQueue(this.players);

        this.nightIndex = 0;

        this.pendingRoles = [];
    }

    /**
     * Builds the night action queue grouped by role execution order.
     * Players are grouped by roleId and then ordered according to ORDER_OF_ROLES.
     * Mafia roles are merged into a shared wake-up group.
     * @param {PlayerClass[]} players Array of player objects 
     * @returns {{ roleId: number, players: PlayerClass[] }[]} Night queue steps
     */
    buildNightQueue(players) {
        /**  Group players by their role id - int roleId -> Array[PlayerClass] */
        const roleGroup = new Map();

        players.forEach((player) => {
            const roleId = Number(player.roleId);

            if(!roleGroup.has(roleId)){
                roleGroup.set(roleId, []);
            }

            roleGroup.get(roleId).push(player);
        })

        this.addAllMafiaToMafiaWakeUp(roleGroup);

        /** Array to  */
        const queue = [];

        ORDER_OF_ROLES.forEach(roleId => {

            if(roleGroup.has(roleId)){

                queue.push({
                    roleId,
                    players: roleGroup.get(roleId)
                });

            }

        });

        return queue;
    }

    /**
     * Ensures all mafia-aligned roles are included in the mafia wake-up phase.
     * @param {Map<number, PlayerClass[]>} roleGroup Map of roleId to players
     */
    addAllMafiaToMafiaWakeUp(roleGroup){
        const allUniqueMafia = this.getAllUniqueMafia();
        if(!roleGroup.has(ROLE_IDS.MAFIJAS) && allUniqueMafia.length > 0){
            roleGroup.set(ROLE_IDS.MAFIJAS, []);
        }
        allUniqueMafia.forEach((player) => {
            roleGroup.get(ROLE_IDS.MAFIJAS).push(player);
        })
    }

    /**
     * Shuffles array in-place using Fisher-Yates algorithm.
     * @template T
     * @param {T[]} array - Array to shuffle
     * @returns {T[]} Shuffled array
     */
    shuffleArray(array) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    /**
     * @returns {PlayerClass[]} Array of all alive player objects
     */
    getAlivePlayers() {
        return this.players.filter(p => p.isAlive);
    }

    /**
     * @returns {PlayerClass[]} Array of all dead player objects
     */
    getDeadPlayers() {
        return this.players.filter(p => !p.isAlive);
    }

    /**
     * @returns {number} Number of alive players
     */
    getNumberOfAlivePlayers(){
        return this.getAlivePlayers().length;
    }

    /**
     * @returns {number} Number of lynch votes
     */
    getLynchVotes(){
        return this.lynchVotes;
    }

    /**
     * Adds a lynch vote to a player if the total number of votes
     * has not exceeded the number of alive players.
     * 
     * Increments both the player's vote count and global lynch vote counter.
     * @param {PlayerClass} player Target player object recieving the vote 
     */
    addLynchVote(player){
        const maxVotes = this.getNumberOfAlivePlayers();

        if(this.lynchVotes < maxVotes){
            player.addLynchVote();
            this.lynchVotes++;
        }
    }

    /**
     * Subtract a vote from player if target player has been woted for
     * @param {PlayerClass} player Target player object from who to subtract the vote 
     */
    removeLynchVote(player){
        if(player.votes > 0){
            player.removeLynchVote();
            this.lynchVotes--;
        }
    }

    /** Reset global lynch vote counter and every alive players individual vote counts */
    resetLynch(){
        this.lynchVotes = 0;
        for(const player of this.getAlivePlayers()){
            player.resetVotes();
        }
    }

    /**
     * Resolve lynch voting.
     * 
     * Handle ties, protected players and lynch related win cons
     * @returns {string | null} Result message describing the outcome
     */
    handleLynch(){
        const alivePlayers = this.getAlivePlayers();
        const maxVote = Math.max(...alivePlayers.map(p => p.getLynchVotes()))

        if(maxVote === 0){
            return LYNCH_MESSAGE.NO_VOTES;
        }

        const topVoted = alivePlayers.filter(p => p.getLynchVotes() === maxVote);
        const listOfNames = topVoted.map(p => p.name);

        this.resetLynch();

        if(topVoted.length > 1) return LYNCH_MESSAGE.TIE(maxVote, listOfNames.slice(0, -1).join(', '), listOfNames.at(-1));
        else{
            if(!topVoted[0].hasStatus(STATUS.JUDGED)){
                topVoted[0].kill();
                return this.checkLynchWinCondition(topVoted[0], maxVote);
            }
            else return LYNCH_MESSAGE.PROTECTED(topVoted[0].name, maxVote)
        }
    }

    /**
     * @param {string} alignment - Alignment of a player 
     * @returns {PlayerClass[]} Array of all alive players with specific alignment
     */
    getPlayersByAlignment(alignment) {
        return this.players.filter(p => 
        p.isAlive && p.getRoleAlignment() === alignment
        );
    }

    /**
     * Get a random role excluding the role of the targeted player
     * @param {PlayerClass} target - Player targeted by action 
     * @returns {string} Random string key from ROLES dictionary  
     */
    getRandomPlayerRole(target){
        const playersWithoutTarget = this.players.filter(p => p !== target);
        return ROLES[playersWithoutTarget[Math.floor(Math.random() * playersWithoutTarget.length)].roleId];
    }

    /**
     * Get a random town role excluding the role of the targeted player
     * @returns {string} Random string key from ROLES dictionary  
     */
    getRandomTownRole(){
        const townPlayers = this.players.filter(p => p.getRoleAlignment() == ALIGNMENT.TOWN);
        return ROLES[townPlayers[Math.floor(Math.random() * townPlayers.length)].roleId];
    }

    /**
     * Get a random mafia role excluding the role of the targeted player
     * @returns {string} Random string key from ROLES dictionary  
     */
    getRandomMafiaRole(){
        const mafiaPlayers = this.players.filter(p => p.getRoleAlignment() == ALIGNMENT.MAFIA && p.roleId != ROLE_IDS.KUM);
        return ROLES[mafiaPlayers[Math.floor(Math.random() * mafiaPlayers.length)].roleId];
    }

    /**
     * Returns all unique mafia roles that are alive and active in the game
     * @returns {PlayerClass[]} Array of player objects
     */
    getAllUniqueMafia(){
        return this.players.filter(p => 
        p.isAlive && p.isMafiaAligned() && p.roleId != ROLE_IDS.MAFIJAS
        );
    }

    /**
     * @param {PlayerClass[]} players Array of player objects in current night step 
     * @returns {boolean} True if every player dead
     */
    isEveryPlayerWithRoleDead(players){
        return players.every(player => !player.checkIfPlayerAlive());
    }

    /**
     * @param {PlayerClass[]} players Array of player objects in current night step 
     * @returns {boolean} True if every player blocked
     */
    isEveryPlayerWithRoleBlocked(players){
        return players.every(player => player.checkIfPlayerBlocked());
    }

    /**
     * @param {PlayerClass[]} players Array of player objects in current night step 
     * @returns {boolean} True if amnesiac has taken another role
     */
    hasRemembered(players){
        for(const player of players){
            if(player.remembered){
                return true;
            }
        }
    }

    /**
     * @param {PlayerClass[]} players Array of player objects in current night step 
     * @returns {boolean} True if parasite has taken another role
     */
    hasParasitised(players){
        for(const player of players){
            if(player.wasParasite){
                return true;
            }
        }
    }

    /**
     * Check if every player of current night step has acted
     * 
     * Available only if role of current night step is not AllForOne
     * @param {PlayerClass[]} players Array of player objects in current night step 
     * @returns {boolean} True if every player acted
     */
    isEveryPlayerActed(players){
        return players.every(player => player.acted === true);
    }

    /**
     * @returns { roleId: number, players: PlayerClass[] } Current night step
     */
    getCurrentNightStep(){
        return this.nightQueue[this.nightIndex] || null;
    }

    /** Increase nightIndex */
    advanceNight(){
        this.nightIndex++;
    }

    /**
     * Execute all night actions and return summary
     * @returns {string} Night result message
     */
    calculateNight(){
        this.deaths = [];
        this.survived = [];
        this.applyKills();
        return this.showNightResults();
    }

    /**
     * Remove judged status from every player
     */
    removeJudgedStatus(){
        this.players.forEach(player => {
            player.removeStatus(STATUS.JUDGED);
        });
    }

    /**
     * Calculate number of alive players visited by visitor.
     * 
     * Start visitor event if number of visited players equals to treshold and return visitor event 
     * message. 
     * @returns {string} Visitor event message | ""
     */
    calculateVisitorVisited(){
        this.visitorVisited = 0;
        for(const player of this.players) {
            if(player.hasStatus(STATUS.MARKED_BY_VISITOR) && player.isAlive){
                this.visitorVisited++;
            }
        }
        if(this.visitorVisited >= CONFIG.VISITOR_NUMBER_OF_PLAYERS_MARKED && this.checkIfVisitorAlive() && !this.visitorEvent){
            this.visitorEvent = true;
            return ROLE_MESSAGE.VISITOR_EVENT;
        } else return "";
    }

    /**
     * Logic for displaying night summary messages after night ended. 
     * @returns {string} Night summary message
     */
    showNightResults(){
        let message = ""
        message += this.calculateVisitorVisited();
        if(this.nightActions.silenced.length > 0){
            message += `<p> Igrači koji su ućutkani: ${this.nightActions.silenced.join(', ')}</p>`;
        }
        if(this.deaths.length > 0) {
            message += `<p>Igrači koji su ubijeni: ${this.deaths.join(', ')}</p>`;
        }
        if(this.nightActions.exposed.size > 0){
            message += this.generateReporterExposed();
        }
        if(this.survived.length > 0){
            message += `<p>Igrači koji su bili napadnuti: ${this.survived.join(', ')}</p>`;
        }
        message += this.checkIfVisitorKilled();
        const win = this.checkWinCondition();
        if(this.visitorEvent){
            this.visitorEventNights++;
        }
        if(win){
            message += win;
        }
        this.resetNight();
        if(message.length > 0) return message
        else return "Noć je bila mirna."
    }

    /**
     * Handle visitor event logic and return a vistor event message
     * @returns {string} Visitor event message
     */
    visitorEventMessage(){
        if(this.checkIfVisitorAlive() && CONFIG.VISITOR_EVENT_NIGHTS > this.visitorEventNights){
            return `<p> Ostalo je još ${CONFIG.VISITOR_EVENT_NIGHTS - this.visitorEventNights} noći! </p>`
        } else if (this.checkIfVisitorAlive()) {
            this.visitorEvent = false;
            return `<p> Svi u gradu su nestali! \n Posetilac je pobedio! </p>`
        }
        this.visitorEvent = false;
        return "";
    }

    /**
     * Check if visitor is dead and return visitor dead message
     * @returns {string} Visitor dead message | ""
     */
    checkIfVisitorKilled(){
        if(!this.checkIfVisitorAlive()) {
            this.visitorEvent = false;
            return ROLE_MESSAGE.VISITOR_STOPPED;
        }
        return "";
    }

    /**
     * @returns {boolean} true if visitor is alive
     */
    checkIfVisitorAlive(){
        return this.players.filter(p => p.roleId == ROLE_IDS.POSETILAC)[0].isAlive;
    }

    /**
     * Generates a message of who was found to be attacking who by the reporter
     * @returns {string} Message of reporters findings
     */
    generateReporterExposed(){
        let message = "";
        for(const [attacker, target] of this.nightActions.exposed){
            message += `<p>Reporter je snimio igrača ${attacker} kako napada igrača ${target}</p>`;
        }
        return message
    }

    /**
     * Moves a player into another role's night queue step.
     *
     * Used for effects like parasite role switching.
     *
     * @param {PlayerClass} player - Player being moved
     * @param {PlayerClass} target - Target whose role is copied
     */
    switchRoleInQueue(player, target){
        console.log(this.nightQueue)
        const targetRoleId = Number(target.roleId);

        let targetStep = this.nightQueue.find(step => step.roleId == targetRoleId);

        if(target.isAlignment(ALIGNMENT.MAFIA)){
            const mafiaGroup = this.nightQueue.find(entry => entry.roleId == ROLE_IDS.MAFIJAS);
            mafiaGroup.players.push(player)
        }
        if(targetStep){
            targetStep.players.push(player);
        }
    }

    /**
     * Begins clearing of night effects residue
     */
    resetNight(){
        this.nightIndex = 0;
        this.cleanupNightStatuses();
        this.clearNightActions();
    }

    /** Resets nightActions */
    clearNightActions() {
        this.nightActions = {
            kills: new Map(), 
            bodyguard: new Map(),
            silenced: [],
            exposed: new Map(),
            parasited: new Map()
        };
    }

    /**
     * Gets role behaviour with selected id
     * @param {string} roleId Key from ROLES dictionary
     * @returns {ROLE_BEHAVIOURS | null} Selected role behaviour
     */
    getRoleBehaviour(roleId) {
        return ROLE_BEHAVIOURS[Number(roleId)];
    }

    /**
     * Applies all kill actions, resolving protections, bodyguards,
     * parasite effects, and recording exposures.
     */
    applyKills() {
        for (const [attacker, target] of this.nightActions.kills){
            const targets = Array.isArray(target) ? target : [target];
            for (const t of targets) {
                if (t && t.isAlive) {
                    // Pyroman
                    if(t.hasStatus(STATUS.IGNITED)){
                        t.kill();
                        this.deaths.push(t.name);
                    } else if (!t.hasStatus(STATUS.PROTECTED)) {
                        const bodyguard = this.checkIfBodyguarded(t)
                        // Bodyguarded
                        if(bodyguard){
                            if(this.checkIfRecorded(bodyguard)){
                                this.nightActions.exposed.set(attacker.name, target.name);
                            }
                            bodyguard.kill();
                            this.checkIfParasitised(bodyguard);
                            this.deaths.push(bodyguard.name);
                            return;
                        }
                        // Reporter
                        if(this.checkIfRecorded(t)){
                            this.nightActions.exposed.set(attacker.name, target.name);
                        }
                        t.kill();
                        this.checkIfParasitised(t);
                        this.deaths.push(t.name);
                    } else {
                        this.survived.push(t.name);
                    }
                }
            }
        }
    }

    /**
     * Parasite logic for adopting new role
     * @param {PlayerClass} player Check target for parasitation
     */
    checkIfParasitised(player){
        if(this.nightActions.parasited.has(player)){
            const parasite = this.nightActions.parasited.get(player);
            parasite.roleId = player.roleId;
            parasite.successParasite = true;
            this.switchRoleInQueue(parasite, player);
        }
    }

    /**
     * Checks if targeted player has been bodyguarded, if true returns bodyguard player
     * @param {PlayerClass} player Check target for bodyguard
     * @returns {PlayerClass} Bodyguard that guarded targeted player
     */
    checkIfBodyguarded(player){
        for(const [key, value] of this.nightActions.bodyguard){
            if (value === player){
                return key;
            }
        }
    }

    /**
     * Checks if killed player was recorded by repotrter
     * @param {PlayerClass} target Player that was killed 
     * @returns {boolean} True if target has status RECORDED
     */
    checkIfRecorded(target){
        return target.hasStatus(STATUS.RECORDED);
    }

    /** Resets all temporary night statuses */
    cleanupNightStatuses() {
        this.players.forEach(player => {
            player.visitedBy = [];
            player.isBlocked = false;
            player.visitedByMafia = false;
            player.acted = false;
            player.removeStatus(STATUS.PROTECTED);
            player.removeBodyguardedStatuses();
            player.removeStatus(STATUS.ATTACK);
            player.removeStatus(STATUS.TRACKED);
            player.removeStatus(STATUS.CENSORED);
            player.removeStatus(STATUS.DUG_UP);
            player.removeStatus(STATUS.AMESIAC_TARGET);
            player.removeStatus(STATUS.CONFUSED);
            player.removeStatus(STATUS.SILENCED);
            player.removeStatus(STATUS.FALSIFIED);
            player.removeStatus(STATUS.RECORDED);
            player.removeStatus(STATUS.LOCKED_UP);
            player.removeStatus(STATUS.PARASITE_TARGET);
        });
    }


    /**
     * Checks if any win condition has been met
     * @returns {string | null} Win message or null if game continues
     */
    checkWinCondition() {       
        if (this.visitorEvent) {
            return this.visitorEventMessage();
        }
        if (this.townWinCon()) return this.townWin();
        if (this.mafiaWinCon()) return this.mafiaWin();
        
        return null;
    }

    /**
     * Checks if mafia win condition has been met
     * @returns {boolean} true if wincon met
     */
    mafiaWinCon(){
        const alive = this.getAlivePlayers();
        const town = alive.filter(p => p.isAlignment('Selo'));
        const mafia = alive.filter(p => p.isAlignment('Mafija'));
        return mafia.length >= town.length || mafia.length === town.length && alive.length === 2;
    }

    /**
     * Checks if town win condition has been met
     * @returns {boolean} true if wincon met
     */
    townWinCon(){
        const alive = this.getAlivePlayers();
        const mafia = alive.filter(p => p.isAlignment('Mafija'));
        return mafia.length === 0;
    }

    /**
     * Check if any lynch specific or general win condition has been met after lynching and
     * prevents town or mafia win conditions during visitor event
     * 
     * Handles visitor event after visitor lynched
     * @param {PlayerClass} player Voted out player 
     * @param {number} votes Number of votes
     * @returns {string} Lynch message
     */
    checkLynchWinCondition(player, votes){
        if(player.roleId == ROLE_IDS.LUDAK) return this.jesterWin(player, votes);
        if(player === this.executionTarget) return this.executionerWin(player, votes);
        if(this.visitorEvent){
            if(!this.checkIfVisitorAlive() && this.mafiaWinCon() || !this.checkIfVisitorAlive() && this.townWinCon()) {
                this.visitorEvent = false;
                return `${LYNCH_MESSAGE.LYNCHED(player.name, votes)} \n ${ROLE_MESSAGE.VISITOR_STOPPED} \n ${this.checkWinCondition()}`;
            }
            if(!this.checkIfVisitorAlive()) {
                this.visitorEvent = false;
                return `${LYNCH_MESSAGE.LYNCHED(player.name, votes)} \n ${ROLE_MESSAGE.VISITOR_STOPPED}`;
            }
        }
        if(this.mafiaWinCon() || this.townWinCon()) return `${LYNCH_MESSAGE.LYNCHED(player.name, votes)} \n ${this.checkWinCondition()}`;
        return LYNCH_MESSAGE.LYNCHED(player.name, votes);
    }

    townWin(){
        return WIN_MESSAGE.TOWN_WIN;
    }

    mafiaWin(){
        return WIN_MESSAGE.MAFIA_WIN;
    }

    jesterWin(player, votes){
        return LYNCH_MESSAGE.JESTER(votes, player.name)
    }

    executionerWin(player, votes){
        return LYNCH_MESSAGE.EXECUTIONER(votes, player.name, )
    }
}