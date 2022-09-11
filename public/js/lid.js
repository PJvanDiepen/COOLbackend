"use strict";

/*
    verwerk lid=<knsbNummer>
 */
const lidNummer = Number(params.get("lid"));

(async function() {
    await init();
    document.getElementById("kop").innerHTML = o_o_o.vereniging + SCHEIDING + seizoenVoluit(o_o_o.seizoen);
    const persoon = await persoonLezen();
    console.log("--- persoon ---");
    console.log(persoon);
    const ola = olaLezen();
    console.log("--- ola ---");
    console.log(ola);
    menu([WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${lidNummer}&naamGebruiker=${persoon.naam}`);
        }],
        [GEREGISTREERD, "systeembeheer", function () {  // TODO standaard in menu()
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(persoon, ola);
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

function speeltIntern(persoon, teamCode) {
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
    const competities = document.getElementById("competities");
    const competitie = [];
    let competitieNummer = 0;
    const teams = await localFetch("/teams/" + o_o_o.seizoen);
    for (const team of teams) {
        if (!teamOfCompetitie(team.teamCode)) {
            nhsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            knsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        } else if (team.bond === "n") {
            nhsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            if (persoon && persoon.nhsbTeam === team.teamCode) { // speelt persoon in dit nhsbTeam?
                nhsbTeam.value = team.teamCode;
            }
        } else if (team.bond === "k") {
            knsbTeam.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            if (persoon && persoon.knsbTeam === team.teamCode) { // speelt persoon in dit knsbTeam?
                knsbTeam.value = team.teamCode;
            }
        } else if (interneCompetitie(team.teamCode)) {
            const id = `intern${competitieNummer + 1}`;
            competities.appendChild(htmlCheckbox(id, team.teamCode, teamVoluit(team.teamCode)));
            competitie[competitieNummer] = document.getElementById(id);
            if (speeltIntern(persoon, team.teamCode)) {
                competitie[competitieNummer].checked = true;
            }
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
        } else if (false) { // TODO naam of knsbNummer gewijzigd
            // TODO persoon wijzigen
        }
        if (spelerToevoegen) {
            if (await serverFetch(
                `/${uuidToken}/speler/toevoegen/${o_o_o.seizoen}/${lidNummer}/${knsbRating.value}/${interneRating.value}/${datumSQL()}`)) {
                mutaties++;
            }
        } else if (false) { // TODO rating, team of competitie gewijzigd
            // TODO speler wijzigen
        }
        if (gebruikerToevoegen && email.value !== "") { // TODO e-mailadres controleren
            if (await serverFetch(`/${uuidToken}/gebruiker/toevoegen/${lidNummer}/${email.value}`)) {
                mutaties++;
            }
        } else if (false) { // TODO email gewijzigd
            // TODO gebruiker wijzigen
        }
        if (mutaties) {
            naarAnderePagina(`bestuur.html?lid=${lidNummer}`);
        } else {
            naarAnderePagina(`bestuur.html`);
        }
    });
}