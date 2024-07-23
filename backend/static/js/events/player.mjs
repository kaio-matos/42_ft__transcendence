import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    TOURNAMENT_JOIN: "onTournamentJoin",
  }),
  Commands: Object.freeze({
    JOIN_TOURNAMENT: "JOIN_TOURNAMENT",
  }),

  Communication: new ServerCommunication("events/player/"),
};
