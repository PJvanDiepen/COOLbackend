"use strict";

import * as zyq from "./zyq.js";

/*
    verwerk email=[email] // zie beheer.js
 */

(async function() {
    await zyq.init();
    zyq.menu([]);
    gebruikerTekst(
        document.getElementById("emailAan"),
        document.getElementById("naamAan"),
        document.getElementById("activeer"));
})();

async function gebruikerTekst(emailAan, naamAan, activeer) {
    const leden = await zyq.serverFetch(`/${zyq.uuidToken}/email/${zyq.o_o_o.speler}`);
    if (leden.length === 0) {
        console.log("alleen de beheerder krijgt informatie over gebruikers");
    } else if (leden.length > 1) {
        console.log("er zijn meer gebruikers met zelfde uuuidToken"); // TODO zorgen dat gebruiker uniek is
        console.log(leden);
    }
    const lid = leden[0];
    emailAan.appendChild(zyq.htmlTekst(lid.email));
    naamAan.appendChild(zyq.htmlTekst(`${lid.naam},`));
    activeer.appendChild(zyq.htmlTekst(`https://0-0-0.nl/start.html?vereniging=${zyq.o_o_o.vereniging}&uuid=${lid.uuidToken}`));
}