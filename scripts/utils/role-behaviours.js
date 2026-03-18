/**
 * ROLE BEHAVIOURS - Definicije noćnih akcija za svaku ulogu
 * 
 * Svaki behaviour ima:
 * - name: Tekst koji se prikazuje u UI
 * - canTargetDead: Da li može birati mrtve igrače
 * - canTargetSelf: Da li može birati sebe
 * - execute: Funkcija koja izvršava akciju (menja game state)
 */

import { ROLE_IDS, ROLE_MESSAGE, STATUS } from "../constants.js";

export const ROLE_BEHAVIOURS = {
    
    // ==========================================
    // SELO - ISTRAŽNE ULOGE
    // ==========================================
    
    1: { // Detektiv
        name: "Detektiv bira koga proverava",
        allForOne: true,
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {            
            // Dodaj status da je istražen (opciono, za tracking)
            target.addStatus(STATUS.INVESTIGATED);
            target.addVisitor(player);
            const text = investigate(player, target, gameState);

            // Vrati poruku koja će biti prikazana igraču
            return {
                success: true,
                result: null, 
                popup: text
            };
        }
    },

    2: { // Doktor
        name: "Doktor bira koga leči",
        canTargetDead: false,
        canTargetSelf: true,
        needsTarget: true,
        
        execute(player, target, gameState) {
            target.addStatus(STATUS.PROTECTED);
            target.addVisitor(player);
            // Dodaj u listu zaštićenih
                        
            return {
                success: true,
                message: `Štitite ${target.name}`
            };
        }
    },

    3: null, //Seljak

    4: { // Mafijaš
        name: "Mafija bira koga ubija",
        canTargetDead: false,
        canTargetSelf: false,
        allForOne: true,
        targetOnlyDifferentAlignment: true,
        needsTarget: true,
        needsVoting: true,
        
        execute(player, target, gameState) {
            // Svaki mafijaš glasa za metu
            target.addStatus(STATUS.ATTACK);
            target.addVisitor(player);
            gameState.nightActions.kills.set(player, target);
                        
            return {
                success: true,
                message: `Napali ste ${target.name}`,
            };
        }
    },

    5: null, // Kum
    
    6: { // Savetnik
        name: "Savetnik istražuje igrača",
        allForOne: true,
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            target.addStatus(STATUS.INVESTIGATED);
            target.addVisitor(player);
            const text = investigate(player, target, gameState);
            
            // Vrati poruku koja će biti prikazana igraču
            return {
                success: true,
                result: null, 
                popup: text
            };
        }
    },
    
    7: { // Pratilac
        name: "Pratilac blokira igrača",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            // Blokiraj akciju cilja
            target.addStatus(STATUS.BLOCKED);
            target.addVisitor(player);
            target.block();
                        
            return {
                success: true,
                message: `Blokirali ste ${target.name}`
            };
        }
    },

    8: { // Serijski ubica
        name: "Serijski ubica bira žrtvu",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            // Dodaj u listu za ubistvo
            target.addStatus(STATUS.ATTACK);
            target.addVisitor(player);
            gameState.nightActions.kills.set(player, target);
                        
            return {
                success: true,
                message: `Napali ste ${target.name}`
            };
        }
    },

    9: null, // Ludak
    10: null, // Dzelat

    11: { // Veštica
        name: "Veštica preusmerava akciju",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        needsTwoTargets: true, // Bira koga i na koga
        
        execute(player, target1, target2, gameState) {
            // Preusmeri akciju target1 na target2
            gameState.nightActions.switched.set(target1.id, target2.id);
            
            return {
                success: true,
                message: `Preusmerili ste ${target1.name} na ${target2.name}`
            };
        }
    },
    
    12: { // Piroman
        name: "Piroman poliva ili pali",
        secondaryName: "Zapali sve",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        needsSecondTarget: false,
        needsChoice: true, // Može ili polivati ili zapaliti
        secondaryAction: "ignite",
        
        execute(player, target, gameState, action = "douse") {
            if (action === "douse") {
                // Polij benzinom
                target.addStatus(STATUS.DOUSED);
                target.addVisitor(player);
                
                return {
                    success: true,
                    message: `Poliveni igrač: ${target.name}`
                };
            } else if (action === "ignite") {
                // Zapali sve polivene
                const dousedPlayers = gameState.players.filter(p => p.hasStatus(STATUS.DOUSED));
                
                dousedPlayers.forEach(p => {
                    p.addStatus(STATUS.IGNITED);
                    p.removeStatus(STATUS.DOUSED);
                });

                gameState.nightActions.kills.set(player, dousedPlayers);
                
                return {
                    success: true,
                    message: `Zapalili ste ${dousedPlayers.length} igrača!`
                };
            }
        }
    },

    13: { // Telohranitelj
        name: "Telohranitelj bira koga čuva",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            // Slično doktoru, ali umire ako je meta napadnuta
            target.addStatus(STATUS.BODYGUARDED(player.name));
            target.addVisitor(player);
            gameState.nightActions.bodyguard.set(player, target);
            
            return {
                success: true,
                message: `Čuvate ${target.name}`
            };
        }
    },

    14: null, //Serif
    
    15: { // Špijun
        name: "Špijun posmatra mafiju",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: false,
        
        execute(player, target, gameState) {
            // Špijun vidi sve koje je mafija posetila
            let mafiaVisits = [];
            const mafiaVisited = gameState.players.filter(p => p.isVisitedByMafia());
            if (mafiaVisited.length > 0) {
                for(const p of mafiaVisited){
                    mafiaVisits.push(p.name);
                }
            };            
            return {
                success: true,
                result: mafiaVisits,
                popup: ROLE_MESSAGE.MAFIA_VISIT(mafiaVisits.join(', ') || "nikoga")
            };
        }
    },
    
    16: { // Tragač
        name: "Tragač prati igrača",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            // Proveri koga je meta posetila
            // Za sada samo zabeleži
            target.addStatus(STATUS.TRACKED);
            target.addVisitor(player);
            let visited = `Igrač ${target.name} nikog nije posetio`;
            let listOfVisitors = [];
            gameState.players.forEach((p) => {
                if(p.isVisitedBySpecificPlayer(target)){
                    listOfVisitors.push(p.name);
                    if(listOfVisitors.length > 1){
                        visited = `Igrač ${target.name} je posetio ${listOfVisitors.slice(0, -1)} ${listOfVisitors.at(-1)}`;
                    }
                    else{
                        visited = `Igrač ${target.name} je posetio igrača ${listOfVisitors[0]}`;
                    }
                }
            })
            
            return {
                success: true,
                result: null,
                popup: visited
            };
        }
    },
    
    17: { // Redaktor (Medium u ROLES - verovatno greška)
        name: "Redaktor cenzuriše informacije",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            target.addStatus(STATUS.CENSORED);
            target.addVisitor(player);
            
            return {
                success: true,
                message: `Cenzurisali ste informacije o ${target.name}`
            };
        }
    }, 
    
    18: { // Eskort
        name: "Eskort blokira igrača",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            // Blokiraj akciju cilja
            target.addStatus(STATUS.BLOCKED);
            target.addVisitor(player);
            target.block();
                        
            return {
                success: true,
                message: `Blokirali ste ${target.name}`
            };
        }
    }, 
    
    19: { // Pogrebnik
        name: "Pogrebnik istražuje mrtvog",
        allForOne: true,
        canTargetDead: true,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            if (!target.isAlive) {
                target.addStatus(STATUS.DUG_UP);
                target.addVisitor(player);
                const text = investigate(player, target, gameState);
                
                return {
                    success: true,
                    result: role,
                    popup: text
                };
            }
            
            return {
                success: false,
                message: "Možeš birati samo mrtve igrače!"
            };
        }
    },
    
    20: { // Amnezicar
        name: "Amnezicar preuzima ulogu",
        canTargetDead: true,
        canTargetSelf: false,
        needsTarget: true,
        
        execute(player, target, gameState) {
            if (!target.isAlive) {
                // Preuzmi ulogu mrtvog igrača
                player.remember();
                target.addVisitor(player);
                player.roleId = target.roleId;
                gameState.switchRoleInQueue(player, target);
                
                return {
                    success: true,
                    popup: `Preuzeli ste ulogu: ${target.getRoleName()}`,
                    result: target.getRoleName()
                };
            }
            
            return {
                success: false,
                message: "Možete birati samo mrtve igrače!"
            };
        }
    },

    21: {//Trovac
        name: "Koga trovač truje?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.CONFUSED);
            target.addVisitor(player);

            return {
                success: true,
                message: `Otrovali ste ${target.name}`
            };
        }

    },
    22: {//Ucenjivac
        name: "Koga ucenjivač ućutkuje?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.SILENCED);
            target.addVisitor(player);
            gameState.nightActions.silenced.push(target.name)

            return {
                success: true,
                message: `Ucenili ste igrača ${target.name}`
            };
        }
    },
    23: {// Falsifikator
        name: "Koga ucenjivač ućutkuje?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.FALSIFIED);
            target.addVisitor(player);

            return {
                success: true,
                message: `Falsifikovali ste podatke igrača ${target.name}`
            };
        }
    },
    24: null,
    25: null,
    26: {// Reporter
        name: "Koga ozvučuje reporter?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.RECORDED);
            target.addVisitor(player);

            return {
                success: true,
                message: `Ozvučili ste igrača ${target.name}`
            };
        }
    },
    27: null,
    28: {// Sudija
        name: "Koga sudija štiti od pogubljenja?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.JUDGED);
            target.addVisitor(player);

            return {
                success: true,
                message: `Zaštitili ste igrača ${target.name} od pogubljenja`
            };
        }
    },
    29: {// Posetilac
        name: "Koga će █████████ posetiti?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.MARKED_BY_VISITOR);
            target.addVisitor(player);

            return {
                success: true,
                message: `Posetili ste igrača ${target.name}.`, 
                popup: `Ukupno posećenih ${gameState.visitorVisited + 1}`
            };
        }
    },
    30: {// Tamnicar
        name: "Koga će tamničar zatvoriti?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            target.addStatus(STATUS.PROTECTED);
            target.addStatus(STATUS.BLOCKED);
            target.addVisitor(player);
            target.block();

            return {
                success: true,
                message: `Zatvorili ste igrača ${target.name}.`
            };
        }
    },
    31: null,
    32: {// Parazit
        name: "Za koga će se parazit zakačiti?",
        canTargetDead: false,
        canTargetSelf: false,
        needsTarget: true,

        execute(player, target, gameState) {
            if(!player.successParasite)
            target.addStatus(STATUS.PARASITE_TARGET);
            target.addVisitor(player);
            gameState.nightActions.parasited.set(target, player)

            return {
                success: true,
                message: `Zakačili ste se za igrača ${target.name}.`
            };
        }
    }
};

