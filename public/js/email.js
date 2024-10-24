"use strict";

/*
    verwerk email=[email] // zie beheer.js
 */

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    gebruikerTekst(
        document.getElementById("emailAan"),
        document.getElementById("naamAan"),
        document.getElementById("link"));
})();

/*
    verwerk email=<email> TODO verwijderen???
 */

async function gebruikerTekst(emailAan, naamAan, link) {
    const leden = await serverFetch(`/${uuidToken}/email/${o_o_o.speler}`);
    const email = params.get("email");
    const lid = leden[0];  // TODO vergelijken met email
    emailAan.appendChild(htmlTekst(lid.email));
    naamAan.appendChild(htmlTekst(`${lid.naam},`));
    link.appendChild(htmlTekst(`https://0-0-0.nl/start.html?vereniging=${o_o_o.vereniging}&uuid=${lid.uuidToken}`));
}