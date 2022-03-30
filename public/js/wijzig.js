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
    competitie.team = competitie.competitie;
    const rondeNummer = Number(params.get("ronde"));
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(competitie.ronde[rondeNummer]);
    if (competitie.competitie === INTERNE_COMPETITIE) {
        document.getElementById("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

async function spelerSelecteren(rondeNummer, deelnemers) {
    const spelers = document.getElementById("spelerSelecteren");
    spelers.appendChild(htmlOptie(0, "selecteer naam"));
    (await localFetch(`/spelers/${competitie.seizoen}`)).forEach(
        function (speler) {
            spelers.appendChild(htmlOptie(speler.knsbNummer, speler.naam + (deelnemers.includes(speler.knsbNummer) ?  KRUISJE : "")));
        });
    spelers.addEventListener("input",async function () {
        const knsbNummer = Number(spelers.value);
        const partij = deelnemers.includes(knsbNummer) ? NIET_MEEDOEN : MEEDOEN;
        const datum = datumSQL(competitie.ronde[rondeNummer].datum);
        naarZelfdePagina(); // TODO mutatie na init() en speler geel maken indien gelukt
    });
}
