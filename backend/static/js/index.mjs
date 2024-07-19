import { Router } from "./router/router.mjs";
import { PlayerService } from "./services/player.mjs";

console.log("Hello World");

const players = await PlayerService.getPlayers();
console.log(players);
