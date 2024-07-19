import { GET } from "./http.mjs";

/**
 * @typedef {{ name: string, email: string }} Player
 */

export const PlayerService = {
  /**
   * @returns {Player[]}
   */
  async getPlayers() {
    const data = await GET("/api/pong/player");
    return data.data;
  },
};
