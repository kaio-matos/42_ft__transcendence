import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    MATCH_BEGIN: "onMatchBegin",
    FRIEND_ACTIVITY_STATUS: "onFriendActivityStatusChange",
  }),
  Commands: Object.freeze({}),

  Communication: new ServerCommunication("/ws/player/"),
};
PlayerCommunication.Communication.connect();
