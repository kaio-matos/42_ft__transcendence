import { GET, POST } from "./http.mjs";

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   status: string,
 *   players: import("./player.mjs").Player[],
 *   child_upper: Match,
 *   child_lower: Match,
 *   winner: import("./player.mjs").Player | null,
 *   has_finished: boolean,
 *   confirmation?: { accepted: boolean, rejected: boolean },
 *   created_at: string,
 *   updated_at: string
 *  }} Match
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
   * Get the current active match
   * @returns {Promise<Match>}
   */
  async getMatch() {
    const { data } = await GET("/api/pong/match/get");
    return data.data;
  },

  /**
   * Get the current active match
   * @returns {Promise<Match>}
   */
  async acceptMatch() {
    const { data } = await GET("/api/pong/match/accept");
    return data.data;
  },

  /**
   * Get the current active match
   * @returns {Promise<Match>}
   */
  async rejectMatch() {
    const { data } = await GET("/api/pong/match/reject");
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
