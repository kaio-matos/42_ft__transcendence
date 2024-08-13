import { ServerCommunication } from "./ServerCommunication.mjs";

export const MatchCommunication = {
  Events: Object.freeze({
    MATCH_START: "onMatchStart",
    MATCH_UPDATE: "onMatchUpdate",
    MATCH_FINISH: "onMatchFinish",
  }),
  Commands: Object.freeze({
    JOIN_MATCH: "JOIN_MATCH",
    KEY_PRESS: "KEY_PRESS",
  }),

  Communication: new ServerCommunication(),
};
