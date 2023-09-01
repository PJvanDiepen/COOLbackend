"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk zoek=<zoek>

    terug naar start.html
 */

const zoekNaam = html.params.get("zoek") || "";
const lidNummer = Number(html.params.get("lidnummer")); // gevonden door selecteren
const lidNaam = html.params.get("lidnaam");

const zoek       = html.id("zoek");
const selecteer  = html.id("selecteer");
const naam       = html.id("naam");
const email      = html.id("email");
const knsbNummer = html.id("knsbNummer");
const knsbRating = html.id("knsbRating");
const informeer  = html.id("informeer");

const jaar = 2000 + Number(zyq.o_o_o.seizoen.substring(0,2));

(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await zoekPersoon();
    const tijdelijkNummer = await zyq.serverFetch(`/nummer`); // vanaf 100
    const persoon = await zyq.serverFetch(`/persoon/${zyq.o_o_o.seizoen}/${lidNummer}`);
    console.log(persoon);
    const augustusRating = await ratingLezen();
    // await registratieFormulier(persoon, augustusRating);
})();

async function zoekPersoon() {
    const selectieLijst = [];
    zoek.value = zoekNaam;
    if (zoekNaam.length > 0) {
        const aantal = 26;
        const knsb = await zyq.serverFetch(`/naam/8/${zoekNaam}/${aantal}`);
        console.log(knsb);
        const database = await zyq.serverFetch(`/naam/gebruiker/${zoekNaam}`);
        console.log(database);
        for (let i = 0; i < knsb.length; i++) {
            const tekst = `${knsb[i].knsbNummer} ${knsb[i].knsbNaam} (${knsb[i].knsbRating})`
            selectieLijst.push([i, tekst, function (index) {
                console.log(knsb[index]);
                naam.value = normaleNaam(knsb[index].knsbNaam);
                knsbNummer.value = knsb[index].knsbNummer;
                knsbRating.value = knsb[index].knsbRating;
                if (i > 4) {
                    html.tekstOverschrijven(informeer, `${naam.value} heeft een rating van ${knsbRating.value}.\n`);
                } else {
                    html.tekstToevoegen(informeer, `${naam.value} heeft een rating van ${knsbRating.value}.\n`);
                }
            }]);
        }
        console.log(selectieLijst);
        const tekst = knsb.length >= aantal ? `meer dan ${knsb.length - 1}` : `${knsb.length}`
        html.tekstToevoegen(informeer, `Met "${zoekNaam}" zijn ${tekst} namen gevonden.\n`);
        selectieLijst.unshift([99, `selecteer een uit ${tekst} namen`]);
        html.selectie(selecteer, "", selectieLijst);
    }
    zoek.addEventListener("change", function () {
        html.zelfdePagina(`zoek=${zoek.value}`);
    });
}

/**
 * maak van een knsbNaam een normaleNaam
 *
 * Giri, Anish -> Anish Giri
 * Van Diepen, Peter --> Peter van Diepen
 * Van der Meiden, Dirk --> Dirk van der Meiden
 * Bennema Geerlings, Menno --> Menno Bennema Geerlings
 *
 * @param knsbNaam uit KNSB ratinglijst
 * @returns {string} normaleNaam
 */
function normaleNaam(knsbNaam) {
    const eersteSpatie = knsbNaam.indexOf(" ");
    const naam = eersteSpatie < 4 && eersteSpatie < knsbNaam.indexOf(", ")
        ? knsbNaam.charAt(0).toLowerCase() + knsbNaam.slice(1) // geen hoofdletter voor tussenvoegsel zoals: van, de, enz.
        : knsbNaam;
    return naam.replace(/(.*), (.*)/g, "$2 $1"); // Zie blz. 155 Marijn Haverbeke: Eloquent JavaScript
}

async function ratingLezen() {
    const rating = await zyq.serverFetch(`/rating/8/${lidNummer}`); // 1 augustus dit seizoen
    if (Number(rating.knsbNummer) === lidNummer && Number(rating.jaar) === jaar) {
        return rating;
    }
    return false;
}

/*

registratieFormulier   MySQL tabel
-----------------------------------------------------
naam                   persoon, rating
email                  gebruiker
knsbNummer             persoon, rating, gebruiker

De knsbRating komt uit de rating lijst van 1 augustus van dit seizoen.

In het registratieFormulier
- kan bestuur naam van persoon intoetsen en persoon toevoegen
- kan een nieuwe gebruiker naam en email intoetsen en persoon en gebruiker toevoegen
- kan een geregistreerd gebruiker email wijzigen en gebruiker bijwerken
 */
async function registratieFormulier(persoon, augustusRating) {
    // formulier invullen
    if (persoon) {
        naam.value = persoon.naam;
    } else if (augustusRating) {
        naam.value = augustusRating.knsbNaam;
    }
    if (lidNummer === zyq.gebruiker.knsbNummer) {
        email.value = zyq.gebruiker.email;
    }
    const gebruikerToevoegen = !persoon || persoon.mutatieRechten === null;
    html.id("jaar").append(` op 1 augustus ${jaar}`);
    knsbRating.value = 0;
    const spelerToevoegen = !persoon || persoon.knsbRating === null;
    if (augustusRating) {
        knsbRating.value = augustusRating.knsbRating;
    } else if (!spelerToevoegen) {
        knsbRating.value = persoon.knsbRating;
    }
    if (knsbWijzigen) {
        knsbNummer.disabled = false; // enable input
        knsbNummer.disabled = false; // enable input
        knsbRating.disabled = false; // enable input
    }

    // formulier verwerken
    html.id("formulier").addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        // persoon verwerken
        if (!persoon) {
            if (await zyq.serverFetch(`/${zyq.uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
                mutaties++;
            }
        } else if (false) { // TODO naam of knsbNummer gewijzigd
            // TODO persoon wijzigen
        }
        // gebruiker verwerken
        if (email.value !== "") { // TODO e-mailadres controleren
            const actie = gebruikerToevoegen ? "toevoegen" : "email";
            if (await zyq.serverFetch(`/${zyq.uuidToken}/gebruiker/${actie}/${lidNummer}/${email.value}`)) {
                mutaties++;
            }
        }
        // TODO iets doen met mutaties of de variable mutaties verwijderen?
        html.vorigePagina(`lid=${knsbNummer.value}`); // naar agenda.html of bestuur.html TODO naar start.html
    });
}