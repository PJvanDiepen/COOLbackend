"use strict";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */

(async function() {
    await init();
    competitieTitel();
    o_o_o.team = o_o_o.competitie;
    const rondeNummer = Number(params.get("ronde"));
    menu([]);
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(o_o_o.ronde[rondeNummer]);
    if (o_o_o.competitie === INTERNE_COMPETITIE) {
        document.getElementById("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

async function spelerSelecteren(rondeNummer, deelnemers) {
    const spelers = document.getElementById("spelerSelecteren");
    spelers.appendChild(htmlOptie(0, "selecteer naam"));
    (await localFetch(`/spelers/${o_o_o.seizoen}`)).forEach(
        function (speler) {
            spelers.appendChild(htmlOptie(speler.knsbNummer, speler.naam + (deelnemers.includes(speler.knsbNummer) ?  KRUISJE : "")));
        });
    spelers.addEventListener("input",async function () {
        const knsbNummer = Number(spelers.value);
        const partij = deelnemers.includes(knsbNummer) ? NIET_MEEDOEN : MEEDOEN;
        const datum = datumSQL(o_o_o.ronde[rondeNummer].datum);
        naarZelfdePagina(); // TODO mutatie na init() en speler geel maken indien gelukt
    });
}
