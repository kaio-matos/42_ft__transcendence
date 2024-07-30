import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    TOURNAMENT_BEGIN: "onTournamentBegin",
  }),
  Commands: Object.freeze({
    JOIN_TOURNAMENT: "JOIN_TOURNAMENT",
  }),

  Communication: new ServerCommunication("ws/player/"),
};
PlayerCommunication.Communication.connect();
