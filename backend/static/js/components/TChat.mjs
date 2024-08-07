import { ChatCommunication } from "../communication/chat.mjs";
import { session } from "../state/session.mjs";
import { attachBootstrap, Component } from "./component.mjs";
import { Input } from "./Input.mjs";
import { Loading } from "./Loading.mjs";
import { TConditional } from "./TConditional.mjs";

export class TChat extends HTMLElement {
  static observedAttributes = [];

  /** @type {Loading} */
  t_loading;

  /** @type {Input} */
  t_input;

  /** @type {TConditional} */
  t_conditional_show_chat;

  /** @type {Component} */
  form;

  /** @type {Component} */
  container;

  /** @type {Component} */
  messages_container;

  /** @type {import("../services/chat.mjs").Chat} */
  chat;

  constructor() {
    super();
    this.container = new Component("div").class(
      "border border-secondary p-2 rounded",
    );
    this.container.element.innerHTML = `
      <p>Chat</p>

      <t-conditional condition="false">
        <t-loading slot="if" id="loading-chat" loading="true" style="min-height: 70vh;">
          <div id="chat" class="border border-secondary p-2 rounded overflow-y-auto mb-3" style="height: 70vh;">
          </div>

          <form class="d-flex gap-1 p-2 mt-3 border border-secondary rounded">
            <t-input label="Mensagem" class="col-8"></t-input>

            <t-button class="d-block col-4" btn-class="w-100 h-100">Send</t-button>
          </form>
        </t-loading>
        <div slot="else" class="border border-secondary p-2 rounded overflow-y-auto mb-3" style="height: 70vh;">
          No chat selected
        </div>
      </t-conditional>
    `;

    this.form = new Component(this.container.element.querySelector("form"));
    this.t_input = this.container.element.querySelector("t-input");
    this.t_conditional_show_chat =
      this.container.element.querySelector("t-conditional");
    this.t_loading = this.container.element.querySelector("#loading-chat");
    this.messages_container = new Component(
      this.container.element.querySelector("#chat"),
    );

    this.form.addEventListener("submit", () => {
      if (!ChatCommunication.Communication.isOpen()) return;

      const message = this.t_input.value;
      if (!message) return;

      this.t_input.value = "";
      ChatCommunication.Communication.send(
        ChatCommunication.Commands.CHAT_SEND_MESSAGE,
        { sender_id: session.player.id, text: message },
      );
      this.t_input.focus();
    });
  }

  /**
   * @param {import("../services/chat.mjs").Chat} chat
   * @param {(message: import("../services/chat.mjs").Message) => void} onNewMessage
   */
  setChat(chat, onNewMessage) {
    this.t_loading.setLoading(true);
    this.t_conditional_show_chat.setCondition(true);
    this.chat = chat;
    ChatCommunication.Communication.disconnect(() => {
      ChatCommunication.Communication.setPath("/ws/chat/" + this.chat.id);

      ChatCommunication.Communication.connect(() => {
        this.t_input.value = "";
        this.messages_container.clear();
        this.appendMessages(this.chat.messages);

        ChatCommunication.Communication.addEventListener(
          ChatCommunication.Events.CHAT_MESSAGE,
          (message) => {
            onNewMessage(message);
            this.appendMessages(message);
            this.showMessage(message);
          },
        );
        this.t_loading.setLoading(false);
        this.t_input.focus();
        this.showMessage(this.chat.messages.at(-1));
      });
    });
  }

  /**
   *  @param {import("../services/chat.mjs").Message} message
   */
  showMessage(message) {
    this.messages_container.element
      .querySelector(`[data-id="${message.id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  /**
   *  @param {import("../services/chat.mjs").Message | import("../services/chat.mjs").Message[]} messages
   */
  appendMessages(messages) {
    if (!Array.isArray(messages)) messages = [messages];

    messages.forEach((message) =>
      this.messages_container.children([
        new Component("span", {
          textContent: `${message.sender.name}: ${message.text}`,
        })
          .attributes({ "data-id": message.id })
          .class("d-block"),
      ]),
    );
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = "<style>:host { display: block; }</style>";
    attachBootstrap(shadow);

    shadow.appendChild(this.container.element);
  }

  disconnectedCallback() {
    ChatCommunication.Communication.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}
