"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";
import {voorloopNul} from "./zyq.js";

/*
    verwerk lid=<knsbNummer>
 */

const ratinglijstMaandJaarInvullen = new Map([]); // [naam CSV-bestand, [maand, jaar]]

(async function() {
    await zyq.init();
    const lidNummer = Number(html.params.get("lid"));
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await ledenLijst(
        lidNummer,
        document.getElementById("kop"),
        document.getElementById("competities"),
        document.getElementById("tabel"));
    alleRatinglijsten(document.getElementById("ratinglijsten"));
    leesRatinglijst(document.getElementById("csvFile"), document.getElementById("csvInfo"));
})();

async function ledenLijst(lidNummer, kop, competities, tabel) {
    kop.innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + "overzicht voor bestuur";
    const personen = await zyq.serverFetch(`/personen/${zyq.o_o_o.seizoen}`);
    competities.append(html.rij("personen in 0-0-0", "", personen.length - 11)); // aantal personen zonder onbekend en 10 x niemand
    const tijdelijkNummer = await zyq.serverFetch(`/nummer`); // vanaf 100
    tabel.append(html.rij(
        html.naarPagina(`lid.html?lid=${tijdelijkNummer}`, "----- iemand toevoegen -----"),
        "", // knsbNummer
        "", // knsbRating
        "", // eventueel interne rating
        "", // knsbTeam
        "", // nhsbTeam
        "", // competities
        "")); // functie
    const olaLid = [];
    for (const lid of personen) {
        const knsbNummer = Number(lid.knsbNummer);
        olaLid[knsbNummer] = knsbNummer; // bekend in persoon tabel
    }
    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    if (olaBestand) {
        for (const olaRegel of olaBestand) {
            const knsbNummer = Number(olaRegel.knsbNummer);
            if (isNaN(knsbNummer)) {
                // console.log(olaRegel.knsbNummer);
            } else if (olaLid[knsbNummer] === knsbNummer) {
                olaLid[Number(knsbNummer)] = olaRegel; // bekend in persoon tabel
            } else {
                tabel.append(html.rij(
                    html.naarPagina(`lid.html?lid=${knsbNummer}`, olaRegel.olaNaam),
                    knsbNummer > 1000000 ? knsbNummer : "",
                    olaRegel.knsbRating,
                    "", // interne rating
                    "", // knsbTeam
                    "", // nhsbTeam
                    "", // competities
                    "")); // functie
            }
        }
    }
    let aantalGebruikers = 0;
    let aantalPerTeam = {};
    const teams = await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen); // competities en teams
    for (const team of teams) {
        if (zyq.teamOfCompetitie(team.teamCode)) {
            aantalPerTeam[team.teamCode] = 0;
        }
    }
    for (const lid of personen) {
        const knsbNummer = Number(lid.knsbNummer);
        if (knsbNummer > 100) {
            if (lid.mutatieRechten !== null) {
                aantalGebruikers++;
            }
            if (lid.knsbTeam !== null && lid.knsbTeam) {
                aantalPerTeam[lid.knsbTeam]++;
            }
            if (lid.nhsbTeam !== null && lid.nhsbTeam) {
                aantalPerTeam[lid.nhsbTeam]++;
            }
            if (lid.intern1 !== null &&  lid.intern1) {
                aantalPerTeam[lid.intern1]++;
            }
            if (lid.intern2 !== null &&  lid.intern2) {
                aantalPerTeam[lid.intern2]++;
            }
            if (lid.intern3 !== null &&  lid.intern3) {
                aantalPerTeam[lid.intern3]++;
            }
            if (lid.intern4 !== null &&  lid.intern4) {
                aantalPerTeam[lid.intern4]++;
            }
            if (lid.intern5 !== null &&  lid.intern5) {
                aantalPerTeam[lid.intern5]++;
            }
            const link = html.naarPagina(`lid.html?lid=${knsbNummer}`, lid.naam);
            html.verwerkt(link,knsbNummer === lidNummer);
            const olaRating = !olaLid[knsbNummer] || typeof olaLid[knsbNummer] === "number" ? 0 : Number(olaLid[knsbNummer].knsbRating);
            tabel.append(html.rij(
                link,
                knsbNummer > 1000000 ? knsbNummer : "",
                olaRating ? olaRating : lid.knsbRating === null ? "" : lid.knsbRating,
                lid.interneRating === null ? "" : lid.interneRating === lid.knsbRating ? zyq.ZELFDE : lid.interneRating,
                lid.knsbTeam === null ? "" : lid.knsbTeam,
                lid.nhsbTeam === null ? "" : lid.nhsbTeam,
                lid.intern1 === null ? "" : [lid.intern1, lid.intern2, lid.intern3, lid.intern4, lid.intern5].join(", "),
                lid.mutatieRechten === null ? "" : zyq.gebruikerFunctie(lid)
            ));
        }
    }
    competities.append(html.rij("gebruikers van 0-0-0", "", aantalGebruikers));
    competities.append(html.rij("----- competitie of team toevoegen -----", "")); // TODO naar competitie.html
    for (const team of teams) {
        if (zyq.teamOfCompetitie(team.teamCode)) {
            competities.append(html.rij(zyq.teamVoluit(team.teamCode), team.teamCode, aantalPerTeam[team.teamCode]));
        }
    }
}

