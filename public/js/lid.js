"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk lid=<knsbNummer>
           &knsb=wijzigen

    terug naar agenda.html of bestuur.html
 */
const jaar = 2000 + Number(zyq.o_o_o.seizoen.substring(0,2));
const lidNummer = Number(html.params.get("lid"));
const knsbWijzigen = html.params.get("knsb") === "wijzigen";

(async function() {
    await zyq.init();
    document.getElementById("kop").innerHTML = zyq.o_o_o.vereniging + html.SCHEIDING + zyq.seizoenVoluit(zyq.o_o_o.seizoen);
    const persoon = await zyq.serverFetch(`/persoon/${zyq.o_o_o.seizoen}/${lidNummer}`);
    const augustusRating = await ratingLezen();
    await html.menu(zyq.gebruiker.mutatieRechten, [db.BEHEERDER, "wijzig KNSB gegevens (let op!)", function () {
            html.zelfdePagina(`lid=${lidNummer}&knsb=wijzigen`);
        }],
        [db.BEHEERDER, `${persoon.naam} verwijderen`, async function () {
            const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/verwijder/persoon/${lidNummer}`);
            if (mutaties) {
                html.anderePagina("bestuur.html");
            } else {
                console.log(`${persoon.naam} is niet verwijderd`);
            }
        }],
        [db.WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            html.anderePagina(`agenda.html?gebruiker=${lidNummer}`);
        }]);
    await lidFormulier(persoon, augustusRating);
})();

async function ratingLezen() {
    const rating = await zyq.serverFetch(`/rating/8/${lidNummer}`); // 1 augustus dit seizoen
    if (Number(rating.knsbNummer) === lidNummer && Number(rating.jaar) === jaar) {
        return rating;
    }
    return false;
}

/*
Bij aanmelden zijn persoon en gebruiker toegevoegd door een nieuwe gebruiker
of bestuur heeft persoon toegevoegd en die persoon kan gebruiker toevoegen.

lidFormulier     MySQL tabel
-----------------------------------------------------
naam             persoon, rating
gebruikerSoort   gebruiker
knsbNummer       persoon, rating, speler, gebruiker
interneRating    speler
knsbRating       speler, rating
knsbTeam         speler
nhsbTeam         speler
competities      speler

De knsbRating komt uit de rating lijst van 1 augustus van dit seizoen.

In het lidFormulier
- kan beheerder naam en ksnbNummer van persoon en knsbRating van speler wijzigen
- kan bestuur knsbTeam, nhsbTeam en competities van speler wijzigen en indien nodig speler toevoegen
- kan een geregistreerd gebruiker competities van speler wijzigen en indien nodig speler toevoegen
 */
async function lidFormulier(persoon, augustusRating) {
    console.log("--- lidFormulier(persoon, augustusRating) ---");
    console.log(persoon);
    console.log(augustusRating);
    // formulier invullen
    const knsbNummer = document.getElementById("knsbNummer");
    knsbNummer.value = lidNummer;
    const naam = document.getElementById("naam");
    naam.value = persoon.naam;
    const persoonToevoegen = persoon.knsbNummer === 0;
    if (persoonToevoegen) {
        naam.disabled = false; // enable input
    }
    document.getElementById("gebruiker").value = zyq.gebruikerFunctie(persoon);
    document.getElementById("jaar").append(` op 1 augustus ${jaar}`);
    const knsbRating = document.getElementById("knsbRating");
    if (augustusRating) {
        naam.value = augustusRating.knsbNaam; // TODO achternaam, voornaam omwisselen
        knsbRating.value = augustusRating.knsbRating;
    } else {
        knsbRating.value = persoon.knsbRating;
    }
    const interneRating = document.getElementById("interneRating");
    if (knsbRating.value > 0) {
        interneRating.append(html.optie(knsbRating.value, "zie KNSB rating"));
    }
    for (let ratingOptie = zyq.LAAGSTE_RATING; ratingOptie <= zyq.HOOGSTE_RATING; ratingOptie += 100) {
        if (ratingOptie > knsbRating.value) {
            interneRating.append(html.optie(ratingOptie, ratingOptie));
        }
    }
    if (persoon.interneRating !== null && persoon.interneRating > knsbRating.value) {
        interneRating.value = persoon.interneRating;
    } else if (knsbRating.value > 0) {
        interneRating.value = knsbRating.value;
    } else {
        interneRating.value = zyq.LAAGSTE_RATING;
    }
    const nhsbTeam = document.getElementById("nhsbTeam");
    const knsbTeam = document.getElementById("knsbTeam");
    const competities = document.getElementById("competities");
    const competitie = [];
    let competitieNummer = 0;
    const teams = await zyq.localFetch(`/teams/${zyq.o_o_o.seizoen}`);
    for (const team of teams) {
        if (!zyq.teamOfCompetitie(team.teamCode)) {
            nhsbTeam.append(html.optie(team.teamCode, zyq.teamVoluit(team.teamCode)));
            knsbTeam.append(html.optie(team.teamCode, zyq.teamVoluit(team.teamCode)));
        } else if (team.bond === "n") {
            nhsbTeam.append(html.optie(team.teamCode, zyq.teamVoluit(team.teamCode)));
            if (persoon && persoon.nhsbTeam === team.teamCode) { // speelt persoon in dit nhsbTeam?
                nhsbTeam.value = team.teamCode;
            }
        } else if (team.bond === "k") {
            knsbTeam.append(html.optie(team.teamCode, zyq.teamVoluit(team.teamCode)));
            if (persoon && persoon.knsbTeam === team.teamCode) { // speelt persoon in dit knsbTeam?
                knsbTeam.value = team.teamCode;
            }
        } else if (zyq.interneCompetitie(team.teamCode)) {
            const id = `intern${competitieNummer + 1}`;
            competities.append(html.checkbox(id, team.teamCode, zyq.teamVoluit(team.teamCode)));
            competitie[competitieNummer] = document.getElementById(id);
            if (speeltIntern(persoon, team.teamCode)) {
                competitie[competitieNummer].checked = true;
            }
            competitieNummer++;
        }
    }
    if (knsbWijzigen) {
        naam.disabled = false; // enable input
        knsbNummer.disabled = false; // enable input
        knsbRating.disabled = false; // enable input
    }
    if (db.BESTUUR <= zyq.gebruiker.mutatieRechten) {
        knsbTeam.disabled = false; // enable input
        nhsbTeam.disabled = false; // enable input
    }
    // formulier verwerken
    document.getElementById("formulier").addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        // persoon verwerken
        if (persoon.knsbNummer === 0 && await zyq.serverFetch(`/${zyq.uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
            mutaties++;
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
        const spelerMuteren = "datum" in persoon ? "speler/wijzigen" : "speler/toevoegen";
        const seizoen = zyq.o_o_o.seizoen;
        const rating = knsbRating.value;
        const ratingIntern = interneRating.value;
        const nhsb = nhsbTeam.value === "" ? " " : nhsbTeam.value;
        const knsb = knsbTeam.value === "" ? " " : knsbTeam.value;
        if (await zyq.serverFetch(`/${uuid}/${spelerMuteren}/${seizoen}/${lidNummer}/${rating}/${ratingIntern}/${nhsb}/${knsb}/${vinkjes}/${jaar}-08-01`)) {
            mutaties++;
        }
        if (knsbWijzigen && (Number(knsbNummer.value) !== lidNummer || naam.value !== persoon.naam) &&
            await zyq.serverFetch(`/${zyq.uuidToken}/persoon/wijzigen/${lidNummer}/${knsbNummer.value}/${naam.value}`)) {
            mutaties++;
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