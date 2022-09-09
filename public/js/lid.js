"use strict";

/*
    verwerk lid=<knsbNummer>
 */
const lidNummer = Number(params.get("lid"));

(async function() {
    await init();
    const persoon = await persoonLezen();
    console.log("--- persoon ---");
    console.log(persoon);
    const competities = persoon ? competitiesVanPersoon(persoon) : "";
    const ola = olaLezen();
    console.log("--- ola ---");
    console.log(ola);
    menu([WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${lidNummer}&naamGebruiker=${persoon.naam}`);
        }],
        [GEREGISTREERD, "systeembeheer", function () {  // TODO standaard in menu()
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(persoon, competities, ola);
})();

async function persoonLezen() {
    const personen = await localFetch(`/personen/${o_o_o.seizoen}`);
    for (const persoon of personen) {
        if (Number(persoon.knsbNummer) === lidNummer) {
            return persoon;
        }
    }
    return false;
}

function competitiesVanPersoon(persoon) {
    return persoon.intern1 + persoon.intern2 + persoon.intern3 + persoon.intern4 + persoon.intern5;
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

async function lidFormulier(persoon, competities, ola) {
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
    }
    const gebruiker = document.getElementById("gebruiker");
    const gebruikerToevoegen = !persoon || persoon.mutatieRechten === null;
    if (!gebruikerToevoegen) {
        gebruiker.value = gebruikerFunctieVoluit(persoon);
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
    const interneRating = document.getElementById("interneRating");
    if (knsbRating.value > 0) {
        interneRating.appendChild(htmlOptie(knsbRating.value, "zie KNSB rating"));
    }
    for (let ratingOptie = LAAGSTE_RATING; ratingOptie <= HOOGSTE_RATING; ratingOptie += 100) {
        if (ratingOptie > knsbRating.value) {
            interneRating.appendChild(htmlOptie(ratingOptie, ratingOptie));
        }
    }
    if (!spelerToevoegen && persoon.interneRating !== null && persoon.interneRating > knsbRating.value) {
        interneRating.value = persoon.interneRating;
    } else if (knsbRating.value > 0) {
        interneRating.value = knsbRating.value;
    } else {
        interneRating.value = LAAGSTE_RATING;
    }
    const nhsbTeam = document.getElementById("nhsbTeam");
    const knsbTeam = document.getElementById("knsbTeam");
    const competitie = [
        document.getElementById("intern1"),
        document.getElementById("intern2")]; // TODO voorlopig 2 competities
    let competitieNummer = 0;
    const teams = await localFetch("/teams/" + o_o_o.seizoen);
    for (const team of teams) {
        if (!teamOfCompetitie(team.teamCode)) {
            nhsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            knsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            competitie[0].appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            competitie[1].appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        } else if (team.bond === "n") {
            nhsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        } else if (team.bond === "k") {
            knsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        } else if (isCompetitie(team.teamCode)) {
            console.log("--- competities ---");
            console.log(competities);
            console.log(team.teamCode);
            if (competities.includes(team.teamCode)) { // staat deze competitie bij de competities van persoon?
                console.log("ja");
                competitie[competitieNummer].value = team.teamCode;
            }
            competitie[competitieNummer].appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            competitieNummer++;
        }
    }
    // formulier verwerken
    document.getElementById("formulier").addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        if (!persoon) {
            if (await serverFetch(`/${uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
                mutaties++;
            }
        }
        if (spelerToevoegen) {
            if (await serverFetch(
                `/${uuidToken}/speler/toevoegen/${o_o_o.seizoen}/${lidNummer}/${knsbRating.value}/${interneRating.value}/${datumSQL()}`)) {
                mutaties++;
            }
        }
        if (gebruikerToevoegen === null && email.value !== "") { // TODO e-mailadres controleren
            if (await serverFetch(`/${uuidToken}/gebruiker/toevoegen/${lidNummer}/${email.value}`)) {
                mutaties++;
            }
        }
        if (mutaties) {
            naarAnderePagina(`bestuur.html?lid=${lidNummer}`);
        } else {
            naarAnderePagina(`bestuur.html`);
        }
    });
}