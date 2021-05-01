"use strict";

gebruikerFormulier(document.getElementById("formulier"),
    document.getElementById("naam"),
    document.getElementById("knsbNummer"),
    document.getElementById("email"),
    document.getElementById("status"));

function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    if (gebruiker) {
        naam.value = naamGebruiker;
        knsbNummer.value = gebruiker;
        status.value = "gebruiker is geregistreerd bij " + schaakVereniging;
    } else {
        naam.value = naamSpeler;
        knsbNummer.value = speler;
    }
    formulier.addEventListener("submit", async function (event) {
        await serverFetch("/registreer/" + knsbNummer.value + "/" + email.value);
        event.preventDefault();
    });
}