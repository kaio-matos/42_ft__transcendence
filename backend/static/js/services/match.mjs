import { GET, POST } from "./http.mjs";

/**
 * @typedef {{ id: string, name: string, players: import("./player.mjs").Player[] }} Match
 */

export const MatchService = {
  /**
   * @returns {Promise<Match[]>}
   */
  async getMatches() {
    const { data } = await GET("/api/pong/match");
    return data.data;
  },

  /**
   * @param {{ match_id: string }} param0
   * @returns {Promise<Match>}
   */
  async getMatch({ match_id }) {
    const { data } = await GET("/api/pong/match/" + match_id);
    return data.data;
  },

  /**
   * @returns {Promise<Match>}
   */
  async findMatch() {
    const { data } = await GET("/api/pong/match/matchmaking");
    return data.data;
  },

  /**
   * @param {{ challenged_player_id: string }} payload
   * @returns {Promise<Match>}
   */
  async createMatch(payload) {
    const { data } = await POST("/api/pong/match/create", payload);
    return data.data;
  },
};
