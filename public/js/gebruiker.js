"use strict";

menu(naarBeheer,
    naarAgenda,
    naarRanglijst,
    [9, "formulier van geselecteerde speler", function () {
        document.getElementById("naam").value = naamSpeler;
        document.getElementById("knsbNummer").value = speler;
        document.getElementById("status").value = "iemand anders registreren";
    }],
    terugNaar);
spelerSelecteren();
gebruikerFormulier(document.getElementById("formulier"),
    document.getElementById("naam"),
    document.getElementById("knsbNummer"),
    document.getElementById("email"),
    document.getElementById("status"));

async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    if (uuidToken) {
        knsbNummer.value = gebruiker.knsbNummer;
        naam.value = gebruiker.naam;
        status.value = "je bent als gebruiker geregistreerd bij " + vereniging;
    } else if (speler) {
        knsbNummer.value = speler;
        naam.value = naamSpeler;
    } else {
        knsbNummer.value = gebruiker.knsbNummer;
        naam.value = gebruiker.naam;
        email.value = gebruiker.email;
        status.value = knsbNummer.value ? "selecteer je naam" : "je aanvraag wordt gecontroleerd";
    }
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault(); // TODO is dit goed?
        if (knsbNummer.value) {
            gebruikerBijwerken(knsbNummer.value, naam.value, email.value);
            status.value = "je aanvraag is verstuurd voor controle";
            const mutaties = await serverFetch(`/registreer/${knsbNummer.value}/${email.value}`);
            alert("mutaties: " + mutaties);
            if (!mutaties && debugNivo > 1) {
                alert("registreren is mislukt");
            }
        } else {
            status.value = "selecteer je naam";
        }
    });
}