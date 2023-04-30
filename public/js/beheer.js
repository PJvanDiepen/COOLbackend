"use strict";

import { BEHEERDER, hoera } from "/modules/db.js";

import * as zyq from "/modules/zyq.js";

/*
TODO mutaties per gebruiker afsplitsen
TODO mutaties met filters
TODO mutaties met verwijderen
 */

(async function() {
    await zyq.init();
    zyq.menu([BEHEERDER, `backup gebruikers` , async function () {
            const rijen = await zyq.serverFetch(`/${zyq.uuidToken}/backup/gebruiker`);
            zyq.backupSQL("gebruiker", rijen);
        }],
        [BEHEERDER, `backup personen` , async function () {
            const rijen = await zyq.serverFetch(`/backup/persoon`);
            zyq.backupSQL("persoon", rijen);
        }],
        [BEHEERDER, `backup spelers ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/speler/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("speler", rijen);
        }],
        [BEHEERDER, `backup teams ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/team/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("team", rijen);
        }],
        [BEHEERDER, `backup ronden ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/ronde/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("ronde", rijen);
        }],
        [BEHEERDER, "test API", function () {
            zyq.naarAnderePagina("api.html");
        }]);
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    const versie = await zyq.serverFetch(`/versie`);
    const hoeraTekst = hoera();
    document.getElementById("computer").appendChild(
        zyq.htmlTekst(`0-0-0 versie ${versie} ${hoeraTekst} met browser: ${navigator.vendor}`));  // TODO client hints
})();

async function gebruikers(lijst) {
    const leden = await zyq.serverFetch(`/${zyq.uuidToken}/gebruikers`);
    let aantal = 0;
    for (const lid of leden) {
        lijst.appendChild(zyq.htmlRij(
            ++aantal,
            zyq.naarSpeler(lid),
            zyq.gebruiker.mutatieRechten === BEHEERDER ? gebruikerEmailSturen(lid) : lid.email,
            zyq.gebruikerFunctie(lid)));
    }
}

function gebruikerEmailSturen(lid) {
    return zyq.htmlLink(`email.html?speler=${lid.knsbNummer}&email=${lid.email}`, lid.email);
}

// TODO gebruiker hoger of lagere functie geven

async function laatsteMutaties(lijst) {
    const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/mutaties/0/9/100`); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        lijst.appendChild(zyq.htmlRij(
            zyq.tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : zyq.naarSpeler(mutatie),
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}