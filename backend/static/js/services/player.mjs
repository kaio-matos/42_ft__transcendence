import { GET, POST } from "./http.mjs";

/**
 * @typedef {{ name: string, email: string }} Player
 */

export const PlayerService = {
  /**
   * @returns {Promise<Player[]>}
   */
  async getPlayers() {
    const data = await GET("/api/pong/player");
    return data.data;
  },

  /**
   *
   * @param {{ name: string }} player
   * @returns {Promise<Player>}
   */
  async createPlayer(player) {
    const data = await POST("/api/pong/player/create", player);
    return data.data;
  },
};
