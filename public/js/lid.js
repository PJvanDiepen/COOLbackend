"use strict";

/*
    verwerk lid=<knsbNummer>
 */

(async function() {
    await init();
    const lidNummer = Number(params.get("lid"));
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    lidFormulier(
        lidNummer,
        document.getElementById("formulier"),
        document.getElementById("naam"),
        document.getElementById("email"),
        document.getElementById("knsbNummer"),
        document.getElementById("knsbRating"),
        document.getElementById("interneRating"),
        document.getElementById("knsbTeam"),
        document.getElementById("nhsbTeam"),
        document.getElementById("intern1"),
        document.getElementById("intern2"),
        document.getElementById("status"));
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
                            intern1,
                            intern2,
                            status) {
    const personen = await localFetch(`/personen/${o_o_o.seizoen}`);
    console.log("--- personen ---");
    console.log(personen);

    const olaLid = [];
    for (const lid of personen) {
        const knsbNummer = Number(lid.knsbNummer);
        olaLid[knsbNummer] = knsbNummer; // bekend in persoon tabel
    }

    let teams = await localFetch("/teams/" + o_o_o.seizoen); // competities en teams
    console.log("--- teams ---");
    console.log(teams);

    if (!teams) {
        // TODO team

    }

    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    if (olaBestand) {
        console.log("--- olaBestand ---");
        console.log(olaBestand);
        for (const olaRegel of olaBestand) {
            const knsbNummer = Number(olaRegel.knsbNummer);
            if (isNaN(knsbNummer)) {
                // console.log(olaRegel.knsbNummer);
            } else if (olaLid[knsbNummer] === knsbNummer) {
                olaLid[Number(knsbNummer)] = olaRegel; // bekend in persoon tabel
            } else {

            }
        }
    }

    knsbNummer.value = o_o_o.speler ? o_o_o.speler : gebruiker.knsbNummer;
    naam.value = o_o_o.speler ? o_o_o.naam : gebruiker.naam;
    if (uuidToken) {
        status.value = `${gebruiker.naam} is als gebruiker geregistreerd bij ${o_o_o.vereniging}`;
    } else if (gebruiker.email) {
        email.value = gebruiker.email;
        status.value = `${gebruiker.naam} heeft al een aanvraag verstuurd`;
    } else if (!o_o_o.speler) {
        status.value = "selecteer je naam";
    }
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
        naarAnderePagina(`bestuur.html?lid=${lidNummer}`);
        /*
        if (Number(knsbNummer.value)) {
            gebruiker.knsbNummer = Number(knsbNummer.value);
            gebruiker.naam = naam.value;
            gebruiker.email = email.value;
            gebruiker.mutatieRechten = 0;
            const json = JSON.stringify(gebruiker);
            sessionStorage.setItem("/gebruiker/", json); // voorlopig zonder uuidToken
            volgendeSessie(json); // overschrijf eventueel uuidToken
            status.value = "je aanvraag is verstuurd voor controle";
            const mutaties = await serverFetch(`/registreer/${knsbNummer.value}/${email.value}`);
        } else {
            status.value = "selecteer je naam";
        }
         */
    });
}