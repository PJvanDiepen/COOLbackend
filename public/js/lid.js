"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk lid=<knsbNummer>
           &knsb=wijzigen

    terug naar agenda.html of bestuur.html
 */
const lidNummer = Number(html.params.get("lid"));
const knsbWijzigen = html.params.get("knsb") === "wijzigen";

(async function() {
    await zyq.init();
    document.getElementById("kop").innerHTML = zyq.o_o_o.vereniging + html.SCHEIDING + zyq.seizoenVoluit(zyq.o_o_o.seizoen);
    const persoon = await persoonLezen();
    const ola = olaLezen();
    await html.menu(zyq.gebruiker.mutatieRechten,[db.BEHEERDER, "wijzig KNSB gegevens (pas op!)", function () {
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
            html.anderePagina(`agenda.html?gebruiker=${lidNummer}&naamGebruiker=${persoon.naam}`);
        }]);
    lidFormulier(persoon, ola);
})();

async function persoonLezen() {
    const personen = await zyq.serverFetch(`/personen/${zyq.o_o_o.seizoen}`); // TODO 1 persoon lezen
    for (const persoon of personen) {
        if (Number(persoon.knsbNummer) === lidNummer) {
            return persoon;
        }
    }
    return false;
}

function olaLezen() {
    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    if (olaBestand) {
        for (const olaRegel of olaBestand) {
            if (Number(olaRegel.knsbNummer) === lidNummer) {
                return olaRegel;
            }
        }
    }
    return false;
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

async function lidFormulier(persoon, ola) {
    // formulier invullen
    const knsbNummer = document.getElementById("knsbNummer");
    knsbNummer.value = lidNummer;
    const naam = document.getElementById("naam");
    if (!persoon && ola) {
        naam.value = ola.naam;
    } else if (persoon) {
        naam.value = persoon.naam;
        if (ola && ola.naam !== persoon.naam) {
            console.log(`verschillende namen in persoon: ${persoon.naam} en OLA: ${ola.naam}`);
        }
    }
    const email = document.getElementById("email");
    if (ola) {
        email.value = ola.email;
    } else {
        // TODO gebruiker.email invullen indien gebruiker.knsbNummer === lidNummer
    }
    const gebruikerSoort = document.getElementById("gebruiker");
    const gebruikerToevoegen = !persoon || persoon.mutatieRechten === null;
    if (!gebruikerToevoegen) {
        gebruikerSoort.value = zyq.gebruikerFunctie(persoon);
    }
    const knsbRating = document.getElementById("knsbRating");
    knsbRating.value = 0;
    const spelerToevoegen = !persoon || persoon.knsbRating === null;
    if (!spelerToevoegen) {
        knsbRating.value = persoon.knsbRating;
    }
    if (ola) {
        knsbRating.value = ola.knsbRating; // in OLA bestand van augustus staat juiste KNSB rating
    }
    // TODO html.selectie toepassen
    const interneRating = document.getElementById("interneRating");
    if (knsbRating.value > 0) {
        interneRating.append(html.optie(knsbRating.value, "zie KNSB rating"));
    }
    for (let ratingOptie = zyq.LAAGSTE_RATING; ratingOptie <= zyq.HOOGSTE_RATING; ratingOptie += 100) {
        if (ratingOptie > knsbRating.value) {
            interneRating.append(html.optie(ratingOptie, ratingOptie));
        }
    }
    if (!spelerToevoegen && persoon.interneRating !== null && persoon.interneRating > knsbRating.value) {
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
    let speeltInAantalCompetities = 0;
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
                speeltInAantalCompetities++;
            }
            competitieNummer++;
        }
    }
    if (knsbWijzigen) {
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
        if (gebruikerToevoegen && email.value !== "") { // TODO e-mailadres controleren
            if (await zyq.serverFetch(`/${zyq.uuidToken}/gebruiker/toevoegen/${lidNummer}/${email.value}`)) {
                mutaties++;
            }
        } else if (false) { // TODO email gewijzigd
            // TODO gebruiker wijzigen
        }
        // speler verwerken
        const rating = knsbRating.value;
        const ratingIntern = interneRating.value;
        const nhsb = nhsbTeam.value === "" ? " " : nhsbTeam.value;
        const knsb = knsbTeam.value === "" ? " " : knsbTeam.value;
        const intern = []; // speeltIntern volgens lidformulier
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
        if (spelerToevoegen) {
            if (await zyq.serverFetch(`/${zyq.uuidToken}/speler/toevoegen/${zyq.o_o_o.seizoen}/${lidNummer}/${rating}/${ratingIntern}/${nhsb}/${knsb}/${vinkjes}/${zyq.datumSQL()}`)) {
                mutaties++;
            }
        } else if (persoon) {
            let nietGewijzigd =
                Number(persoon.knsbRating) === Number(rating) &&
                Number(persoon.interneRating) === Number(ratingIntern) &&
                persoon.nhsbTeam.trim() === nhsb.trim() &&
                persoon.knsbTeam.trim() === knsb.trim() &&
                speeltInAantalCompetities === internNummer;
            for (let i = 0; i < internNummer; i++) {
                nietGewijzigd = nietGewijzigd && speeltIntern(persoon, intern[i].trim());
            }
            if (!nietGewijzigd) { // wel gewijzigd
                if (await zyq.serverFetch(`/${zyq.uuidToken}/speler/wijzigen/${zyq.o_o_o.seizoen}/${lidNummer}/${rating}/${ratingIntern}/${nhsb}/${knsb}/${vinkjes}/${zyq.datumSQL()}`)) {
                    mutaties++;
                }
            }
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