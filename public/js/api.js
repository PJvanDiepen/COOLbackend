"use strict";

const apiCalls = [
    `/ronden/${competitie.seizoen}/${competitie.competitie}`, // TODO met documentatie
    `/${uuidToken}/rondenummers/2122/int`,
    `/gewijzigd`,
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
    await gebruikerVerwerken();
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