"use strict";

/*
    verwerk email=[email] // zie beheer.js
 */

(async function() {
    await init();
    menu([]);
    gebruikerTekst(
        document.getElementById("emailAan"),
        document.getElementById("naamAan"),
        document.getElementById("activeer"),
        document.getElementById("favoriet"));
})();

async function gebruikerTekst(emailAan, naamAan, activeer, favoriet) {
    const leden = await serverFetch(`/${uuidToken}/email/${o_o_o.speler}`);
    if (leden.length > 1) {
        console.log(leden); // TODO zorgen dat gebruiker uniek is
    }
    const lid = leden[0];
    emailAan.appendChild(htmlTekst(lid.email));
    naamAan.appendChild(htmlTekst(`${lid.naam},`));
    activeer.appendChild(htmlTekst(`https://0-0-0.nl/start.html?vereniging=${o_o_o.vereniging}&uuid=${lid.uuidToken}`));
    favoriet.appendChild(htmlTekst(`https://0-0-0.nl/start.html?vereniging=${o_o_o.vereniging}`));
}