function alleRatinglijsten(lijst) {
    const datum = new Date();
    const ditJaar = datum.getFullYear();
    const dezeMaand = datum.getMonth() + 1;
    console.log({dezeMaand});
    for (let i = 12; i > 0; i--) {
        const maand = (i + dezeMaand) > 12 ? (i + dezeMaand) - 12: (i + dezeMaand);
        const jaar = (i + dezeMaand) > 12 ? ditJaar : ditJaar - 1;
        const naam = `${jaar}-${voorloopNul(maand)}-KNSB`;
        lijst.append(html.rij(html.naarPaginaEnTerug(
            `https://schaakbond.nl/wp-content/uploads/${jaar}/${voorloopNul(maand)}/${naam}-KNSB.zip`,
            `Ratinglijst 1 ${db.maandInvullen.get(maand)} ${jaar}`),
            `${naam}.zip`, // TODO blanko indien VINKJE
            `${naam}.csv`, // TODO blanko indien VINKJE
            html.KRUISJE)); // TODO of VINKJE
        ratinglijstMaandJaarInvullen.set(`${naam}.csv`, maand); // TODO [maand,jaar]
    }
}

function leesRatinglijst(filesList, output) {
    filesList.addEventListener("change", function (event) {
        const files = event.target.files;
        if (!ratinglijstMaandJaarInvullen.has(files[0].name)) {
            output.innerText += `\n${files[0].name} is geen ratinglijst.`;
        } else {
            const maand = ratinglijstMaandJaarInvullen.get(files[0].name); // TODO const [maand, jaar] =
            output.innerText += `\n${files[0].name} verwerken met maand = ${maand}.`; // TODO en jaar =
            const reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onerror = function() {
                output.innerText += `\n${files[0].name} lezen gaat fout met code: ${reader.error.code}.`;
            };
            reader.onload = function() {
                const regels = reader.result.split('\r\n');
                console.log(regels[0]);
                console.log(regels[0] === "Relatienummer;Naam;Titel;FED;Rating;Nv;Geboren;S");
                console.log(regels[regels.length - 1]);
                console.log(regels[regels.length - 1] === "");
                if (regels.shift() === "Relatienummer;Naam;Titel;FED;Rating;Nv;Geboren;S" && regels.pop() === "") { // zonder eerste en laatste regel
                    for (const regel of regels) {
                        verwerkRating(regel.split(';'), maand);
                    }
                    // html.zelfdePagina(`maand=&${maand}`); // TODO comment om te testen
                } else {
                    output.innerText += `\n${files[0].name} bevat geen ratinglijst.`;
                }
            };
        }
    });
}



function verwerkRating(velden, maand) {
    console.log(velden);
}

/*
Zie Matt Frisbie: Professional JavaScript for Web Developers blz. 760
 */
