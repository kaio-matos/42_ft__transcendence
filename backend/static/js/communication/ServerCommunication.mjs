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
    return this;
  }

  /**
   * @param {() => void} onClose
   */
  disconnect(onClose) {
    if (this.isClosed()) {
      onClose();
      return this;
    }
    this.socket.onclose = onClose;
    this.socket.close();
    this.socket.onmessage = () => {};
    this.events.clear();
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

  // TODO: We are not handling errors (for example trying to send a message with more than 1000 characters will throw an error)
  // The backend is returning the event 'onError' with information about which command caused the error and the error itsself
  /**
   * @param {string} command
   * @param {object} payload
   * @param {undefined | (Record<string, any>) => void} onError
   */
  send(command, payload, onError) {
    const timestamp = new Date().toISOString();

    this.socket.send(
      JSON.stringify({
        command,
        payload,
        timestamp,
      }),
    );
    if (onError) {
      const handleError = (data) => {
        if (
          command === data.caused_by_command &&
          timestamp === data.timestamp
        ) {
          onError(data.error);
          this.removeEventListener("onError", handleError); // after handling the error we dont need it anymore
        }
      };
      this.addEventListener("onError", handleError);
    } else {
      console.warn("Missing error handling for command: " + command);
    }
    return this;
  }
}
