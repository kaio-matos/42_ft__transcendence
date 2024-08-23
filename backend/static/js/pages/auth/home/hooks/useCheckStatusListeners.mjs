import { PlayerCommunication } from "../../../../communication/player.mjs";
import { session } from "../../../../state/session.mjs";


export function useCheckStatusListeners() {
  function respondToPing() {
    PlayerCommunication.Communication.send({
      event: PlayerCommunication.Events.CHECK_PLAYER_STATUS,
      data: { player_id: session.player.id },
    });
  }

  // Escutando o evento de verificação de status
  PlayerCommunication.Communication.addEventListener(
    PlayerCommunication.Events.CHECK_PLAYER_STATUS,
    () => {
      respondToPing();
    },
  );

  // Simulação de resposta imediata ao entrar na página
  respondToPing();
}