function olaBestandLezen() {
    // console.log("--- olaBestandLezen() ---");
    const filesList = document.getElementById("olaFile");
    filesList.addEventListener("change", function (event) {
        const output = document.getElementById("output");
        const files = event.target.files;
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onerror = function() {
            output.innerHTML = "Could not read file, error code is " + reader.error.code;
        };
        reader.onload = function() {
            const olaTabel = [];
            const regels = reader.result.split('\n');
            // console.log(regels);
            for (const regel of regels) {
                olaVerwerken(olaTabel, csv(regel));
            }
            sessionStorage.setItem("OLA", JSON.stringify(olaTabel));
            html.zelfdePagina(); // TODO comment om te testen
        };
    });
}

const olaRegex = /(),|(\d*),|"([^"]*)",|([^,]*),/g;

/**
 * bovenstaande regular expression onderscheid kolommen geschieden door komma's
 * per kolom is er een groep met een komma
 * groep 0 is de complete match
 * groep 1 indien leeg
 * groep 2 indien getal
 * groep 3 indien tekst met "" (eventueel met komma's)
 * groep 4 indien tekst zonder ""
 *
 * Zie https://regex101.com/codegen?language=javascript
 *
 * csv verwerkt een regel tot kolommen met behulp van olaRegex
 * behalve de laatste kolom, want die heeft geen komma
 *
 * @param regel in csv
 * @returns {*[]} kolommen
 */

function csv(regel) {
    let kolommen = [];
    let m;
    while ((m = olaRegex.exec(regel)) !== null) {
        if (m.index === olaRegex.lastIndex) {
            olaRegex.lastIndex++; // This is necessary to avoid infinite loops with zero-width matches
        } else {
            m.forEach(function (match, groupIndex) {
                if (groupIndex === 1 && match !== undefined) {
                    kolommen.push("");
                } else if (groupIndex === 2 && match !== undefined) {
                    kolommen.push(Number(match));
                } else if (groupIndex === 3 && match !== undefined) {
                    kolommen.push(match);
                } else if (groupIndex === 4 && match !== undefined) {
                    kolommen.push(match);
                }
            });
        }
    }
    return kolommen;
}

const naamRegex = /(.*),.*\.\s(.*)\((.*)\)/;

/**
 * maak van de olaNaam een normaleNaam
 *
 * @param olaNaam uit Online Leden Administratie van KNSB
 * @returns {string|*} voorNaam tussenvoegsel achterNaam
 *
 * Diepen, P.J. van (Peter) -> Peter van Diepen
 * Bakker, J. (Jos) -> Jos Bakker
 * Meiden, D. van der (Dirk) -> Dirk van der Meiden
 * Horst, C.A. v.d. (Corné) -> Corné Horst (gaat fout wegens tussenvoegsel met punten!)
 *
 */
function normaleNaam(olaNaam) {
    let voornaam = "";
    let tussenvoegsel = "";
    let achternaam = "";
    let m;
    if ((m = naamRegex.exec(olaNaam)) !== null) {
        m.forEach(function (match, groupIndex) {
            if (groupIndex === 3) {
                voornaam = match;
            } else if (groupIndex === 2) {
                tussenvoegsel = match;
            } else if (groupIndex === 1) {
                achternaam = match;
            }
        });
        return `${voornaam} ${tussenvoegsel}${achternaam}`; // geen spatie tussen tussenvoegsel en achternaam!
    }
    return olaNaam;
}

/*
00 Relatienummer > knsbNummer
01 Volledige naam > voornaam, tussenvoegsel, achternaam
02 Geslacht > M of V
03 Geboortejaar
04 Categorie > S of J
05 Email
06 Telefoonnummer 1
07 Telefoonnummer 2
08 Adres > straat, huisNummer
09 Postcode
10 Plaatsnaam
11 Landnaam
12 Lidmaatschap
13 Lid sinds
14 Afgemeld per
15 KNSB-rating > knsbRating
16 FIDE-rating
17 Jeugdrating
18 Stappenniveau
19 Verlengingsdatum
20 Gebruik NAW
21 Beeldmateriaal (laatste kolom ontbreekt!)
 */
function olaVerwerken(olaTabel, kolom) {
    if ((typeof kolom[0]) === "number") {
        olaTabel.push({
            knsbNummer: kolom[0],
            olaNaam: kolom[1],
            naam: normaleNaam(kolom[1]),
            email: kolom[5],
            knsbRating: Number(kolom[15]) // indien "" dan 0
        });
    }
}