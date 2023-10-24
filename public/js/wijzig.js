"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    zyq.o_o_o.team = zyq.o_o_o.competitie;
    const rondeNummer = Number(params.get("ronde"));
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    html.id("kop").innerHTML = "Ronde " + rondeNummer + html.SCHEIDING + zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer]);
    if (zyq.o_o_o.competitie === db.INTERNE_COMPETITIE) {
        html.id("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

async function spelerSelecteren(rondeNummer, deelnemers) {
    const spelers = (await zyq.localFetch(`/spelers/${o_o_o.seizoen}`)).map(function (speler) {
        return [Number(speler.knsbNummer), speler.naam + (deelnemers.includes(speler.knsbNummer) ?  html.KRUISJE : "")];
    });
    spelers.unshift([0, "selecteer naam"]);
    html.selectie(html.id("spelerSelecteren"), 0, spelers, function (knsbNummer) {
        const partij = deelnemers.includes(knsbNummer) ? db.NIET_MEEDOEN : db.MEEDOEN; // TODO mutatie en na init() en speler geel maken indien gelukt
        const datum = zyq.datumSQL(o_o_o.ronde[rondeNummer].datum);
        html.zelfdePagina();
    });
}