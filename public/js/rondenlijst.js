"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, competitieTitel } from "./o_o_o.js";
import { ranglijst } from "./reglement.js";


import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
 */

(async function() {
    await init();
    competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || o_o_o.vorigeRonde || 1;
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    html.id("kop").textContent =
        `${db.seizoenVoluit(o_o_o)}${html.SCHEIDING}rondenlijst na ronde ${rondeNummer}`;
    const lijst = html.id("lijst");
    lijst.append(html.bovenRij("", "naam", "on", ...(rondeNummers(rondeNummer))));
    const spelers = (await ranglijst(rondeNummer)).filter(function (speler) {
        return speler.intern() || speler.oneven();
    });
    spelers.forEach(function (speler, rangnummer) {
        lijst.append(html.rij(rangnummer + 1,
            zyq.naarSpeler(speler),
            speler.oneven() ? speler.oneven() : "",
            ...(rondenPerSpeler(speler, spelers, rondeNummer))));
    });
})();

function rondeNummers(aantalRonden) {
    return Array.from({length: aantalRonden}, function (ronden, i) {
        return i + 1
    });
}

function rondenPerSpeler(speler, spelers, aantalRonden) {
    const ronden = [];
    for (let i = 1; i <= aantalRonden; i++) {
        const [kleur, tegenstander, resultaat] = speler.tegenstander(i);
        if (tegenstander) {
            const rangnummer = 1 + spelers.findIndex(function (tegen) {
                return tegen.knsbNummer === tegenstander;
            });
            const score = resultaat === 2 ? db.WINST : resultaat ? db.REMISE : db.VERLIES;
            ronden.push(`${rangnummer}${kleur ? "z" : "w"}${score}`);
        } else {
            ronden.push("");
        }
    }
    return ronden;
}