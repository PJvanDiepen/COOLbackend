"use strict";

import * as db from "./db.js";

import * as zyq from "./zyq.js";

(async function() {
    await zyq.init();
    zyq.menu([]);
    const apiLijst = await zyq.serverFetch(`/api`);
    const lijst = document.getElementById("lijst");
    for (const apiCall of apiLijst) {
        const url = apiCall
            .replace(":uuidToken", zyq.uuidToken)
            .replace(":seizoen", zyq.ditSeizoen)
            .replace(":datum", zyq.datumSQL());
        lijst.appendChild(zyq.htmlRij(htmlTabblad(url)));
    }
})();

function htmlTabblad(link) { // TODO naar zyq.js
    const a = document.createElement("a");
    a.appendChild(zyq.htmlTekst(link));
    a.href = zyq.server + link;
    a.target = "_blank"; // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
    a.rel = "noopener noreferrer"
    return a;
}