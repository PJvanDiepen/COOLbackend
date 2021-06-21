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

// TODO goed testen
// https://dexie.org/docs/StorageManager
// https://web.dev/storage-for-the-web/
// https://web.dev/persistent-storage/
// https://stackoverflow.com/questions/63761182/can-not-activate-navigator-storage-persist-in-firefox-for-android
// https://stackoverflow.com/questions/51657388/request-persistent-storage-permissions
navigator.storage.estimate().then(
    ({usage, quota}) => console.log(`using ${usage} out of ${quota}`),
    error => console.warn(`error estimating quota: ${error.name}: ${error.message}`)
);


async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    alert("gebruikerFormulier");
    if (uuidToken) {
        knsbNummer.value = await knsbNummerGebruiker();
        naam.value = await naamGebruiker();
        knsbNummer.value = await knsbNummerGebruiker();
        status.value = "je bent als gebruiker geregistreerd bij " + vereniging;
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