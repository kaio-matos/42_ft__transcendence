import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    TOURNAMENT_BEGIN: "onTournamentBegin",
    FRIEND_ACTIVITY_STATUS: "onFriendActivityStatusChange",
  }),
  Commands: Object.freeze({}),

  Communication: new ServerCommunication("/ws/player/"),
};
PlayerCommunication.Communication.connect();
