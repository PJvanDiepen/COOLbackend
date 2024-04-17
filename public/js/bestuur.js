"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk lid=<knsbNummer>
         of leden=<teamCode> alle leden of selectie
 */
const ratinglijstMaandJaarInvullen = new Map([]); // [naam CSV-bestand, [maand, jaar]]

(async function() {
    await zyq.init();
    const personen = await zyq.serverFetch(`/personen/${zyq.o_o_o.seizoen}`);
    await html.menu(zyq.gebruiker.mutatieRechten,
        [db.ONTWIKKElAAR, "speler conversie", async function() {
            let mutaties = 0;
            const jaar = 2000 + Number(zyq.o_o_o.seizoen.substring(0, 2));
            for (const speler of personen) {
                if (speler.knsbNummer > db.KNSB_NUMMER && speler.knsbRating && speler.interneRating) {
                    const rating = await zyq.serverFetch(`/rating/9/${speler.knsbNummer}`); // 1 september
                    if (rating) {
                        const uuid = zyq.uuidToken;
                        const seizoen = zyq.o_o_o.seizoen;
                        const knsbNummer = speler.knsbNummer;
                        const knsbRating = rating.knsbRating;
                        const interneRating = Math.max(speler.interneRating, knsbRating);
                        await zyq.serverFetch(
                            `/${uuid}/rating/wijzigen/${seizoen}/${knsbNummer}/${knsbRating}/${interneRating}/${jaar}-09-01`);
                        mutaties++;
                    }
                }
            }
            console.log({mutaties});
        }]);
    html.id("kop").textContent =
        `${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}${html.SCHEIDING}overzicht voor bestuur`;
    await ledenLijst(
        personen,
        Number(html.params.get("lid")),
        html.id("competities"),
        html.id("tabel"),
        html.params.get("leden"));
    await alleRatinglijsten(html.id("ratinglijsten"));
    await leesRatinglijst(html.id("csvFile"), html.id("informeer"));
})();

async function ledenLijst(personen, lidNummer, competities, lijst, leden) {
    competities.append(html.rij("personen in 0-0-0", "", personen.length - 11)); // aantal personen zonder onbekend en 10 x niemand
    lijst.append(html.rij(
        html.naarPagina(`aanmelden.html`, "----- iemand toevoegen -----"),
        "", // knsbNummer
        "", // knsbRating
        "", // eventueel interne rating
        "", // knsbTeam
        "", // nhsbTeam
        "", // competities
        "")); // functie
    let aantalGebruikers = 0;
    let aantalPerTeam = {};
    const teams = await zyq.localFetch(`/${zyq.o_o_o.clubCode}/${zyq.o_o_o.seizoen}/teams`); // competities en teams
    for (const team of teams) {
        if (db.isCompetitie(team) || db.isTeam(team)) {
            aantalPerTeam[team.teamCode] = 0;
        }
    }
    for (const lid of personen) {
        let lidInLijst = leden ? leden === "alle" : true;
        const knsbNummer = Number(lid.knsbNummer);
        if (knsbNummer > 100) {
            if (lid.mutatieRechten !== null) {
                aantalGebruikers++;
            }
            if (lid.knsbTeam !== null && lid.knsbTeam) {
                aantalPerTeam[lid.knsbTeam]++;
                lidInLijst = lidInLijst || leden === lid.knsbTeam;
            }
            if (lid.nhsbTeam !== null && lid.nhsbTeam) {
                aantalPerTeam[lid.nhsbTeam]++;
                lidInLijst = lidInLijst || leden === lid.nhsbTeam;
            }
            if (lid.intern1 !== null &&  lid.intern1) {
                aantalPerTeam[lid.intern1]++;
                lidInLijst = lidInLijst || leden === lid.intern1;
            }
            if (lid.intern2 !== null &&  lid.intern2) {
                aantalPerTeam[lid.intern2]++;
                lidInLijst = lidInLijst || leden === lid.intern2;
            }
            if (lid.intern3 !== null &&  lid.intern3) {
                aantalPerTeam[lid.intern3]++;
                lidInLijst = lidInLijst || leden === lid.intern3;
            }
            if (lid.intern4 !== null &&  lid.intern4) {
                aantalPerTeam[lid.intern4]++;
                lidInLijst = lidInLijst || leden === lid.intern4;
            }
            if (lid.intern5 !== null &&  lid.intern5) {
                aantalPerTeam[lid.intern5]++;
                lidInLijst = lidInLijst || leden === lid.intern5;
            }
            if (lidInLijst) {
                const link = html.naarPagina(`lid.html?lid=${knsbNummer}`, lid.naam);
                html.verwerkt(link,knsbNummer === lidNummer);
                lijst.append(html.rij(
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
    }
    competities.append(html.rij("gebruikers van 0-0-0", "", aantalGebruikers));
    competities.append(html.rij("----- competitie of team toevoegen -----", "")); // TODO naar competitie.html
    for (const team of teams) {
        if (db.isCompetitie(team) || db.isTeam(team)) {
            const link = html.naarPagina(
                `bestuur.html?leden=${team.teamCode === leden ? "alle": team.teamCode}`,
                zyq.teamVoluit(team.teamCode));
            html.verwerkt(link,team.teamCode === leden);
            competities.append(html.rij(link, team.teamCode, aantalPerTeam[team.teamCode]));
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
        const naam = `${jaar}-${zyq.voorloopNul(maand)}-KNSB`;
        lijst.append(html.rij(html.naarPaginaEnTerug(
            `https://schaakbond.nl/wp-content/uploads/${jaar}/${zyq.voorloopNul(maand)}/${naam}.zip`,
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
            html.tekstToevoegen(output, `\n${files[0].name} is geen ratinglijst.`);
        } else {
            const [maand, jaar] = ratinglijstMaandJaarInvullen.get(files[0].name);
            html.tekstToevoegen(output, `\n${files[0].name} verwerken met maand = ${maand} en jaar = ${jaar}.`);
            const reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onerror = function() {
                html.tekstToevoegen(output, `\n${files[0].name} lezen gaat fout met code: ${reader.error.code}.`);
            };
            reader.onload = async function() {
                const regels = reader.result.split('\r\n');
                if (regels.shift() === "Relatienummer;Naam;Titel;FED;Rating;Nv;Geboren;S" && regels.pop() === "") { // zonder eerste en laatste regel
                    const verwijderd = await zyq.serverFetch(`/${zyq.uuidToken}/rating/verwijderen/${maand}`);
                    const toevoegen = regels.length;
                    html.tekstToevoegen(output, `\nDe ratinglijst van ${db.maandInvullen.get(maand)} had ${verwijderd} en krijgt ${toevoegen} KNSB leden.`);
                    for (const regel of regels) {
                        await zyq.serverFetch(`/${zyq.uuidToken}/rating/toevoegen/${maand}/${jaar}/${regel}`);
                    }
                    html.zelfdePagina();
                } else {
                    html.tekstToevoegen(output, `\n${files[0].name} heeft niet de juiste naam of bevat geen ratinglijst.`);
                }
            };
        }
    });
}