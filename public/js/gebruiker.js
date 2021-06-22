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

navigator.storage.estimate().then(
    ({usage, quota}) => console.log(`using ${usage} out of ${quota}`),
    error => console.warn(`error estimating quota: ${error.name}: ${error.message}`)
);
initStoragePersistence();
console.log('------------------------');
/*
https://dexie.org/docs/StorageManager

 Tries to persist storage without ever prompting user.
 @returns {Promise<string>}
 "never" In case persisting is not ever possible. Caller don't bother
 asking user for permission.
 "prompt" In case persisting would be possible if prompting user first.
 "persisted" In case this call successfully silently persisted the storage,
 or if it was already persisted.
 */
async function tryPersistWithoutPromtingUser() {
    if (!navigator.storage || !navigator.storage.persisted) {
        return "never";
    }
    let persisted = await navigator.storage.persisted();
    if (persisted) {
        return "persisted";
    }
    if (!navigator.permissions || !navigator.permissions.query) {
        return "prompt"; // It MAY be successful to prompt. Don't know.
    }
    const permission = await navigator.permissions.query({
        name: "persistent-storage"
    });
    if (permission.state === "granted") {
        persisted = await navigator.storage.persist();
        if (persisted) {
            return "persisted";
        } else {
            throw new Error("Failed to persist");
        }
    }
    if (permission.state === "prompt") {
        return "prompt";
    }
    return "never";
}

async function initStoragePersistence() {
    const persist = await tryPersistWithoutPromtingUser();
    switch (persist) {
        case "never":
            console.log("Not possible to persist storage");
            break;
        case "persisted":
            console.log("Successfully persisted storage silently");
            break;
        case "prompt":
            console.log("Not persisted, but we may prompt user when we want to.");
            break;
    }
}

async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
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