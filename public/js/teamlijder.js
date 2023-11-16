"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {perTeamRondenUitslagen} from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk teamleider=<teamCode>
 */
const teamleider = html.params.get("teamleider");

(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    const teams = (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return db.isTeam(team);
    });
    const teamCode = teamleider ? teamleider : teams[0].teamCode;
    await teamSelecteren(teams, teamCode);
    await uitslagenTeam(teams, teamCode, html.id("hoofdkop"), html.id("ronden"));

    // TODO overzicht uitslagen
    // TODO o_o_o.js: perTeamRondenUitslagen() aanpassen om toezeggingen, afzeggingen en weet-niets te tellen

    const wedstrijden = await zyq.localFetch(`/wedstrijden/${zyq.o_o_o.seizoen}`);
    const wedstrijdDatum = html.params.get("datum") || volgendeWedstrijdDatum(wedstrijden);
    datumSelecteren(wedstrijdDatum, wedstrijden);
    html.id("kop").innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + "overzicht voor teamlijders";
    await spelersOverzicht(wedstrijdDatum, wedstrijden, html.id("tabel"), html.id("tussenkop"), html.id("lijst"));
})();

// TODO zie o_o_o.js: teamSelecteren
function teamSelecteren(teams, teamCode) {
    const teamsSelectie = teams.map(function (team) {
        return [team.teamCode, zyq.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teamsSelectie, function (team) {
        html.zelfdePagina(`teamleider=${team}`);
    });
}

function volgendeWedstrijdDatum(wedstrijden) {
    const vandaag = zyq.datumSQL();
    let datum;
    for (const wedstrijd of wedstrijden) {
        datum = wedstrijd.datum;
        if (zyq.datumSQL(datum) >= vandaag) {
            return datum;
        }
    }
    return datum;
}

function datumSelecteren(wedstrijdDatum, wedstrijden) {
    const vandaag = zyq.datumSQL();
    const datums = wedstrijden.filter(function (wedstrijd) {
        return zyq.datumSQL(wedstrijd.datum) >= vandaag;
    }).map(function (wedstrijd) {
        return [wedstrijd.datum, zyq.datumLeesbaar(wedstrijd) + html.SCHEIDING + zyq.wedstrijdVoluit(wedstrijd)];
    });
    html.selectie(html.id("datumSelecteren"), wedstrijdDatum,datums, function (datum) {
        html.zelfdePagina(`datum=${datum}`);
    });
}

async function uitslagenTeam(teams, teamCode, kop, rondenTabel) {
    kop.innerHTML = `Overzicht voor teamleider ${html.SCHEIDING} ${zyq.teamVoluit(teamCode)}`;
    const rondeUitslagen = await perTeamRondenUitslagen(teamCode);
    console.log(rondeUitslagen);
    for (let rondeNummer = 1; rondeNummer < rondeUitslagen.length; ++rondeNummer) {
        uitslagenTeamPerRonde(rondeUitslagen[rondeNummer], rondeNummer, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datumKolom = zyq.datumLeesbaar(u.ronde);
        const uitslagKolom = zyq.uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.append(html.rij(u.ronde.rondeNummer, datumKolom, zyq.naarTeam(u.ronde), uitslagKolom));
        if (u.uitslagen.length) {
            /*
            const div = html.id("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
            div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datumKolom].join(html.SCHEIDING);
            const tabel = div.appendChild(document.createElement("table"));
            tabel.append(html.rij("", zyq.wedstrijdVoluit(u.ronde), "", uitslagKolom));
            for (let uitslag of u.uitslagen) {
                tabel.append(html.rij(uitslag.bordNummer, zyq.naarSpeler(uitslag), uitslag.witZwart, uitslag.resultaat));
            }
             */
        }
    }
}

async function spelersOverzicht(wedstrijdDatum, wedstrijden, tabel, tussenkop, lijst) {
    const spelers = await zyq.serverFetch(`/${zyq.uuidToken}/teamleider/${zyq.o_o_o.seizoen}/${zyq.datumSQL(wedstrijdDatum)}`);
    let nhsb = false;
    let aantalWedstrijden = 0;
    let wedstrijd = [];
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            nhsb = nhsb || w.teamCode.substring(0,1) === "n"; // KNSB en NHSB wedstrijden nooit op dezelfde dag!
            w.gevraagd = 0;
            w.toegezegd = 0;
            w.hoogsteRating = ratingInvaller(spelers, w.teamCode, nhsb);
            wedstrijd[aantalWedstrijden++] = w;
        }
    }
    tussenkop.innerHTML =
        `${nhsb ? "NHSB" : "KNSB"} wedstrijd${aantalWedstrijden > 1 ? "en" : ""} op ${zyq.datumLeesbaar({datum: wedstrijdDatum})}`;
    let vorigeSpeler = 0;
    for (const s of spelers) {
        const heeftToegezegd = s.partij === db.EXTERN_THUIS || s.partij === db.EXTERN_UIT; // heeft voor 1 team toegezegd
        let knsbVast = "";
        let nhsbVast = "";
        let invallerTeam = s.teamCode === null || s.teamCode === "" ? "" : s.teamCode === s.knsbTeam || s.teamCode === s.nhsbTeam ? "" : s.teamCode;
        let invaller = "";
        for (const w of wedstrijd) {
            const isGevraagd = s.knsbTeam === w.teamCode || s.nhsbTeam === w.teamCode || s.teamCode === w.teamCode; // is voor minstens 1 team gevraagd
            if (isGevraagd) {
                w.gevraagd++;
            }
            if (w.teamCode === s.teamCode) { // is voor deze wedstijd van dit team gevraagd
                if (heeftToegezegd) {
                    w.toegezegd++;
                    if (w.teamCode === s.knsbTeam) {
                        knsbVast = zyq.VINKJE;
                    } else if (w.teamCode === s.nhsbTeam) {
                        nhsbVast = zyq.VINKJE;
                    } else {
                        invaller = zyq.VINKJE;
                    }
                } else {
                    if (w.teamCode === s.knsbTeam) {
                        knsbVast = zyq.STREEP;
                    } else if (w.teamCode === s.nhsbTeam) {
                        nhsbVast = zyq.STREEP;
                    } else {
                        invaller = zyq.STREEP;
                    }
                }
            }
        }
        const nummer = s.knsbNummer > 1000000 ? s.knsbNummer : "";
        const invallerVragen =
            s.knsbNummer === vorigeSpeler ? zyq.teamVoluit(invallerTeam) + "  " : teamSelecterenOud(s, invallerTeam, wedstrijd, wedstrijdDatum);
        vorigeSpeler = s.knsbNummer;
        tabel.append(html.rij(zyq.naarSpeler(s), nummer, s.knsbRating, s.knsbTeam, knsbVast, s.nhsbTeam, nhsbVast, invallerVragen, invaller));
    }
    for (const w of wedstrijd) {
        lijst.append(html.rij(zyq.wedstrijdVoluit(w), w.naam, w.gevraagd, w.toegezegd, w.borden === w.toegezegd ? zyq.VINKJE : zyq.STREEP));
    }
}

function ratingInvaller(spelers, teamCode, nhsb) {
    for (const s of spelers) {
        if (nhsb && s.nhsbTeam === teamCode) {
            return s.knsbRating + 80;
        } else if (s.knsbTeam === teamCode) {
            return s.knsbRating + 40;
        }
    }
    return 3000; // hoogste rating indien team zonder vaste spelers
}

function teamSelecterenOud(speler, invallerTeam, wedstrijd, wedstrijdDatum) {
    let wedstrijdNummer = -1; // geen wedstrijd;
    let invallerMogelijkheden = 0;
    const teams = invallerTeam === "" ? [[-1, ""]] : [];
    for (let i = 0; i < wedstrijd.length; i++) {
        if (wedstrijd[i].teamCode === invallerTeam) {
            wedstrijdNummer = i;
        }
        if (speler.knsbTeam !== wedstrijd[i].teamCode &&
            speler.nhsbTeam !== wedstrijd[i].teamCode &&
            speler.knsbRating < wedstrijd[i].hoogsteRating) {
            invallerMogelijkheden++;
            teams.push([i, zyq.teamVoluit(wedstrijd[i].teamCode)]);
        }
    }
    if (invallerMogelijkheden === 0) {
        return invallerTeam;
    } else {
        const knop = document.createElement("select");
        html.selectie(knop, wedstrijdNummer, teams, async function (geselecteerdeTeam) {
            const team = wedstrijd[geselecteerdeTeam].teamCode;
            const ronde = wedstrijd[geselecteerdeTeam].rondeNummer;
            const datum = zyq.datumSQL(wedstrijdDatum);
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/uitslag/toevoegen/${zyq.o_o_o.seizoen}/${team}/${ronde}/${speler.knsbNummer}/${db.PLANNING}/${datum}/int`);
            html.zelfdePagina(`datum=${wedstrijdDatum}&wedstrijd=${geselecteerdeTeam}`);
        });
        return knop;
    }
}