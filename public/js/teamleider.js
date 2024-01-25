"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {vinkjeInvullen, perTeamRondenUitslagen} from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk teamleider=<teamCode>
           &invaller=<knsbNummer>
 */
const teamleider = html.params.get("teamleider"); // teamCode
const invaller = Number(html.params.get("invaller")); // knsbNummer

(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    const teams = (await zyq.serverFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return db.isTeam(team);
    });
    const teamCode = teamleider ? teamleider : teamVoorkeur(teams, zyq.gebruiker.knsbNummer);
    await teamSelecteren(teams, teamCode);
    const ronden = await uitslagenTeam(teams, teamCode, html.id("hoofdkop"), html.id("ronden"));
    const spelers = await zyq.serverFetch(`/teamleider/${zyq.o_o_o.seizoen}`);
    const nhsbTeam = teamCode.substring(0,1) === "n"; // anders is het een KNSB-team
    const hoogsteRating = hoogsteRatingInvaller(spelers, teamCode, nhsbTeam);
    const vast = html.id("vast");
    vast.append(html.bovenRij("naam", "nummer", "rating", "team", ...(rondeNummers(ronden))));
    const vasteSpelers = spelers.filter(function (speler) {
        return speler.knsbTeam === teamCode || speler.nhsbTeam === teamCode
            || isInvaller(speler.knsbNummer, ronden);
    })
    for (const speler of vasteSpelers) {
        const team = nhsbTeam ? speler.nhsbTeam : speler.knsbTeam;
        const link = zyq.naarSpeler(speler);
        html.verwerkt(link,speler.knsbNummer === invaller);
        vast.append(html.rij(link,
            speler.knsbNummer,
            speler.knsbRating,
            team,
            ...(rondenPerSpeler(speler.knsbNummer, ronden))));
    }
    const teamGegevens = teams.find(function (team) {
        return team.teamCode === teamCode;
    });
    html.id("vragen").textContent = `Invallers vragen door ${teamGegevens.naam}`;
    const inval = html.id("invallers");
    const invallers = spelers.filter(function (speler) {
        return speler.knsbNummer > db.KNSB_NUMMER
            && speler.knsbRating < hoogsteRating
            && !hogerTeam(teamCode, nhsbTeam ? speler.nhsbTeam : speler.knsbTeam)
            && !jeugdCompetitie(speler);
        // TODO niet meer dan 3 x invallen in hoger team
    });
    const wedstrijden = wedstrijdenLijst(ronden);
    for (const speler of invallers) {
        const team = nhsbTeam ? speler.nhsbTeam : speler.knsbTeam;
        const invallen = wedstrijden.filter(function (wedstrijd) {
            return nietGevraagd(speler.knsbNummer, ronden, wedstrijd[0]);
        });
        const knop = document.createElement("select");
        html.selectie(knop, 0, invallen, async function (rondeNummer){
            const datum = zyq.datumSQL(ronden[rondeNummer].ronde.datum);
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/uitslag/toevoegen/${zyq.o_o_o.seizoen}/${teamCode}/${rondeNummer}/${speler.knsbNummer}/${db.PLANNING}/${datum}/int`);
            html.zelfdePagina(`teamleider=${teamCode}&invaller=${speler.knsbNummer}`);
        });
        inval.append(html.rij(zyq.naarSpeler(speler),
            speler.knsbNummer,
            speler.knsbRating,
            team,
            knop));
    }
})();

function teamVoorkeur(teams, teamleider) {
    for (const team of teams) {
        if (team.teamleider === teamleider) { // dit team indien de gebruiker is teamleider van dit team
            return team.teamCode;
        }
    }
    return teams[0].teamCode; // anders eerste team uit lijst
}

// TODO zie o_o_o.js: teamSelecteren
function teamSelecteren(teams, teamCode) {
    const teamsSelectie = teams.map(function (team) {
        return [team.teamCode, zyq.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teamsSelectie, function (team) {
        html.zelfdePagina(`teamleider=${team}`);
    });
}

async function uitslagenTeam(teams, teamCode, kop, rondenTabel) {
    kop.textContent = `Overzicht voor teamleider ${html.SCHEIDING} ${zyq.teamVoluit(teamCode)}`;
    const rondeUitslagen = await perTeamRondenUitslagen(teamCode);
    for (let rondeNummer = 1; rondeNummer < rondeUitslagen.length; ++rondeNummer) {
        uitslagenTeamPerRonde(rondeUitslagen[rondeNummer], rondeNummer, rondenTabel);
    }
    return rondeUitslagen;
}

function uitslagenTeamPerRonde(uitslag, rondeNummer, rondenTabel) {
    if (uitslag) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datumKolom = zyq.datumLeesbaar(uitslag.ronde);
        const uitslagKolom = zyq.uitslagTeam(uitslag.ronde.uithuis, uitslag.winst, uitslag.verlies, uitslag.remise);
        rondenTabel.append(html.rij(uitslag.ronde.rondeNummer, datumKolom, zyq.naarTeam(uitslag.ronde), uitslagKolom));
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

function hoogsteRatingInvaller(spelers, teamCode, nhsbTeam) {
    for (const speler of spelers) {
        if (nhsbTeam && speler.nhsbTeam === teamCode) {
            return speler.knsbRating + 80; // NHSB reglement artikel 20
        } else if (speler.knsbTeam === teamCode) {
            return speler.knsbRating + 40; // KNSB reglement artikel 13.2
        }
    }
    if (teamCode === "nbb") { // NHSB beker (brons)
        return 1600;
    } else if (teamCode === "nbz") { // NHSB beker (zilver)
        return 1900;
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

function rondenPerSpeler(knsbNummer, ronden) {
    const uitslagen = [];
    for (const ronde of ronden) {
        if (ronde) {
            const uitslag = ronde.uitslagen.find(function (u) {
                return u.knsbNummer === knsbNummer;
            });
            if (uitslag) {
                uitslagen.push(`${uitslag.bordNummer}${uitslag.witZwart} ${uitslag.resultaat}`);
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

function hogerTeam(teamCode, vastTeam) {
    if (vastTeam === "" || teamCode.substring(1,2) === "b") {
        return false; // indien geen vastTeam of beker
    } else if (vastTeam.substring(0,2) !== "nv" && teamCode.substring(0,2) === "nv") {
        return true; // niet viertal is hogerTeam dan viertal
    } else {
        return teamCode > vastTeam; // hogerTeam heeft lager nummer
    }
}

function jeugdCompetitie(speler) {
    return speler.intern1 === db.JEUGD_COMPETITIE || speler.intern1 === db.JEUGD_COMPETITIE_VOORJAAR ||
           speler.intern2 === db.JEUGD_COMPETITIE || speler.intern1 === db.JEUGD_COMPETITIE_VOORJAAR ||
           speler.intern3 === db.JEUGD_COMPETITIE || speler.intern1 === db.JEUGD_COMPETITIE_VOORJAAR ||
           speler.intern4 === db.JEUGD_COMPETITIE || speler.intern1 === db.JEUGD_COMPETITIE_VOORJAAR ||
           speler.intern1 === db.JEUGD_COMPETITIE || speler.intern5 === db.JEUGD_COMPETITIE_VOORJAAR;
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