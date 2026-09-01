"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, vinkjeInvullen, perTeamRondenUitslagen } from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk teamleden=<teamCode>
           &invaller=<knsbNummer>
 */
const teamleden = html.params.get("teamleden"); // teamCode geselecteerde team
const invaller = Number(html.params.get("invaller")); // knsbNummer

(async function() {
    await init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    const teams = (await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isTeam(team);
    });
    const spelers = await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teamleden`);
    const teamCode = teamleden ? teamleden : teamVoorkeur(spelers, zyq.gebruiker.knsbNummer);
    teamSelecteren(teams, teamCode);
    const geenPlanning = !(
        zyq.gebruiker.mutatieRechten >= db.TEAMLEIDER || // bestuur of teamleider
        teamCode === teamVoorkeur(spelers, zyq.gebruiker.knsbNummer, "0")); // eigen team
    const ronden = await perTeamRondenUitslagen(teamCode);
    console.log(ronden); // TODO verwijderen
    uitslagenTeam(ronden, teamCode, html.id("hoofdkop"), html.id("ronden"));
    const nhsbTeam = teamCode.substring(0,1) === "n"; // anders is het een KNSB-team
    const vast = html.id("vast"); // Vaste spelers en invallers
    vast.append(html.bovenRij("naam", "nummer", "rating", "team", ...(rondeNummers(ronden))));
    const vasteSpelers = spelers.filter(function (speler) {
        return speler.knsbTeam === teamCode || speler.nhsbTeam === teamCode
            || isInvaller(speler.knsbNummer, ronden);
    });
    for (const speler of vasteSpelers) {
        const team = nhsbTeam ? speler.nhsbTeam : speler.knsbTeam;
        const link = zyq.naarSpeler(speler);
        html.verwerkt(link,speler.knsbNummer === invaller);
        vast.append(html.rij(link,
            speler.knsbNummer,
            speler.knsbRating,
            team,
            ...(rondenPerSpeler(speler.knsbNummer, ronden, geenPlanning))));
    }
    const inval = html.id("invallers"); // Invallers door teamleider
    const hoogsteRating = hoogsteRatingInvaller(spelers, teamCode, nhsbTeam);
    const invallers = spelers.filter(function (speler) {
        return speler.knsbNummer > db.KNSB_NUMMER
            && speler.knsbRating < hoogsteRating
            && !hogerTeam(teamCode, nhsbTeam ? speler.nhsbTeam : speler.knsbTeam);
        // TODO niet meer dan 3 x invallen in hoger team
    });
    const wedstrijden = wedstrijdenLijst(ronden);
    for (const speler of invallers) {
        const team = nhsbTeam ? speler.nhsbTeam : speler.knsbTeam;
        const invallen = wedstrijden.filter(function (wedstrijd) {
            return nietGevraagd(speler.knsbNummer, ronden, wedstrijd[0]);
        });
        if (invallen.length > 0) {
            const knop = document.createElement("select");
            html.selectie(knop, 0, invallen, async function (rondeNummer){
                /* TODO herstellen
                const datum = zyq.datumSQL(ronden[rondeNummer].ronde.datum);
                const mutaties = await zyq.serverFetch(
                    `/${zyq.uuidToken}/${db.key(ronden[rondeNummer].ronde)}/${speler.knsbNummer}/uitslag/toevoegen/${db.MEEDOEN}/${datum}/int`);
                html.zelfdePagina(`teamleden=${teamCode}&invaller=${speler.knsbNummer}`);
                 */
                html.zelfdePagina(`teamleden=${teamVoorkeur(spelers, speler.knsbNummer)}&invaller=${speler.knsbNummer}`);
            });
            inval.append(html.rij(zyq.naarSpeler(speler), speler.knsbNummer, speler.knsbRating, team, knop));
        }
    }
})();

// TODO naar tabel speler verplaatsen
const teamLeiders = new Map([
    ["1", 7970094], // Danny de Ruiter
    ["2", 7129991], // Gerard de Geus
    ["3", 6420557], // Jasper Seelemeijer
    ["4", 6212404], // Peter van Diepen
    ["5", 9077651], // Lennart van der Kraan
    ["n1", 7129991], // Gerard de Geus
    ["n2", 7758014], // Alex Albrecht
    ["n3", 6565801], // Ernst Hoogenes
    ["n4", 8485059], // Peter Duijs
    ["n5", 7321534], // Ronald Kamps
    ["v1", 8950876]]); // Jos Albers

const andereTeamLeden = new Map([
    [8587337, {knsbTeam: "2"}], // Max Hooijmans
    [6930957, {knsbTeam: "3"}], // Leo van Steenoven
    [7292043, {knsbTeam: "3"}], // Rob Freer
    [7443172, {knsbTeam: "4"}], // Anton Schermer
    [6214153, {knsbTeam: "4"}], // Jan Poland
    [8882038, {knsbTeam: "5"}], // Sverre van de Bruinhorst
    [9040801, {knsbTeam: "5"}]]); // Marcello van 't Veen

function teamVoorkeur(spelers, gebruiker, anders = "1") { // anders eerste team
    if (andereTeamLeden.has(gebruiker)) {
        return andereTeamLeden.get(gebruiker).knsbTeam || andereTeamLeden.get(gebruiker).nhsbTeam || anders;
    }
    for (const speler of spelers) {
        if (gebruiker === speler.knsbNummer) {
            return speler.knsbTeam || speler.nhsbTeam || anders;
        }
    }
    return anders;
}

// TODO zie o_o_o.js: teamSelecteren
function teamSelecteren(teams, teamCode) {
    const teamsSelectie = teams.map(function (team) {
        return [team.teamCode, db.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teamsSelectie, function (team) {
        html.zelfdePagina(`teamleden=${team}`);
    });
}

function uitslagenTeam(ronden, teamCode, kop, rondenTabel) {
    kop.textContent = `Overzicht voor teamleider ${html.SCHEIDING} ${db.teamVoluit(teamCode)}`;
    for (let rondeNummer = 1; rondeNummer < ronden.length; ++rondeNummer) {
        const uitslag = ronden[rondeNummer];
        if (uitslag) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
            const datumKolom = zyq.datumLeesbaar(uitslag.ronde);
            const uitslagKolom = zyq.uitslagTeam(uitslag.ronde.uithuis, uitslag.winst, uitslag.verlies, uitslag.remise);
            rondenTabel.append(html.rij(uitslag.ronde.rondeNummer, datumKolom, zyq.naarTeam(uitslag.ronde), uitslagKolom));
        }
    }
}

function rondeNummers(ronden) {
    const nummers = [];
    for (const ronde of ronden) {
        if (ronde) {
            nummers.push(ronde.ronde.rondeNummer);
        }
    }
    return nummers;
}

// TODO uit tabel speler
function hoogsteRatingInvaller(spelers, teamCode, nhsbTeam) {
    if (teamCode === "2") { // 40 + 2103 Nico Hauwert
        return 2143;
    } else if (teamCode === "3") { // 40 + 1963 Fabio Pasti
        return 2003;
    } else if (teamCode === "4") { // 40 + 1823 Leonard Haakman
        return 1863;
    } else if (teamCode === "5") { // 40 + 1662 John Norder
        return 1703;
    } else if (teamCode === "nbb") { // NHSB beker (brons)
        return 1750;
    } else if (teamCode === "nbz") { // NHSB beker (zilver)
        return 1950;
    } else if (teamCode === "n2") { // 80 + 1937 Henk van der Hauw
        return 2117;
    } else if (teamCode === "n3") { // 80 + 1864 Leo van Steenoven
        return 1944;
    } else if (teamCode === "n4") { // 80 + 1802 Jan Meringa
        return 1882;
    } else if (teamCode === "n5") { // 80 + 1752 Theo Bakker
        return 1832;
    } else if (teamCode === "nv1") { // 80 + 1627 Theo de Bruijn
        return 1707;
    } else if (teamCode === "nv2") { // 80 + 1520 Marcello van 't Veen
        return 1600;
    } else {
        return 3000;
    }
}

function isInvaller(knsbNummer, ronden) {
    for (const ronde of ronden) {
        if (ronde) {
            for (const uitslag of ronde.uitslagen) {
                if (uitslag.knsbNummer  === knsbNummer && uitslag.partij === db.EXTERNE_PARTIJ) {
                    return true; // was invaller
                }
            }
            for (const geplandeUitslag of ronde.geplandeUitslagen) {
                if (geplandeUitslag.knsbNummer  === knsbNummer) {
                    return true; // geplande invaller
                }
            }
        }
    }
    return false;
}

function nietGevraagd(knsbNummer, ronden, rondeNummer) {
    if (rondeNummer) {
        for (const geplandeUitslag of ronden[rondeNummer].geplandeUitslagen) {
            if (geplandeUitslag.knsbNummer  === knsbNummer) {
                return false; // geplande invaller
            }
        }
    }
    return true;
}

function rondenPerSpeler(knsbNummer, ronden, geenPlanning) {
    const uitslagen = [];
    for (const ronde of ronden) {
        if (ronde) {
            const uitslag = ronde.uitslagen.find(function (u) {
                return u.knsbNummer === knsbNummer;
            });
            if (uitslag) {
                uitslagen.push(`${uitslag.bordNummer}${uitslag.witZwart} ${uitslag.resultaat}`);
            } else if (geenPlanning) {
                uitslagen.push("");
            } else {
                const geplandeUitslag = ronde.geplandeUitslagen.find(function (u) {
                    return u.knsbNummer === knsbNummer;
                });
                if (geplandeUitslag) {
                    uitslagen.push(vinkjeInvullen.get(geplandeUitslag.partij));
                } else {
                    uitslagen.push("");
                }
            }
        }
    }
    return uitslagen;
}

function hogerTeam(teamCode, vasteTeam) {
    if (vasteTeam === "" || teamCode.substring(1,2) === "b") {
        return false; // indien geen vastTeam of beker
    } else if (vasteTeam.substring(0,2) !== "nv" && teamCode.substring(0,2) === "nv") {
        return true; // niet viertal is hogerTeam dan viertal
    } else {
        return teamCode >= vasteTeam; // hogerTeam heeft lager nummer en in vallen voor vasteTeam mag ook niet
    }
}

function wedstrijdenLijst(ronden) {
    const lijst = [[0, ""]];
    for (const ronde of ronden) {
        if (ronde && ronde.uitslagen.length < 1) {
            lijst.push([ronde.ronde.rondeNummer, ronde.ronde.tegenstander]);
        }
    }
    return lijst;
}
