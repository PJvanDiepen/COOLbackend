"use strict";

import { hoera } from "/modules/o_o_o.js";

/*
TODO mutaties per gebruiker afsplitsen
TODO mutaties met filters
TODO mutaties met verwijderen
 */

(async function() {
    await init();
    menu([BEHEERDER, `backup gebruikers` , async function () {
            const rijen = await serverFetch(`/${uuidToken}/backup/gebruiker`);
            backupSQL("gebruiker", rijen);
        }],
        [BEHEERDER, `backup personen` , async function () {
            const rijen = await serverFetch(`/backup/persoon`);
            backupSQL("persoon", rijen);
        }],
        [BEHEERDER, `backup spelers ${seizoenVoluit(o_o_o.seizoen)}` , async function () {
            const rijen = await serverFetch(`/backup/speler/${o_o_o.seizoen}`);
            backupSQL("speler", rijen);
        }],
        [BEHEERDER, `backup teams ${seizoenVoluit(o_o_o.seizoen)}` , async function () {
            const rijen = await serverFetch(`/backup/team/${o_o_o.seizoen}`);
            backupSQL("team", rijen);
        }],
        [BEHEERDER, `backup ronden ${seizoenVoluit(o_o_o.seizoen)}` , async function () {
            const rijen = await serverFetch(`/backup/ronde/${o_o_o.seizoen}`);
            backupSQL("ronde", rijen);
        }],
        [BEHEERDER, "test API", function () {
            naarAnderePagina("api.html");
        }]);
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    const versie = await serverFetch(`/versie`);
    const hoeraTekst = hoera();
    document.getElementById("computer").appendChild(
        htmlTekst(`${versie} ${hoeraTekst} met operating system: ${navigator.platform} en browser: ${navigator.vendor}`));  // TODO client hints
})();

async function gebruikers(lijst) {
    const leden = await serverFetch(`/${uuidToken}/gebruikers`);
    let aantal = 0;
    for (const lid of leden) {
        lijst.appendChild(htmlRij(
            ++aantal,
            naarSpeler(lid),
            gebruiker.mutatieRechten === BEHEERDER ? gebruikerEmailSturen(lid) : lid.email,
            gebruikerFunctie(lid)));
    }
}

function gebruikerEmailSturen(lid) {
    return htmlLink(`email.html?speler=${lid.knsbNummer}&email=${lid.email}`, lid.email);
}

// TODO gebruiker hoger of lagere functie geven

async function laatsteMutaties(lijst) {
    const mutaties = await serverFetch(`/${uuidToken}/mutaties/0/9/100`); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        lijst.appendChild(htmlRij(
            tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : naarSpeler(mutatie),
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}