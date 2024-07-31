import { ServerCommunication } from "./ServerCommunication.mjs";

export const TournamentCommunication = {
  Events: Object.freeze({
    TOURNAMENT_START: "onTournamentStart",
    TOURNAMENT_UPDATE: "onTournamentUpdate",
    TOURNAMENT_FINISH: "onTournamentFinish",
  }),
  Commands: Object.freeze({
    JOIN_TOURNAMENT: "JOIN_TOURNAMENT",
    KEY_PRESS: "KEY_PRESS",
  }),

  Communication: new ServerCommunication(),
};
