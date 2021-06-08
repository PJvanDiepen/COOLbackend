"use strict";

menu(naarBeheer,
    naarAgenda,
    naarRanglijst,
    [9, "formulier van geselecteerde speler", function () {
        document.getElementById("naam").value = naamSpeler;
        document.getElementById("knsbNummer").value = speler;
        document.getElementById("status").value = "iemand anders registreren";
    }],
    debugAlerts,
    terugNaar);
spelerSelecteren();
gebruikerFormulier(document.getElementById("formulier"),
    document.getElementById("naam"),
    document.getElementById("knsbNummer"),
    document.getElementById("email"),
    document.getElementById("status"));

async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    if (uuidToken) {
        knsbNummer.value = await knsbNummerGebruiker();
        naam.value = await naamGebruiker();
        knsbNummer.value = await knsbNummerGebruiker();
        status.value = "je bent als gebruiker geregistreerd bij " + schaakVereniging;
    } else {
        naam.value = naamSpeler;
        knsbNummer.value = speler;
        try {
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
            status.value = "dit apparaat is geschikt voor 0-0-0.nl"
        } catch (error) {
            status.value = "dit apparaat heeft geen localStorage";
        }
    }
    formulier.addEventListener("submit", async function (event) {
        if (knsbNummer.value) {
            await serverFetch("/registreer/" + knsbNummer.value + "/" + email.value);
            status.value = "je aanvraag wordt gecontroleerd";
        } else {
            status.value = "selecteer je naam";
        }
        event.preventDefault(); // TODO is dit goed?
    });
}