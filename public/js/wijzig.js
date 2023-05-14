"use strict";

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
    zyq.menu([]);
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + SCHEIDING + zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer]);
    if (zyq.o_o_o.competitie === INTERNE_COMPETITIE) {
        document.getElementById("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

async function spelerSelecteren(rondeNummer, deelnemers) {
    const spelers = document.getElementById("spelerSelecteren");
    spelers.appendChild(htmlOptie(0, "selecteer naam"));
    (await zyq.localFetch(`/spelers/${o_o_o.seizoen}`)).forEach(
        function (speler) {
            spelers.appendChild(zyq.htmlOptie(speler.knsbNummer, speler.naam + (deelnemers.includes(speler.knsbNummer) ?  KRUISJE : "")));
        });
    spelers.addEventListener("input",async function () {
        const knsbNummer = Number(spelers.value);
        const partij = deelnemers.includes(knsbNummer) ? NIET_MEEDOEN : MEEDOEN;
        const datum = zyq.datumSQL(o_o_o.ronde[rondeNummer].datum);
        zyq.naarZelfdePagina(); // TODO mutatie na init() en speler geel maken indien gelukt
    });
}
