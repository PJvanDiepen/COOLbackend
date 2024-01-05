"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk zoek=<zoek>
           &maand=<ratingMaand>

    terug naar bestuur.html
 */

const zoekNaam = html.params.get("zoek") || "";
const ratingMaand = Number(html.params.get("maand")) || 8; // augustus

const zoek       = html.id("zoek");
const selecteer  = html.id("selecteer");
const maand      = html.id("maand");
const informeer  = html.id("informeer");
const naam       = html.id("naam");
const email      = html.id("email");
const knsbNummer = html.id("knsbNummer");
const knsbRating = html.id("knsbRating");

let persoonToevoegen = false;
let gebruikerToevoegen = false;

const MINIMUM_TEKST = 6;

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
- kan een geregistreerde gebruiker e-mail wijzigen en gebruiker bijwerken
 */
(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten, []);
    await selecteerRatingMaand(maand);
    await zoekPersoon();
    html.id("formulier").addEventListener("submit", async function (event) {
        event.preventDefault();
        let mutaties = 0;
        // verwerk persoon
        let lidNummer = Number(knsbNummer.value); // 0 of knsbNummer uit KNSB ratinglijst
        let nieuwLidNummer = 0;
        if (naam.value.length > MINIMUM_TEKST && (persoonToevoegen || lidNummer === 0)) {
            nieuwLidNummer = Number(await zyq.serverFetch(`/${zyq.uuidToken}/persoon/toevoegen/${lidNummer}/${naam.value}`));
            if (nieuwLidNummer) {
                mutaties++;
            }
        }
        // verwerk gebruiker
        if (email.value.length > MINIMUM_TEKST && (gebruikerToevoegen || nieuwLidNummer)) {
            if (await zyq.serverFetch(`/${zyq.uuidToken}/gebruiker/toevoegen/${nieuwLidNummer}/${email.value}`)) {
                mutaties++;
            }
        }
        if (mutaties > 0) {
            html.anderePagina(`bestuur.html?lid=${nieuwLidNummer}`);
        }
        if (zyq.gebruiker.mutatieRechten === db.IEDEREEN) { // indien niet geregistreerd
            html.tekstToevoegen(informeer, `Probeer je registratie opnieuw te activeren.\n`);
        }
    });
})();

async function selecteerRatingMaand(knop) {
    const lijsten = (await zyq.localFetch(`/rating/lijsten`)).map(function (lijst) {
        const {maand, jaar} = lijst;
        return [maand, `${db.maandInvullen.get(maand)} ${jaar}`];
    });
    html.selectie(knop, ratingMaand, lijsten, function (maand) {
        html.zelfdePagina(`zoek=${zoekNaam}&maand=${maand}`);
    });
}

/**
 * zoekPersoon in KNSB ratinglijst van ratingMaand
 *
 * @returns {Promise<void>}
 */
async function zoekPersoon() {
    const selectieLijst = [];
    zoek.value = zoekNaam;
    if (zoekNaam.length > 0) {
        const leden = ledenSamenvoegen(
            await zyq.serverFetch(`/naam/${ratingMaand}/${zoekNaam}/1000`), // KNSB leden
            await zyq.serverFetch(`/naam/gebruiker/${zoekNaam}`)); // leden bekend in 0-0-0
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
            }]);
        }
        selectieLijst.unshift(["=", `selecteer KNSB nummer, naam (rating)`]);
        html.selectie(selecteer, "=", selectieLijst);
        html.tekstToevoegen(informeer, `Met "${zoekNaam}" zijn ${leden.length} namen gevonden.\n`);
    }
    zoek.addEventListener("change", function () {
        html.zelfdePagina(`zoek=${zoek.value}&maand=${ratingMaand}`);
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