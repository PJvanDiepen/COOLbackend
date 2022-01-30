"use strict";

(async function() {
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [BEHEERDER, "formulier van geselecteerde speler", function () {
            document.getElementById("naam").value = competitie.naam;
            document.getElementById("knsbNummer").value = competitie.speler;
            document.getElementById("status").value = "iemand anders registreren";
        }]);
    spelerSelecteren(ditSeizoen);
    gebruikerFormulier(
        document.getElementById("formulier"),
        document.getElementById("naam"),
        document.getElementById("knsbNummer"),
        document.getElementById("email"),
        document.getElementById("status"));
})();

// TODO voor iemand anders aanvraag doen (uitsluitend door systeembeheerder)

async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    if (competitie.speler) {
        knsbNummer.value = competitie.speler;
        naam.value = competitie.naam;
    }
    knsbNummer.value = competitie.speler ? competitie.speler : gebruiker.knsbNummer;
    naam.value = competitie.speler ? competitie.naam : gebruiker.naam;
    if (uuidToken) {
        status.value = `${gebruiker.naam} is als gebruiker geregistreerd bij ${competitie.vereniging}`;
    } else if (gebruiker.email) {
        email.value = gebruiker.email;
        status.value = `${gebruiker.naam} heeft al een aanvraag verstuurd`;
    } else if (!competitie.speler) {
        status.value = "selecteer je naam";
    }
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
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
    });
}