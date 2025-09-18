"use strict";

import * as db from "./db.js";
import * as html from "./html.js";
import { o_o_o, init, laatsteUitslagenRonde, invullenUitslagenRonde, indelenRonde } from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk vereniging=[vereniging]
    of
    verwerk team=<teamCode>&competitie=<teamCode>
 */

(async function() {
    await init();
    html.id("kop").textContent = "Voorlopig geen kop"; // TODO voorlopig
        // `${o_o_o.vereniging}${html.SCHEIDING}${db.seizoenVoluit(o_o_o)}${html.SCHEIDING}${db.teamVoluit(o_o_o.competitie)}`;
    const plaatje = html.id("plaatje");
    if (true) { // TODO (o_o_o.vereniging === "Waagtoren")
        plaatje.append(html.plaatje("images/waagtoren.gif",60, 150, 123));
    }
    const laatsteUitslagen = 3; // laatsteUitslagenRonde(); TODO voorlopig
    const invullenUitslagen = 0; // invullenUitslagenRonde(); TODO voorlopig
    const voorlopigeIndeling = 0; // indelenRonde(); TODO voorlopig
    // console.log(`laatste r${laatsteUitslagen} invullen r${invullenUitslagen} indelen r${voorlopigeIndeling}`);
    const menuKeuzes = [
        [db.IEDEREEN, `Ranglijst na ronde ${laatsteUitslagen}`,`ranglijst.html?${laatsteUitslagen}`], // menu0
        [db.IEDEREEN, `Uitslagen ronde ${laatsteUitslagen}`,`ronde.html?ronde=${laatsteUitslagen}`]]; // menu1
    if (voorlopigeIndeling) {
        menuKeuzes.push([db.GEREGISTREERD, `Voorlopige indeling ronde ${voorlopigeIndeling}`, `indelen.html?ronde=${voorlopigeIndeling}`]); // menu2
    } else if (invullenUitslagen) {
        menuKeuzes.push([db.GEREGISTREERD, `Uitslagen invullen ronde ${invullenUitslagen}`, `ronde.html?ronde=${invullenUitslagen}`]); // menu2
    }
    if (zyq.gebruiker.mutatieRechten === db.IEDEREEN) { // indien niet geregistreerd
        menuKeuzes.push([db.IEDEREEN, "Aanmelden voor 0-0-0", "aanmelden.html"]);
    }
    menuKeuzes.push(
        [db.GEREGISTREERD, "Aanmelden / Afzeggen", "agenda.html"],
        [db.BESTUUR, "Overzicht voor bestuur", "bestuur.html"],
        [db.TEAMLEIDER, "Overzicht voor teamleiders", "teamleider.html"]);
    for (let i = 0; i < menuKeuzes.length; i++) {
        const [minimumRechten, tekst, naarPagina] = menuKeuzes[i];
        if (minimumRechten <= zyq.gebruiker.mutatieRechten) {
            html.id(`menu${i}`).append(html.naarPaginaEnTerug(naarPagina,tekst)); // menu0..6 op deze pagina
        }
    }
    menuKeuzes.push(
        [db.IEDEREEN, html.MENU], // hier worden de menuKeuzes van andere pagina's tussengevoegd
        [db.GEREGISTREERD, "systeembeheer", "beheer.html"]);
    sessionStorage.setItem(html.MENU, JSON.stringify(menuKeuzes)); // algemeen menu voor de volgende pagina's
    seizoenSelecteren(o_o_o.competitie);
    await competitieSelecteren();
    console.log("start.js tot hier");
})();

const alleSeizoenen = [{ seizoen: "2526", seizoenTekst: "2025-2026" } ];

function seizoenSelecteren(teamCode) {
    const seizoenenSelectie = [];
    for (const seizoen of alleSeizoenen) { // TODO db.tak(o_o_o.club).seizoen
        seizoenenSelectie.push([seizoen.seizoen, seizoen.seizoenTekst]);
    }
    html.selectie(html.id("seizoenSelecteren"), o_o_o.seizoen, seizoenenSelectie, function (seizoen) {
        html.zelfdePagina(`seizoen=${seizoen}&competitie=${db.INTERNE_COMPETITIE}&team=${db.INTERNE_COMPETITIE}`);
    });
}

// TODO zie o_o_o.js: teamSelecteren
async function competitieSelecteren() {
    const competities = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isCompetitie(team);
    }).map(function (team) {
        return [team.teamCode, team.omschrijving];
    });
    html.selectie(html.id("competitieSelecteren"), o_o_o.competitie, competities, function (competitie) {
        html.zelfdePagina(`team=${competitie}&competitie=${competitie}`);
    });
}