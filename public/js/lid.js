"use strict";

/*
    verwerk lid=<knsbNummer>
 */

(async function() {
    await init();
    const lidNummer = Number(params.get("lid"));
    menu([GEREGISTREERD, "systeembeheer", function () {  // TODO standaard in menu()
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(
        lidNummer,
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

async function lidFormulier(lidNummer,
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
    const persoon = await persoonLezen(lidNummer);
    console.log("--- persoon ---");
    console.log(persoon);
    const olaLid = olaLidLezen(lidNummer);
    console.log("--- olaLid ---");
    console.log(olaLid);
    // const teams = await localFetch("/teams/" + o_o_o.seizoen); // competities en teams
    // console.log("--- teams ---");
    // console.log(teams);
    const olaRating = Number(olaLid.knsbRating);
    if (olaRating) {
        interneRating.appendChild(htmlOptie(olaRating, "zie KNSB rating"));
    }
    for (let rating = LAAGSTE_RATING; rating <= HOOGSTE_RATING; rating += 100) {
        if (rating > olaRating) {
            interneRating.appendChild(htmlOptie(rating, rating));
        }
    }
    knsbNummer.value = lidNummer;
    naam.value = persoon.naam || olaLid.naam;
    email.value = olaLid.email;
    knsbRating.value = olaRating || LAAGSTE_RATING;
    interneRating.value = Number(persoon.interneRating) > olaRating ? persoon.interneRating : knsbRating.value;
    gebruiker.value = gebruikerFunctieVoluit(persoon);
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        if (persoon.interneRating === null) {
            if (await serverFetch(`/${uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
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

async function persoonLezen(lidNummer) {
    const personen = await localFetch(`/personen/${o_o_o.seizoen}`); // reeds gelezen in bestuur.html
    for (const lid of personen) {
        if (lidNummer === Number(lid.knsbNummer)) {
            return lid;
        };
    }
    return {
        knsbNummer: lidNummer,
        naam: "",
        interneRating: null, // indien null persoon en speler toevoegen
        mutatieRechten: null }; // indien null gebruiker toevoegen
}

function olaLidLezen(lidNummer) {
    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    if (olaBestand) {
        for (const olaRegel of olaBestand) {
            if (lidNummer === Number(olaRegel.knsbNummer)) {
                return olaRegel;
            }
        }
    }
    return { knsbNummer: lidNummer, naam: "", email: "", knsbRating: 0 }; // knsbRating wijzigen
}