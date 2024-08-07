import { GET, POST } from "./http.mjs";

/**
 * @typedef {{ id: string, sender: import("./player.mjs").Player, text: string, created_at: string, updated_at: string }} Message
 */

/**
 * @typedef {{ id: string, messages: Message[], players: import("./player.mjs").Player[], is_private: boolean, created_at: string, updated_at: string }} Chat
 */

export const ChatService = {
  /**
   * @param {{ name?: string, players_id: string[]}} chat
   * @returns {Promise<Chat>}
   */
  async createChat(chat) {
    const { data } = await POST("/api/pong/chat/create", chat);
    return data.data;
  },

  /**
   * @returns {Promise<Chat[]>}
   */
  async getChats() {
    const { data } = await GET("/api/pong/chat");
    return data.data;
  },

  /**
   * @param {{ chat_id: string }} player
   * @returns {Promise<Chat>}
   */
  async getChat({ chat_id }) {
    const { data } = await GET("/api/pong/chat/" + chat_id);
    return data.data;
  },

  /**
   * @param {{ chat_id: string }} player
   * @returns {Promise<Chat>}
   */
  async blockChat({ chat_id }) {
    const { data } = await GET("/api/pong/chat/block/" + chat_id);
    return data.data;
  },
};
