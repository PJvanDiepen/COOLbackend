"use strict";

import * as html from "./html.js";
import { init } from "./o_o_o.js";

import * as zyq from "./zyq.js";

(async function() {
    await init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    const apiLijst = await zyq.serverFetch(`/api`);
    const lijst = html.id("lijst");
    for (const apiCall of apiLijst) {
        const url = apiCall
            .replace(":uuid", zyq.uuidToken)
            .replace(":club", 0) // TODO niet uitsluitend de Waagtoren
            .replace(":seizoen", zyq.ditSeizoen)
            .replace(":datum", zyq.datumSQL());
        lijst.append(html.rij(html.tabblad(url)));
    }
})();