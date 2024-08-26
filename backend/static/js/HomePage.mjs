import { Component } from "./components/component.mjs";

/** @type {import("./router/router.mjs").Page} */
export const HomePage = ({ params }) => {
    const page = new Component("div").class("container mx-auto");
    page.element.innerHTML = 
        `<t-navbar></t-navbar>
        <div class="top-image mt-3">
            <img src="/media/default/front/banner.jpg" alt="Banner" class="rounded rounded-5">
        </div>
        <p class="fs fs-6 mt-2 float-end">Welcome to Transcendence!<br>jramondo kmatos-s macarval matcardo thabeck-</p>`;
    return page;
}



