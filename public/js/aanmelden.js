"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk zoek=<zoek>

    terug naar start.html
 */

const zoekNaam = html.params.get("zoek") || "";

const zoek       = html.id("zoek");
const selecteer  = html.id("selecteer");
const informeer  = html.id("informeer");
const naam       = html.id("naam");
const email      = html.id("email");
const knsbNummer = html.id("knsbNummer");
const knsbRating = html.id("knsbRating");

let persoonToevoegen = false;
let gebruikerToevoegen = false;

/*
zoek, selecteer, informeer en verwerk registratie formulier

registratie formulier  MySQL tabel
-----------------------------------------------------
naam                   persoon, rating
email                  gebruiker
knsbNummer             persoon, rating, gebruiker

In het registratie formulier
- kan bestuur naam van persoon intoetsen en persoon toevoegen
- kan een nieuwe gebruiker naam en e-mail intoetsen en persoon en gebruiker toevoegen
- kan een geregistreerd gebruiker e-mail wijzigen en gebruiker bijwerken
 */
(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await zoekPersoon();
    html.id("formulier").addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        // persoon verwerken
        if (persoonToevoegen) {
            if (await zyq.serverFetch(`/${zyq.uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`)) {
                mutaties++;
            }
        } else if (false) { // TODO naam of knsbNummer gewijzigd
            // TODO persoon wijzigen
        }
        // gebruiker verwerken
        if (email.value !== "") { // TODO e-mailadres controleren
            const actie = gebruikerToevoegen ? "toevoegen" : "email";
            if (await zyq.serverFetch(`/${zyq.uuidToken}/gebruiker/${actie}/${lidNummer}/${email.value}`)) {
                mutaties++;
            }
        }
        // TODO iets doen met mutaties of de variable mutaties verwijderen?
        // html.vorigePagina(`lid=${knsbNummer.value}`); // naar agenda.html of bestuur.html TODO naar start.html
    });

    // const tijdelijkNummer = await zyq.serverFetch(`/nummer`); // vanaf 100
    // const persoon = await zyq.serverFetch(`/persoon/${zyq.o_o_o.seizoen}/${lidNummer}`);
    // console.log(persoon);
    // const augustusRating = await ratingLezen();
    // await registratieFormulier(persoon, augustusRating);
})();

async function zoekPersoon() {
    const selectieLijst = [];
    zoek.value = zoekNaam;
    if (zoekNaam.length > 0) {
        const leden = ledenSamenvoegen(
            await zyq.serverFetch(`/naam/8/${zoekNaam}/1000`), // KNSB leden
            await zyq.serverFetch(`/naam/gebruiker/${zoekNaam}`)); // leden bekend in 0-0-0
        console.log(leden);
        for (let i = 0; i < leden.length; i++) {
            if (leden[i].naam === undefined) {
                leden[i].naam = normaleNaam(leden[i].knsbNaam);
            }
            else {
                naam.disabled = true; // niet meer veranderen indien naam al bekend is in 0-0-0
            }
            const tekst = `${leden[i].knsbNummer}, ${leden[i].naam} (${leden[i].knsbRating})`;
            selectieLijst.push([i, tekst, function (index) {
                naam.value = leden[index].naam;
                knsbNummer.value = leden[index].knsbNummer;
                knsbRating.value = leden[index].knsbRating;
                if ("mutatieRechten" in leden[index]) {
                    gebruikerToevoegen = leden[index].mutatieRechten === null;
                    html.tekstToevoegen(informeer, `${leden[index].naam} is bekend in 0-0-0.\n`);
                    persoonToevoegen = false;
                    naam.disabled = true; // naam niet meer veranderen
                } else {
                    gebruikerToevoegen = true;
                    persoonToevoegen = true;
                    naam.disabled = false;
                }
                console.log({persoonToevoegen});
                console.log({gebruikerToevoegen});


            }]);
        }
        console.log(selectieLijst);
        selectieLijst.unshift(["=", `selecteer KNSB nummer, naam (rating)`]);
        html.selectie(selecteer, "=", selectieLijst);
        html.tekstToevoegen(informeer, `Met "${zoekNaam}" zijn ${leden.length} namen gevonden.\n`);
    }
    zoek.addEventListener("change", function () {
        html.zelfdePagina(`zoek=${zoek.value}`);
    });
}

/**
 * ledenSamenvoegen uit KNSB ratinglijst en eigen leden
 *
 * @param knsb leden met {knsbNummer, knsbNaam, knsbRating}
 * @param eigen leden met {knsbNummer, naam, mutatieRechten }
 * @returns {*} eigen leden samengevoegd in knsb leden
 */
function ledenSamenvoegen(knsb, eigen) {
    console.log(knsb);
    console.log(eigen);
    for (const eigenLid of eigen) {
        if (eigenLid.knsbNummer < db.KNSB_NUMMER) { // eigen lid, die nog geen KNSB lid is vooraan toevoegen
            knsb.unshift(eigenLid);
        } else {
            for (const knsbLid of knsb) { // eigen lid samenvoegen met KNSB lid
                if (eigenLid.knsbNummer === knsbLid.knsbNummer) {
                    knsbLid.naam = eigenLid.naam;
                    knsbLid.mutatieRechten = eigenLid.mutatieRechten;
                    break;
                }
            }
        }
    }
    return knsb;
}

/**
 * maak van een knsbNaam een normaleNaam
 *
 * Giri, Anish -> Anish Giri
 * Van Diepen, Peter --> Peter van Diepen
 * Van der Meiden, Dirk --> Dirk van der Meiden
 * Bennema Geerlings, Menno --> Menno Bennema Geerlings
 *
 * @param knsbNaam uit KNSB ratinglijst
 * @returns {string} normaleNaam
 */

function normaleNaam(knsbNaam) {
    const eersteSpatie = knsbNaam.indexOf(" ");
    const naam = eersteSpatie < 4 && eersteSpatie < knsbNaam.indexOf(", ")
        ? knsbNaam.charAt(0).toLowerCase() + knsbNaam.slice(1) // geen hoofdletter voor tussenvoegsel zoals: van, de, enz.
        : knsbNaam;
    return naam.replace(/(.*), (.*)/g, "$2 $1"); // Zie blz. 155 Marijn Haverbeke: Eloquent JavaScript
}