/**
 * Helper funkcija za proveru da li uloga ima noćnu akciju
 */
export function hasNightAction(roleId) {
    const behaviour = ROLE_BEHAVIOURS[Number(roleId)];
    return behaviour !== null && behaviour !== undefined;
}

export function getRoleTextForButton(roleId){
    return ROLE_BEHAVIOURS[Number(roleId)].name;
}

export function hasParasitised(roleId, player, gameState){
    if(player.successParasite){

    }
}

/*Helper za istrazivacke akcije */ 
export function investigate(player, target, gameState){
    let text = `Igrač ${target.name} ima ulogu ${target.getRoleName()} (${target.getRoleAlignment()})`;
    if(target.hasStatus(STATUS.CENSORED)){
        text = text.replace(/\S/g, "█");
    } else if(player.hasStatus(STATUS.CONFUSED)){
        const role = gameState.getRandomPlayerRole(target);
        text = `Igrač ${target.name} ima ulogu ${role.role} (${role.alignment})`
    } else if(target.roleId == ROLE_IDS.KUM){
        const role = gameState.getRandomTownRole();
        text = `Igrač ${target.name} ima ulogu ${role.role} (${role.alignment})`
    } else if(target.hasStatus(STATUS.FALSIFIED)){
        const role = gameState.getRandomMafiaRole();
        text = `Igrač ${target.name} ima ulogu ${role.role} (${role.alignment})`
    }
    return text;
}

/**
 * Helper funkcija za dobijanje valid targets za ulogu
 */
export function getValidTargets(roleId, player, gameState) {
    const behaviour = ROLE_BEHAVIOURS[Number(roleId)];
    
    if (!behaviour) return [];
    
    let targets;
    
    if (behaviour.canTargetDead) {
        targets = gameState.getDeadPlayers();
    } else {
        targets = gameState.getAlivePlayers();
    }

    if(roleId == ROLE_IDS.PIROMAN){
        targets = targets.filter(t => !t.hasStatus(STATUS.DOUSED));
    } else if (roleId == ROLE_IDS.POSETILAC){
        targets = targets.filter(t => !t.hasStatus(STATUS.MARKED_BY_VISITOR));
    }
    
    // Ukloni sebe ako ne može sebe
    if (!behaviour.canTargetSelf) {
        targets = targets.filter(t => t.id !== player.id);
    }
    if (behaviour.targetOnlyDifferentAlignment){
        targets = targets.filter(t => t.getRoleAlignment() !== player.getRoleAlignment());
    }
    
    return targets;
}