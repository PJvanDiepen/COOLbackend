"use strict";

let ronde = 19;
const apiCalls = [
    `/ronden/${o_o_o.seizoen}/${o_o_o.competitie}`, // TODO met documentatie
    `/${uuidToken}/gebruikers`,
    `/${uuidToken}/rondenummers/${o_o_o.seizoen}/${o_o_o.competitie}`,
    `/gewijzigd`,
    `/reglementen`,
    `/reglement/${o_o_o.seizoen}/${o_o_o.competitie}`,
//    `/${uuidToken}/kalender/${competitie.seizoen}/${speler}`,
    `/${uuidToken}/agenda/${o_o_o.seizoen}/${o_o_o.competitie}/${ronde}/${o_o_o.speler}`,
    `/${uuidToken}/deelnemers/2122/int/15`,
    `/${uuidToken}/alle/deelnemers/2122/int/15`,
    `/${uuidToken}/rondenummers/2122/1`,
    `/${uuidToken}/rondenummers/2122/2`,
    `/${uuidToken}/rondenummers/2122/3`,
    `/${uuidToken}/rondenummers/2122/4`,
    `/${uuidToken}/schuif/ronde/2122/1/5/10`,
    `/${uuidToken}/schuif/ronde/2122/2/5/10`,
    `/${uuidToken}/schuif/ronde/2122/3/5/10`,
    `/${uuidToken}/schuif/ronde/2122/4/4/8`
];

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
        naarAnderePagina("beheer.html");
    }]);
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
