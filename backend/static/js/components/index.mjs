import { Button } from "./Button.mjs";
import { TChat } from "./TChat.mjs";
import { Errors } from "./Errors.mjs";
import { Input } from "./Input.mjs";
import { InputImage } from "./InputImage.mjs";
import { Loading } from "./Loading.mjs";
import { PongCanvas } from "./PongCanvas/PongCanvas.mjs";
import { Toast } from "./Toast.mjs";
import { TConditional } from "./TConditional.mjs";

customElements.define("t-button", Button);
customElements.define("t-input", Input);
customElements.define("t-errors", Errors);
customElements.define("t-loading", Loading);
customElements.define("t-pong-canvas", PongCanvas);
customElements.define("t-toast", Toast);
customElements.define("t-input-image", InputImage);
customElements.define("t-chat", TChat);
customElements.define("t-conditional", TConditional);
