"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
TODO mutaties per gebruiker afsplitsen
TODO mutaties met filters
TODO mutaties met verwijderen
 */

(async function() {
    await zyq.init();
    zyq.menu([db.ONTWIKKElAAR, `backup gebruikers` , async function () {
            const rijen = await zyq.serverFetch(`/${zyq.uuidToken}/backup/gebruiker`);
            zyq.backupSQL("gebruiker", rijen);
        }],
        [db.ONTWIKKElAAR, `backup personen` , async function () {
            const rijen = await zyq.serverFetch(`/backup/persoon`);
            zyq.backupSQL("persoon", rijen);
        }],
        [db.ONTWIKKElAAR, `backup spelers ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/speler/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("speler", rijen);
        }],
        [db.ONTWIKKElAAR, `backup teams ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/team/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("team", rijen);
        }],
        [db.ONTWIKKElAAR, `backup ronden ${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/ronde/${zyq.o_o_o.seizoen}`);
            zyq.backupSQL("ronde", rijen);
        }],
        [db.ONTWIKKElAAR, "test API", function () {
            html.anderePagina("test.html");
        }]);
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    const versie = await zyq.serverFetch(`/versie`);
    console.log(db.hoera());
    document.getElementById("computer").append(
        zyq.htmlTekst(`0-0-0 versie ${versie} met browser: ${navigator.vendor}`));  // TODO client hints
})();

async function gebruikers(lijst) {
    const leden = await zyq.serverFetch(`/${zyq.uuidToken}/gebruikers`);
    let aantal = 0;
    for (const lid of leden) {
        lijst.append(html.rij(
            ++aantal,
            zyq.naarSpeler(lid),
            zyq.gebruiker.mutatieRechten === db.BEHEERDER ? gebruikerEmailSturen(lid) : lid.email,
            zyq.gebruikerFunctie(lid)));
    }
}

function gebruikerEmailSturen(lid) {
    return html.naarPaginaEnTerug(`email.html?speler=${lid.knsbNummer}&email=${lid.email}`, lid.email);
}

// TODO gebruiker hoger of lagere functie geven

async function laatsteMutaties(lijst) {
    const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/mutaties/0/9/100`); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        lijst.append(html.rij(
            zyq.tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : zyq.naarSpeler(mutatie),
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}