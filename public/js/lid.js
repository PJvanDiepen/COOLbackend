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
    const olaLid = olaLidLezen(lidNummer);
    console.log("--- olaLid ---");
    console.log(olaLid);
    menu([WEDSTRIJDLEIDER, `agenda van ${persoon.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${lidNummer}&naamGebruiker=${persoon.naam}`);
        }],
        [GEREGISTREERD, "systeembeheer", function () {  // TODO standaard in menu()
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(
        lidNummer,
        persoon,
        olaLid,
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
    for (const persoon of personen) {
        if (lidNummer === Number(persoon.knsbNummer)) {
            return persoon;
        };
    }
    return {
        knsbNummer: lidNummer,
        naam: null, // indien null peroon toevoegen
        interneRating: null, // indien null speler toevoegen
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

async function lidFormulier(lidNummer,
                            persoon,
                            olaLid,
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
    // const teams = await localFetch("/teams/" + o_o_o.seizoen); // competities en teams
    // console.log("--- teams ---");
    // console.log(teams);
    const rating = Number(olaLid.knsbRating) || Number(persoon.knsbRating);
    if (rating) {
        interneRating.appendChild(htmlOptie(rating, "zie KNSB rating"));
    }
    for (let ratingOptie = LAAGSTE_RATING; ratingOptie <= HOOGSTE_RATING; ratingOptie += 100) {
        if (ratingOptie > rating) {
            interneRating.appendChild(htmlOptie(ratingOptie, ratingOptie));
        }
    }
    knsbNummer.value = lidNummer;
    naam.value = persoon.naam || olaLid.naam;
    email.value = olaLid.email;
    knsbRating.value = rating || LAAGSTE_RATING;
    interneRating.value = Number(persoon.interneRating) > rating ? persoon.interneRating : knsbRating.value;
    gebruiker.value = gebruikerFunctieVoluit(persoon);
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        if (persoon.naam === null) {
            if (await serverFetch(`/${uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
                mutaties++;
            }
        }
        if (persoon.interneRating === null) {
            if (await serverFetch(
                `/${uuidToken}/speler/toevoegen/${o_o_o.seizoen}/${lidNummer}/${knsbRating.value}/${interneRating.value}/${datumSQL()}`)) {
                mutaties++;
            }
        }
        if (persoon.mutatieRechten === null && email.value !== "") {
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