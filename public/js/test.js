"use strict";

import * as html from "./html.js";

import * as zyq from "./zyq.js";

(async function() {
    await zyq.init();
    await zyq.menu([]);
    const apiLijst = await zyq.serverFetch(`/api`);
    const lijst = document.getElementById("lijst");
    for (const apiCall of apiLijst) {
        const url = apiCall
            .replace(":uuidToken", zyq.uuidToken)
            .replace(":seizoen", zyq.ditSeizoen)
            .replace(":datum", zyq.datumSQL());
        lijst.append(html.rij(html.tabblad(url)));
    }
})();