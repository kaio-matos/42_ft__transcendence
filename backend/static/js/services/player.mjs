import { GET, POST, PUT } from "./http.mjs";

/**
 * @typedef {{ id: string, name: string, email: string }} Player
 */

export const PlayerService = {
  /**
   * @returns {Promise<Player[]>}
   */
  async getPlayers() {
    const { data } = await GET("/api/pong/player");
    return data.data;
  },

  /**
   * @param {{ email: string, password: string }} player
   * @returns {Promise<Player>}
   */
  async login(player) {
    const { data } = await POST("/api/pong/player/login", player);
    return data.data;
  },

  /**
   * @param {{ name: string, email: string, password: string }} player
   * @returns {Promise<Player>}
   */
  async createPlayer(player) {
    const { data } = await POST("/api/pong/player/create", player);
    return data.data;
  },

  /**
   * @param {{ name: string }} player
   * @returns {Promise<Player>}
   */
  async updatePlayer(player) {
    const { data } = await PUT("/api/pong/player/update", player);
    return data.data;
  },

  /**
   * @returns {Promise<Player[]>}
   */
  async getFriends() {
    const { data } = await GET("/api/pong/player/friends");
    return data.data;
  },

  /**
   * @param {{ email: string }} payload
   * @returns {Promise<Player>}
   */
  async addFriend(payload) {
    const { data } = await POST("/api/pong/player/friends/add", payload);
    return data.data;
  },

  /**
   * @param {string} playerId
   * @returns {Promise<{player: Player, chat: string[]}>}
   */
  async getChatWith(playerId) {
    return new Promise((resolve) =>
      resolve({
        player: { name: "Kaio" },
        chat: `In the year 1878 I took my degree of Doctor of Medicine of the
           University of London, and proceeded to Netley to go through the
           course prescribed for surgeons in the army. Having completed my
           studies there, I was duly attached to the Fifth Northumberland
           Fusiliers as Assistant Surgeon. The regiment was stationed in India
           at the time, and before I could join it, the second Afghan war had`.split(
          " ",
        ),
      }),
    );
  },
};
