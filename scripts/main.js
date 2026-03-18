
window.addEventListener("error", e => {
    alert(e.message);
});

import { GameState } from "./game-state.js";
import { UiCoordinator } from "./ui/ui-coordinator.js";
import { setupDevTools } from "./utils/dev-tools.js";

const game = new GameState();
const ui = new UiCoordinator(game);
const debug = true;

if (location.hostname === "localhost" ||
    location.hostname === "127.0.0.1") {
    setupDevTools(game, ui);
}


window.addEventListener('beforeunload', () => {
  ui.cleanup();
});
