"use strict";

import * as zyq from "./zyq.js";
import * as html from "./html.js";
import {o_o_o, init} from "./o_o_o.js";

/*
    verwerk email=[email] // zie beheer.js
 */

(async function() {
    await init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    gebruikerTekst(html.id("emailAan"), html.id("naamAan"), html.id("activeer"));
})();

async function gebruikerTekst(emailAan, naamAan, activeer) {
    const leden = await zyq.serverFetch(`/${zyq.uuidToken}/email/${o_o_o.speler}`);
    if (leden.length === 0) {
        console.log("alleen de beheerder krijgt informatie over gebruikers");
    } else if (leden.length > 1) {
        console.log("er zijn meer gebruikers met zelfde uuuidToken"); // TODO zorgen dat gebruiker uniek is
        console.log(leden);
    }
    const lid = leden[0];
    emailAan.append(lid.email);
    naamAan.append(`${lid.naam},`);
    // TODO vereniging verwijderen?
    activeer.append(`https://0-0-0.nl/start.html?vereniging=${o_o_o.vereniging}&uuid=${lid.uuidToken}`);
}