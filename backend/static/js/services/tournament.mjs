import { GET, POST } from "./http.mjs";

/**
 * @typedef {{ id: string, name: string, players: import("./player.mjs").Player[] }} Tournament
 */

export const TournamentService = {
  /**
   * @returns {Promise<Tournament[]>}
   */
  async getTournaments() {
    const { data } = await GET("/api/pong/tournament");
    return data.data;
  },

  /**
   * @returns {Promise<Tournament>}
   */
  async getTournament() {
    const { data } = await GET("/api/pong/tournament/get");
    return data.data;
  },

  /**
   * Accept the current active tournament
   * @returns {Promise<Tournament>}
   */
  async acceptTournament() {
    const { data } = await GET("/api/pong/tournament/accept");
    return data.data;
  },

  /**
   * Accept the current active tournament
   * @returns {Promise<Tournament>}
   */
  async rejectTournament() {
    const { data } = await GET("/api/pong/tournament/reject");
    return data.data;
  },

  /**
   * @param {{ name: string, players_id: string[] }} payload
   * @returns {Promise<Tournament>}
   */
  async createTournament(payload) {
    const { data } = await POST("/api/pong/tournament/create", payload);
    return data.data;
  },
};
