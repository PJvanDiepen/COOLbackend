"use strict";

import * as db from "./db.js";
import * as html from "./html.js";
import * as server from "./server.js";

import { o_o_o } from "./o_o_o.js";

import * as zyq from "./zyq.js";

(async function() {
    html.urlVerwerken({
        club: 0,
        seizoen: "",
        competitie: db.INTERNE_COMPETITIE
    });
    await server.eersteContact();
    const club = await db.clubTak(html.url);
    const seizoenen = await club.alleSeizoenen();
    const seizoen = // gegeven seizoen of laatste seizoen
        await club.seizoenTak(html.url.seizoen) || seizoenen[seizoenen.length - 1];
    seizoenSelecteren(seizoen.seizoen, seizoenen);
    html.id("kop").textContent =
        `${club.vereniging}${html.SCHEIDING}${seizoen.seizoenTekst}${html.SCHEIDING} ???`;

    const ronde = await db.rondeTak({
        club: club.clubCode, seizoen: seizoen.seizoen, team: db.INTERNE_COMPETITIE, ronde: 1 });
    const uitslagen = await ronde.alleUitslagen();
    for (const uitslag of uitslagen) {
        console.log(uitslag.uitslagTekst);
    }
    const vijfde = await db.teamTak({ club: club.clubCode, seizoen: seizoen.seizoen, team: "5" });
    await vijfde.alleRonden();

    const competitie = await db.teamTak({
        club: club.clubCode, seizoen: seizoen.seizoen, team: db.INTERNE_COMPETITIE });
    const nietGespeeld = await competitie.actueleRonden();
    for (const dinsdag of nietGespeeld) {
        console.log(dinsdag.rondeTekst);
    }



    const plaatje = html.id("plaatje");
    if (club.vereniging === "Waagtoren") {
        plaatje.append(html.plaatje("images/waagtoren.gif",60, 150, 123));
    }
    /*
    TODO complete jaaragenda inlezen?
    TODO kop: Waagtoren 〉 2025-2026 〉 interne competitie
    TODO knop voor teams
    TODO start.js zoals versie 0.8.66
    TODO start.js zonder o_o_o.js en zyq.js
    TODO gebruiker en teams voor mutatieRechten
    TODO groeiFuncties() voor lezen gebruiker + spelers
    TODO rolGebruiker test in db.js en db.cjs met groeiFunctie

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
     */
    console.log("start.js tot hier");
})();

function seizoenSelecteren(eersteKeuze, seizoenen) {
    const knop = html.id("seizoenSelecteren");
    const selectieLijst = seizoenen.map(function (seizoen) {
        return [seizoen.seizoen, seizoen.seizoenTekst];
    });
    html.selectie(knop, eersteKeuze, selectieLijst, function (keuze) {
        html.zelfdePagina(`club=${html.url.club}&seizoen=${keuze}&competitie=${html.url.competitie}`);
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

/**
 * teamSelecteren voor ranglijst.js en team.js
 *
 * TODO bijna hetzelfde als start.js: competitieSelecteren en teamleider.js: teamSelecteren
 *
 * @param teamCode team of competitie
 * @returns {Promise<void>}
 */
export async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isCompetitie(team) || db.isTeam(team);
    }).map(function (team) {
        return [team.teamCode, db.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (teamCode) {
        if (teamCode === "" ? false : teamCode.substring(0,1) === "i") {
            html.anderePagina(`ranglijst.html?competitie=${teamCode}`);
        } else {
            html.anderePagina(`team.html?team=${teamCode}`);
        }
    });
}