"use strict";

menu(naarAgenda,
    naarRanglijst,
    [9, "andere gebruiker",
        function () {
            document.getElementById("naam").value = naamSpeler;
            document.getElementById("knsbNummer").value = speler;
            document.getElementById("status").value = "";
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
        knsbNummer.value = await knsbNummerGebruiker();
        naam.value = await naamGebruiker();
        knsbNummer.value = await knsbNummerGebruiker();
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