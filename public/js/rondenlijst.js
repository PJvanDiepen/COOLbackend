"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

import {ranglijst} from "./o_o_o.js";

/*
    verwerk ronde=<rondeNummer>
 */

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    html.id("kop").textContent =
        `${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}${html.SCHEIDING}rondenlijst na ronde ${rondeNummer}`;
    const lijst = html.id("lijst");
    lijst.append(html.bovenRij("", "naam", "on", ...(rondeNummers(rondeNummer))));
    const spelers = (await ranglijst(rondeNummer)).filter(function (speler) {
        return speler.intern() || speler.oneven();
    });
    console.log(spelers);
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
    console.log(speler.naam);
    const ronden = [];
    for (let i = 1; i <= aantalRonden; i++) {
        const [kleur, tegenstander, resultaat] = speler.tegenstander(i);
        console.log([kleur, tegenstander, resultaat]);
        if (tegenstander) {
            const rangnummer = 1 + spelers.findIndex(function (tegen) {
                return tegen.knsbNummer === tegenstander;
            });
            const score = kleur === 2 ? db.WINST : kleur === 1 ? db.REMISE : db.WINST;
            ronden.push(`${rangnummer} ${kleur ? "z" : "w"} ${score}`);
        } else {
            ronden.push("");
        }
    }
    return ronden;
}