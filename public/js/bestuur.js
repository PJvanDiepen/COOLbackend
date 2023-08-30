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
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await ledenLijst(
        Number(html.params.get("lid")),
        document.getElementById("kop"),
        document.getElementById("competities"),
        document.getElementById("tabel"));
    await alleRatinglijsten(document.getElementById("ratinglijsten"));
    await leesRatinglijst(document.getElementById("csvFile"), document.getElementById("csvInfo"));
})();

async function ledenLijst(lidNummer, kop, competities, tabel) {
    kop.innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + "overzicht voor bestuur";
    const personen = await zyq.serverFetch(`/personen/${zyq.o_o_o.seizoen}`);
    competities.append(html.rij("personen in 0-0-0", "", personen.length - 11)); // aantal personen zonder onbekend en 10 x niemand
    const tijdelijkNummer = await zyq.serverFetch(`/nummer`); // vanaf 100
    tabel.append(html.rij(
        html.naarPagina(`lid.html?lid=${tijdelijkNummer}`, "----- iemand toevoegen -----"), // TODO verplaatsen naar start.js
        tijdelijkNummer, // knsbNummer
        "", // knsbRating
        "", // eventueel interne rating
        "", // knsbTeam
        "", // nhsbTeam
        "", // competities
        "")); // functie
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
            tabel.append(html.rij(
                link,
                knsbNummer > 1000000 ? knsbNummer : "",
                lid.knsbRating === null ? "" : lid.knsbRating,
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

async function alleRatinglijsten(lijst) {
    const lijsten = await zyq.serverFetch(`/rating/lijsten`);
    const ratingJaar = [];
    for (const lijst of lijsten) {
        const {maand, jaar} = lijst;
        ratingJaar[Number(maand)] = Number(jaar);
    }
    const datum = new Date();
    const ditJaar = datum.getFullYear();
    const dezeMaand = datum.getMonth() + 1;
    for (let i = 12; i > 0; i--) {
        const maand = (i + dezeMaand) > 12 ? (i + dezeMaand) - 12: (i + dezeMaand);
        const jaar = (i + dezeMaand) > 12 ? ditJaar : ditJaar - 1;
        const juisteJaar = ratingJaar[maand] === jaar;
        const naam = `${jaar}-${voorloopNul(maand)}-KNSB`;
        lijst.append(html.rij(html.naarPaginaEnTerug(
            `https://schaakbond.nl/wp-content/uploads/${jaar}/${voorloopNul(maand)}/${naam}.zip`,
            `Ratinglijst 1 ${db.maandInvullen.get(maand)} ${jaar}`),
            juisteJaar ? "" : `${naam}.zip`,
            juisteJaar ? "" : `${naam}.csv`,
            juisteJaar ? html.VINKJE : html.KRUISJE));
        ratinglijstMaandJaarInvullen.set(`${naam}.csv`, [maand, jaar]);
    }
}

/*
Zie Matt Frisbie: Professional JavaScript for Web Developers blz. 760
 */
async function leesRatinglijst(filesList, output) {
    filesList.addEventListener("change", function (event) {
        const files = event.target.files;
        if (!ratinglijstMaandJaarInvullen.has(files[0].name)) {
            output.innerText += `\n${files[0].name} is geen ratinglijst.`;
        } else {
            const [maand, jaar] = ratinglijstMaandJaarInvullen.get(files[0].name);
            output.innerText += `\n${files[0].name} verwerken met maand = ${maand} en jaar = ${jaar}.`;
            const reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onerror = function() {
                output.innerText += `\n${files[0].name} lezen gaat fout met code: ${reader.error.code}.`;
            };
            reader.onload = async function() {
                const regels = reader.result.split('\r\n');
                if (regels.shift() === "Relatienummer;Naam;Titel;FED;Rating;Nv;Geboren;S" && regels.pop() === "") { // zonder eerste en laatste regel
                    const verwijderd = await zyq.serverFetch(`/${zyq.uuidToken}/rating/verwijderen/${maand}`);
                    const toevoegen = regels.length;
                    output.innerText += `\nDe ratinglijst van ${db.maandInvullen.get(maand)} had ${verwijderd} en krijgt ${toevoegen} KNSB leden.`;
                    for (const regel of regels) {
                        await zyq.serverFetch(`/${zyq.uuidToken}/rating/toevoegen/${maand}/${jaar}/${regel}`);
                    }
                    html.zelfdePagina();
                } else {
                    output.innerText += `\n${files[0].name} bevat geen ratinglijst.`;
                }
            };
        }
    });
}