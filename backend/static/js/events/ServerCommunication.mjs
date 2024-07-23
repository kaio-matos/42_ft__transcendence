export class ServerCommunication {
  /** @type {WebSocket} */
  socket;
  /** @type {Map<string, Set<(data: Record<string, any>) => void>} */
  events = new Map();

  /**
   * @param {string} path
   */
  constructor(path) {
    this.socket = new WebSocket(path);

    this.socket.onmessage = (event) => {
      let response;
      try {
        response = JSON.parse(event.data);
      } catch (err) {}

      this.events.forEach((listeners, key) => {
        if (key === response.event) {
          listeners.forEach((listener) => listener(response.data));
        }
      });
    };

    this.socket.onclose = (event) => {}; // TODO
  }

  /**
   * @param {string} event
   * @param {(data: Record<string, any>) => void} callback
   */
  addEventListener(event, callback) {
    let listeners = this.events.get(event);
    if (!listeners) {
      listeners = new Set();
      this.events.set(event, listeners);
    }
    listeners.add(callback);
    return this;
  }

  /**
   * @param {string} event
   * @param {(data: Record<string, any>) => void} callback
   */
  removeEventListener(event, callback) {
    const listeners = this.events.get(event);
    if (!listeners) return this;
    listeners.delete(callback);
    return this;
  }

  /**
   * @param {string} command
   * @param {object} payload
   */
  send(command, payload) {
    this.socket.send(
      JSON.stringify({
        command,
        payload,
      }),
    );
    return this;
  }
}
