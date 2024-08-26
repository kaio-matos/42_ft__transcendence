import { Component } from "./components/component.mjs";

/** @type {import("./router/router.mjs").Page} */
export const HomePage = ({ params }) => {
    const page = new Component("div").class("container mx-auto");
    page.element.innerHTML = 
        `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark border border-secondary rounded rounded-3">
        <div class="container">
            <a class="navbar-brand" href="/">Transcendence</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto"> 
                    <li class="nav-item">
                        <a class="nav-link" href="/login">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/register">Registrar</a>
                    </li>
                </ul>
            </div>
        </div>
        </nav>
        
        <div class="top-image mt-3">
            <img src="/media/default/front/banner.jpg" alt="Banner" class="rounded rounded-5">
        </div>
        <p class="fs fs-6 mt-2 float-end">Welcome to Transcendence!<br>jramondo kmatos-s macarval matcardo thabeck-</p>
    `;
    return page;
}



