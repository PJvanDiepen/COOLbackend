"use strict";

const apiCalls = [
    `/ronden/${o_o_o.seizoen}/${o_o_o.competitie}`, // TODO met documentatie
    `/${uuidToken}/gebruikers`,
    `/${uuidToken}/rondenummers/${o_o_o.seizoen}/${o_o_o.competitie}`,
    `/gewijzigd`,
    `/reglementen`,
    `/reglement/${o_o_o.seizoen}/${o_o_o.competitie}`,
    `/${uuidToken}/agenda/${o_o_o.seizoen}/teamCode/rondeNummer/knsbNummer/n/${datumSQL()}/int`,
    `/${uuidToken}/teamleider/${o_o_o.seizoen}/${datumSQL()}`,
    `/${uuidToken}/deelnemers/${o_o_o.seizoen}/int/rondeNummer`,
    `/${uuidToken}/alle/deelnemers/${o_o_o.seizoen}/int/15`
];

(async function() {
    await init();
    menu([]);
    const lijst = document.getElementById("lijst");
    for (const apiCall of apiCalls) {
        lijst.appendChild(htmlRij(htmlTabblad(apiCall)));
    }
})();

function htmlTabblad(link) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(link));
    a.href = server + link;
    a.target = "_blank"; // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
    a.rel = "noopener noreferrer"
    return a;
}

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
