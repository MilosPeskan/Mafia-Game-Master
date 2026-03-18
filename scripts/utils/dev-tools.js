export function setupDevTools(game, ui) {

    function spawnTestPlayers() {

        game.players = [];
        game.roles = [];

        const players = ["Marko", "Nikola", "Jovan", "Stefan", "Ivan", "Nemanja"];

        players.forEach(name => game.addPlayer(name));

        // Example role IDs
        [1,2,13,12,32,21].forEach(role => game.addRole(role));

        game.initializeGame();

        console.log("✅ Test players created");
        console.log(game.players)
    }

    function goto(menu) {

        const map = {
            main: ui.mainMenu,
            role: ui.roleMenu,
            reveal: ui.revealMenu,
            game: ui.gameMenu,
            info: ui.infoMenu,
            night: ui.nightMenu,
            action: ui.actionMenu
        };

        ui.hideAll();

        if(map[menu]) {
            map[menu].show("grid");
            console.log("➡️ moved to:", menu);
        }
    }

    function skipToGame() {
        spawnTestPlayers();
        goto("game");
        ui.gameMenu.displayPlayers();
    }

    // expose globally
    globalThis.debug = {
        game,
        ui,
        spawnTestPlayers,
        goto,
        skipToGame
    };

    document.addEventListener("keydown", e =>{
        if(e.ctrlKey && e.key === "g") {
            skipToGame();
        }
    })
}
