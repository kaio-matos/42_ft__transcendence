import type { FunctionalComponent } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import logo from '@/assets/logo.svg'
import '@/assets/normalize.css'
import '@/assets/main.css'

export const App: FunctionalComponent = () => {
    return (
        <>
            <header>
                <img alt="Vue logo" class="logo" src={logo} width="125" height="125" />

                <div class="wrapper">
                    <nav>
                        <RouterLink to="/">Home</RouterLink>
                    </nav>
                </div>
            </header>

            <RouterView />
        </>
    )
}
