export class ServerCommunication {
  /** @type {string} */
  path;
  /** @type {WebSocket | undefined} */
  socket;
  /** @type {Map<string, Set<(data: Record<string, any>) => void>} */
  events = new Map();

  /**
   * @param {string} path
   * @param {boolean} immediate
   */
  constructor(path = "", immediate = false) {
    this.path = path;
    if (immediate) {
      this.connect();
    }
  }

  /**
   * @param {string} path
   */
  setPath(path) {
    this.path = path;
    return this;
  }

  isConnecting() {
    return this.socket?.readyState === WebSocket.CONNECTING;
  }

  isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  isClosing() {
    return this.socket?.readyState === WebSocket.CLOSING;
  }

  isClosed() {
    if (!this.socket) return true;
    return this.socket.readyState === WebSocket.CLOSED;
  }

  /**
   * @param {() => void} onConnect
   */
  connect(onConnect) {
    this.socket = new WebSocket(this.path);

    this.socket.onopen = onConnect;

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

    return this;
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
