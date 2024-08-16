import { ServerCommunication } from "./ServerCommunication.mjs";

export const PlayerCommunication = {
  Events: Object.freeze({
    PLAYER_NOTIFY_MATCH_BEGIN: "onPlayerNotifyMatchBegin",
    PLAYER_NOTIFY_TOURNAMENT_END: "onPlayerNotifyTournamentEnd",
    FRIEND_ACTIVITY_STATUS: "onFriendActivityStatusChange",
  }),
  Commands: Object.freeze({}),

  Communication: new ServerCommunication("/ws/player/"),
};
PlayerCommunication.Communication.connect();
