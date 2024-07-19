import { GET } from "./http.mjs";

export const PlayerService = {
  async getPlayers() {
    const data = await GET("/api/pong/player");
    return data.data;
  },
};
