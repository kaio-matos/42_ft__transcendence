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
   * @param {{ tournament_id: string }} param0
   * @returns {Promise<Tournament>}
   */
  async getTournament({ tournament_id }) {
    const { data } = await GET("/api/pong/tournament/" + tournament_id);
    return data.data;
  },

  /**
   * @returns {Promise<Tournament>}
   */
  async findTournament() {
    const { data } = await GET("/api/pong/tournament/matchmaking");
    return data.data;
  },

  /**
   * @param {{ challenged_player_id: string }} payload
   * @returns {Promise<Tournament>}
   */
  async createTournament(payload) {
    const { data } = await POST("/api/pong/tournament/create", payload);
    return data.data;
  },
};
