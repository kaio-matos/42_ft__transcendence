import type { FunctionalComponent } from 'vue'
import './button.css'

interface Props {}

export const Button: FunctionalComponent<Props> = (props, context) => {
    return <button>{context.slots.default?.()}</button>
}
