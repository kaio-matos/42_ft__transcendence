import { Player } from "../game/player.mjs";
import { GET, POST } from "./http.mjs";

/**
 * @typedef {{ name: string, players: Player[] }} Tournament
 */

export const TournamentService = {
  /**
   * @returns {Promise<Tournament[]>}
   */
  async getTournaments() {
    const data = await GET("/api/pong/tournament");
    return data.data;
  },

  /**
   *
   * @returns {Promise<Tournament>}
   */
  async createTournament(player) {
    const data = await POST("/api/pong/tournament/create", player);
    return data.data;
  },
};
