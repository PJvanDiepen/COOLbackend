"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init } from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
TODO mutaties per gebruiker afsplitsen
TODO mutaties met filters
TODO mutaties met verwijderen
 */

(async function() {
    await init();
    await html.menu(zyq.gebruiker.mutatieRechten,
        [db.ONTWIKKElAAR, `backup gebruikers` , async function () {
            zyq.backupSQL("gebruiker", await zyq.serverFetch(
                `/${zyq.uuidToken}/backup/gebruikers`));
        }],
        [db.ONTWIKKElAAR, `backup personen` , async function () {
            zyq.backupSQL("persoon", await zyq.serverFetch(`/backup/personen`));
        }],
        [db.ONTWIKKElAAR, `backup teams ${db.seizoenVoluit(o_o_o)}`, async function () {
            zyq.backupSQL("team", await zyq.serverFetch(
                `/${o_o_o.club}/${o_o_o.seizoen}/backup/teams`));
        }],
        [db.ONTWIKKElAAR, `backup ronden ${db.seizoenVoluit(o_o_o)}` , async function () {
            zyq.backupSQL("ronde", await zyq.serverFetch(
                `/${o_o_o.club}/${o_o_o.seizoen}/backup/ronde`)); // TODO /ronden werkt niet!
        }],
        [db.ONTWIKKElAAR, `backup spelers ${db.seizoenVoluit(o_o_o)}` , async function () {
            zyq.backupSQL("speler", await zyq.serverFetch(
                `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/spelers`));
        }],
        [db.ONTWIKKElAAR, "test API", function () {
            html.anderePagina("test.html");
        }]);
    await gebruikers(html.id("gebruikers"));
    await laatsteMutaties(html.id("mutaties"));
    const versie = await zyq.serverFetch(`/versie`);
    html.id("computer").append(
        `0-0-0 versie ${versie.versie} sinds ${zyq.tijdGeleden(versie.tijdstip)}`);
})();

async function gebruikers(lijst) {
    const leden = await zyq.serverFetch(`/${zyq.uuidToken}/gebruikers`);
    let aantal = 0;
    for (const lid of leden) {
        lijst.append(html.rij(
            ++aantal,
            zyq.naarSpeler(lid),
            zyq.gebruiker.mutatieRechten >= db.BEHEERDER ? gebruikerEmailSturen(lid) : lid.email,
            db.gebruikerFunctie(lid)));
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