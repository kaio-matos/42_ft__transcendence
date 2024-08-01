import { Button } from "./Button.mjs";
import { Errors } from "./Errors.mjs";
import { Input } from "./Input.mjs";
import { Loading } from "./Loading.mjs";
import { PongCanvas } from "./PongCanvas/PongCanvas.mjs";
import { Toast } from "./Toast.mjs";

customElements.define("t-button", Button);
customElements.define("t-input", Input);
customElements.define("t-errors", Errors);
customElements.define("t-loading", Loading);
customElements.define("t-pong-canvas", PongCanvas);
customElements.define("t-toast", Toast);
