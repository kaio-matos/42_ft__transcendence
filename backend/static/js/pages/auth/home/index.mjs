import { Component } from "../../../components/component.mjs";
import { router } from "../../../index.mjs";
import { PlayerService } from "../../../services/player.mjs";
import { session } from "../../../state/session.mjs";
import { useFriendsList } from "./hooks/useFriendsList.mjs";
import { useAddFriend } from "./hooks/useAddFriend.mjs";
import { useCreateTournament } from "./hooks/useCreateTournament.mjs";
import { useFindMatch } from "./hooks/useFindMatch.mjs";
import { useMatchListeners } from "./hooks/useMatchListeners.mjs";
import { useTournamentListeners } from "./hooks/useTournamentListeners.mjs";
import { useCreateMatch } from "./hooks/useCreateMatch.mjs";

/** @type {import("../../router/router.mjs").Page} */
export const Home = () => {
  const page = new Component("div")
    .class("container mx-auto row")
    .styles({ maxHeight: "80vh" });

  page.element.innerHTML = `
    <t-chat class="col-8"></t-chat>
    <div class="d-flex flex-column border border-secondary p-2 rounded col-4">
      <div class="d-flex gap-1 mb-2">
        <t-button to="/auth/profile" class="d-block flex-grow-1" btn-class="w-100">${session.player.email}</t-button>
        <t-button id="logout-button" class="d-block" theme="danger">Logout</t-button>
      </div>

      <div class="border border-secondary p-2 rounded">
        <strong class="mb-2 d-block">Adicionar jogador como amigo</strong>

        <form id="add-friend-form" class="d-flex gap-1">
          <t-input label="Email" class="col-8"></t-input>

          <t-button class="d-block col-4" btn-class="w-100 h-100">Adicionar</t-button>
        </form>
      </div>

      <div class="border border-secondary p-2 my-3 rounded overflow-y-auto" style="height: 50vh">
        <strong class="mb-2 d-block">Amigos</strong>
        <t-loading id="loading-players" loading="true">
          <ul id="players-list" class="list-group">
            Nenhum amigo encontrado
          </ul>
        </t-loading>
      </div>

      <div id="tournament-create-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Criar Torneio</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <t-input label="Nome"></t-input>
              <t-multiple-select class="mt-2"></t-multiple-select>
            </div>
            <div class="modal-footer">
              <t-button data-bs-dismiss="modal" theme="secondary">Fechar</t-button>
              <t-button id="tournament-create-modal-create-button">Criar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="match-create-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Criar Partida</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <t-multiple-select class="mt-2"></t-multiple-select>
            </div>
            <div class="modal-footer">
              <t-button data-bs-dismiss="modal" theme="secondary">Fechar</t-button>
              <t-button id="match-create-modal-create-button">Criar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="match-confirmation-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Partida</h5>
            </div>
            <div class="modal-body">
              <p>Você aceita a partida?</p>
            </div>
            <div class="modal-footer">
              <t-button id="match-confirmation-modal-reject-button" theme="danger">Rejeitar</t-button>
              <t-button id="match-confirmation-modal-accept-button">Aceitar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="match-awaiting-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Partida</h5>
            </div>
            <div class="modal-body">
              <p>Por favor aguarde pela confirmação dos outros participantes</p>
              <p>Você será redirecionado automaticamente assim que todos os participantes aceitarem</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tournament-confirmation-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Torneio</h5>
            </div>
            <div class="modal-body">
              <p>Você aceita o torneio?</p>

            </div>
            <div class="modal-footer">
              <t-button id="tournament-confirmation-modal-reject-button" theme="danger">Rejeitar</t-button>
              <t-button id="tournament-confirmation-modal-accept-button">Aceitar</t-button>
            </div>
          </div>
        </div>
      </div>

      <div id="tournament-awaiting-modal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Torneio</h5>
            </div>
            <div class="modal-body">
              <p>Por favor aguarde pela confirmação dos outros participantes</p>
              <p>Você será redirecionado automaticamente assim que todos os participantes aceitarem</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border border-secondary p-2 mt-auto rounded">
        <t-button id="match-create-open-modal-button" class="d-block" btn-class="w-100">Criar Partida</t-button>
      </div>


      <div class="border border-secondary p-2 mt-auto rounded">
        <t-button id="tournament-create-open-modal-button" class="d-block" btn-class="w-100">Criar Torneio</t-button>
      </div>


      <div class="border border-secondary p-2 mt-auto rounded">
        <t-button id="find-match-button" class="d-block" btn-class="w-100">Encontrar Partida</t-button>
        <t-errors id="find-match-errors" class="mt-2"></t-errors>
      </div>
    </div>
  `;

  const { updateFriendsList } = useFriendsList(page);
  useAddFriend(page, { updateFriendsList });
  useCreateMatch(page);
  useCreateTournament(page);
  useFindMatch(page);
  useMatchListeners(page);
  useTournamentListeners(page);

  const t_logout_button = page.element.querySelector("#logout-button");

  t_logout_button.button.addEventListener("click", async () => {
    try {
      t_logout_button.setLoading(true);
      await PlayerService.logout();
    } catch {
    } finally {
      t_logout_button.setLoading(false);
      session.player = undefined;
      router.navigate("/login");
    }
  });

  return page;
};
