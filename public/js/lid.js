"use strict";

/*
    verwerk lid=<knsbNummer>
 */

(async function() {
    await init();
    const lidNummer = Number(params.get("lid"));
    const persoon = await persoonLezen(lidNummer);
    console.log("--- persoon ---");
    console.log(persoon);
    const ola = olaLezen(lidNummer);
    console.log("--- ola ---");
    console.log(ola);
    menu([WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${lidNummer}&naamGebruiker=${persoon.naam}`);
        }],
        [GEREGISTREERD, "systeembeheer", function () {  // TODO standaard in menu()
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(
        lidNummer,
        persoon,
        ola,
        document.getElementById("formulier"), // TODO is er een truuk om alle velden klaar te zetten?
        document.getElementById("naam"),
        document.getElementById("email"),
        document.getElementById("knsbNummer"),
        document.getElementById("knsbRating"),
        document.getElementById("interneRating"),
        document.getElementById("knsbTeam"),
        document.getElementById("nhsbTeam"),
        // document.getElementById("intern1"),
        // document.getElementById("intern2"),
        document.getElementById("gebruiker"));
})();

async function persoonLezen(lidNummer) {
    const personen = await localFetch(`/personen/${o_o_o.seizoen}`); // reeds gelezen in bestuur.html
    console.log("--- personen ---");
    console.log(personen);
    for (const persoon of personen) {
        if (lidNummer === Number(persoon.knsbNummer)) {
            return persoon;
        };
    }
    return false;
}

function olaLezen(lidNummer) {
    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    console.log("--- olaBestand ---");
    console.log(olaBestand);
    if (olaBestand) {
        for (const olaRegel of olaBestand) {
            if (lidNummer === Number(olaRegel.knsbNummer)) {
                return olaRegel;
            }
        }
    }
    return false;
}

async function lidFormulier(lidNummer,
                            persoon,
                            ola,
                            formulier,
                            naam,
                            email,
                            knsbNummer,
                            knsbRating,
                            interneRating,
                            knsbTeam,
                            nhsbTeam,
                            // intern1,
                            // intern2,
                            gebruiker) {
    // formulier invullen
    knsbNummer.value = lidNummer;
    if (!persoon && ola) {
        naam.value = ola.naam;
    } else if (persoon) {
        naam.value = persoon.naam;
        if (ola && ola.naam !== persoon.naam) {
            console.log(`verschillende namen in persoon: ${persoon.naam} en OLA: ${ola.naam}`);
        }
    }
    if (ola) {
        email.value = ola.email;
    }
    knsbRating.value = 0;
    const spelerToevoegen = !persoon || persoon.knsbRating === null;
    if (!spelerToevoegen) {
        knsbRating.value = persoon.knsbRating;
    }
    if (ola) {
        knsbRating.value = ola.knsbRating; // in OLA bestand van augustus staat juiste KNSB rating
    }
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
    const gebruikerToevoegen = !persoon || persoon.mutatieRechten === null;
    if (!gebruikerToevoegen) {
        gebruiker.value = gebruikerFunctieVoluit(persoon);
    }
    // formulier verwerken
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        if (!persoon) {
            if (await serverFetch(`/${uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
                console.log(`serverFetch(persoon/toevoegen/${lidNummer}/${naam.value})`);
                mutaties++;
            }
        }
        if (spelerToevoegen) {
            if (await serverFetch(
                `/${uuidToken}/speler/toevoegen/${o_o_o.seizoen}/${lidNummer}/${knsbRating.value}/${interneRating.value}/${datumSQL()}`)) {
                mutaties++;
                console.log(`serverFetch(speler/toevoegen/${o_o_o.seizoen}/${lidNummer}/${knsbRating.value}/${interneRating.value}/${datumSQL()})`);
            }
        }
        if (gebruikerToevoegen === null && email.value !== "") { // TODO e-mailadres controleren
            if (await serverFetch(`/${uuidToken}/gebruiker/toevoegen/${lidNummer}/${email.value}`)) {
                mutaties++;
                console.log(`serverFetch(gebruiker/toevoegen/${lidNummer}/${email.value})`);
            }
        }
        /*
        if (mutaties) {
            naarAnderePagina(`bestuur.html?lid=${lidNummer}`);
        } else {
            naarAnderePagina(`bestuur.html`);
        }
         */
    });
}