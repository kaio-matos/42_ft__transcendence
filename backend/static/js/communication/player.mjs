import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    MATCH_BEGIN: "onMatchBegin",
    TOURNAMENT_END: "onTournamentEnd",
    FRIEND_ACTIVITY_STATUS: "onFriendActivityStatusChange",
  }),
  Commands: Object.freeze({}),

  Communication: new ServerCommunication("/ws/player/"),
};
PlayerCommunication.Communication.connect();
