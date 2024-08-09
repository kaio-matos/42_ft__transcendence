import { ServerCommunication } from "./ServerCommunication.mjs";

export const ChatCommunication = {
  Events: Object.freeze({
    CHAT_JOIN: "onChatJoin",
    CHAT_MESSAGE: "onChatMessage",
  }),
  Commands: Object.freeze({
    CHAT_JOIN: "CHAT_JOIN",
    CHAT_SEND_MESSAGE: "CHAT_SEND_MESSAGE",
  }),

  Communication: new ServerCommunication(),
};
