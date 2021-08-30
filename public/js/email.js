"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarRanglijst,
        terugNaar);
    gebruikerTekst(
        document.getElementById("emailAan"),
        document.getElementById("naamAan"),
        document.getElementById("link"));
})();

async function gebruikerTekst(emailAan, naamAan, link) {
    const leden = await serverFetch(`/${uuidToken}/email/${speler}`);
    const email = params.get("email");
    const lid = leden[0];  // TODO vergelijken met email
    emailAan.appendChild(htmlTekst(lid.email));
    naamAan.appendChild(htmlTekst(`${lid.naam},`));
    link.appendChild(htmlTekst(`https://0-0-0.nl/agenda.html?vereniging=${vereniging}&uuid=${lid.uuidToken}`));
}