"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk zoek=<zoek>

    terug naar start.html ???
 */
const jaar = 2000 + Number(zyq.o_o_o.seizoen.substring(0,2));
const lidNummer = Number(html.params.get("lid"));
const knsbWijzigen = html.params.get("knsb") === "wijzigen";

(async function() {
    await zyq.init();
    const tijdelijkNummer = await zyq.serverFetch(`/nummer`); // vanaf 100
    const persoon = await zyq.serverFetch(`/persoon/${zyq.o_o_o.seizoen}/${lidNummer}`);
    const augustusRating = await ratingLezen();
    await html.menu(zyq.gebruiker.mutatieRechten, [db.BEHEERDER, "wijzig KNSB gegevens (let op!)", function () {
            html.zelfdePagina(`lid=${lidNummer}&knsb=wijzigen`);
        }],
        [db.BEHEERDER, `${persoon.naam} verwijderen`, async function () {
            const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/verwijder/persoon/${lidNummer}`);
            if (mutaties) {
                html.anderePagina(`bestuur.html?lid=${lidNummer}`);
            } else {
                console.log(`${persoon.naam} is niet verwijderd`);
            }
        }],
        [db.WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            html.anderePagina(`agenda.html?gebruiker=${lidNummer}`);
        }]);
    await registratieFormulier(persoon, augustusRating);
})();

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
    const knsbNummer = document.getElementById("knsbNummer");
    knsbNummer.value = lidNummer;
    const naam = document.getElementById("naam");
    if (persoon) {
        naam.value = persoon.naam;
    } else if (augustusRating) {
        naam.value = augustusRating.knsbNaam;
    }
    const email = document.getElementById("email");
    if (lidNummer === zyq.gebruiker.knsbNummer) {
        email.value = zyq.gebruiker.email;
    }
    const gebruikerToevoegen = !persoon || persoon.mutatieRechten === null;
    document.getElementById("jaar").append(` op 1 augustus ${jaar}`);
    const knsbRating = document.getElementById("knsbRating");
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
    document.getElementById("formulier").addEventListener("submit", async function (event) {
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
        // speler verwerken
        const intern = []; // speeltIntern volgens lidformulier TODO Contents of collection 'intern' are updated, but never queried
        let internNummer = 0;
        let vinkjes = "";
        for (let i = 0; i < competitie.length; i++) {
            if (competitie[i].checked) {
                intern[internNummer] = competitie[i].value;
                internNummer++;
                vinkjes += competitie[i].value;
            }
        }
        vinkjes += " "; // minstens 1 vinkje voor blanko teamCode
        const uuid = zyq.uuidToken;
        const muteren = spelerToevoegen ? "speler/toevoegen" : "speler/wijzigen";
        const seizoen = zyq.o_o_o.seizoen;
        const rating = knsbRating.value;
        const ratingIntern = interneRating.value;
        const nhsb = nhsbTeam.value === "" ? " " : nhsbTeam.value;
        const knsb = knsbTeam.value === "" ? " " : knsbTeam.value;
        if (await zyq.serverFetch(`/${uuid}/${muteren}/${seizoen}/${lidNummer}/${rating}/${ratingIntern}/${nhsb}/${knsb}/${vinkjes}/${jaar}-08-01`)) {
            mutaties++;
        }
        if (knsbWijzigen && Number(knsbNummer.value) !== lidNummer) {
            if (await zyq.serverFetch(`/${zyq.uuidToken}/knsb/${lidNummer}/${knsbNummer.value}`)){
                mutaties++;
            }
        }
        // TODO iets doen met mutaties of de variable mutaties verwijderen?
        html.vorigePagina(`lid=${knsbNummer.value}`); // naar agenda.html of bestuur.html
    });
}

function speeltIntern(persoon, teamCode) { // volgens database
    if (persoon) {
        return persoon.intern1 === teamCode
            || persoon.intern2 === teamCode
            || persoon.intern3 === teamCode
            || persoon.intern4 === teamCode
            || persoon.intern5 === teamCode;
    } else {
        return false;
    }
}