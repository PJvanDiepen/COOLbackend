"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */
(async function() {
    await zyq.init();
    zyq.competitieTitel();
    zyq.o_o_o.team = zyq.o_o_o.competitie;
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
    zyq.menu([db.BEHEERDER, `ranglijst na ronde ${rondeNummer}`, function() {
            html.anderePagina(`ranglijst.html?ronde=${rondeNummer}`);
        }],
        [db.BEHEERDER, `ronde ${rondeNummer} opnieuw indelen`, function () {
            html.anderePagina(`indelen.html?ronde=${rondeNummer}`);
        }],
        [db.BEHEERDER, `ranglijst ${zyq.ditSeizoen} opnieuw verwerken`, function () {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${zyq.ditSeizoen}`)) {
                    sessionStorage.removeItem(key);
                }
            }
        }],
        [db.ONTWIKKElAAR, `backup uitslagen ronde ${rondeNummer}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/ronde/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.team}/${rondeNummer}/${rondeNummer}`);
            zyq.backupSQL("uitslag", rijen);
        }],
        [db.WEDSTRIJDLEIDER, `verwijder indeling ronde ${rondeNummer}`, async function () {
            const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/verwijder/indeling/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}`);
            if (mutaties) {
                sessionStorage.removeItem(`/ronde/${zyq.o_o_o.seizoen}/${rondeNummer}`);  // TODO ranglijst weggooien
                html.anderePagina(`ronde.html?ronde=${rondeNummer}`);
            }
        }],
        [db.BEHEERDER, `wijzig ronde ${rondeNummer}`, async function () {
            html.anderePagina(`wijzig.html?ronde=${rondeNummer}`);
        }],
        [db.BEHEERDER, `verwijder ronde ${rondeNummer} (pas op!)`, async function () {
            const mutaties = await zyq.serverFetch(`/${zyq.uuidToken}/verwijder/ronde/${zyq.o_o_o.seizoen}/int/${rondeNummer}`);
        }]);
    zyq.rondeSelecteren(zyq.o_o_o.competitie, rondeNummer);
    await uitslagenRonde(rondeNummer, document.getElementById("uitslagen"));
    await wedstrijdenBijRonde(rondeNummer, document.getElementById("wedstrijden"));
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + html.SCHEIDING + zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer]);
    if (zyq.o_o_o.competitie === zyq.INTERNE_COMPETITIE) {
        document.getElementById("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

/*
  -- uitslagen interne competitie per ronde
  select
      uitslag.bordNummer,
      uitslag.knsbNummer,
      wit.naam,
      uitslag.tegenstanderNummer,
      zwart.naam,
      uitslag.resultaat
  from uitslag
  join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
  join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer
  where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
  order by uitslag.seizoen, uitslag.bordNummer;
 */
async function uitslagenRonde(rondeNummer, lijst) {
    const gewijzigd = await uitslagMutatie(rondeNummer);
    const uitslagen = await zyq.serverFetch(`/ronde/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}`); // actuele situatie
    if (uitslagen.length > 0) {
        for (const uitslag of uitslagen) {
            const uitslagKolom = uitslagVerwerken(rondeNummer, uitslag);
            html.rij(uitslagKolom, uitslag.knsbNummer === gewijzigd.wit && uitslag.tegenstanderNummer === gewijzigd.zwart);
            lijst.append(html.rij(
                uitslag.bordNummer,
                zyq.naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                uitslagKolom));
        }
    } else {
        lijst.append(html.rij("nog", "geen", "uitslagen", ""));
    }
}

/*
    verwerk &ronde=<rondeNummer>&wit=<wit>&zwart=<zwart>&uitslag=<uitslag>
 */
async function uitslagMutatie(rondeNummer) {
    const wit = html.params.get("wit");
    const zwart = html.params.get("zwart");
    const uitslag = html.params.get("uitslag");
    if (wit && zwart && uitslag) {
        const mutaties = await zyq.serverFetch(
            `/${zyq.uuidToken}/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}/${wit}/${zwart}/${uitslag}`);
        if (mutaties > 0) {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${zyq.o_o_o.seizoen}`) ||
                    key.startsWith(`/uitslagen/${zyq.o_o_o.seizoen}`)) {
                    sessionStorage.removeItem(key);
                }
            }
        }
    }
    return {"wit": Number(wit), "zwart": Number(zwart)};
}

function uitslagVerwerken(rondeNummer, uitslag) {
    if (uitslagWijzigen(uitslag)) {
        return uitslagSelecteren(rondeNummer, uitslag)
    } else if (uitslag.resultaat === db.WINST) {
        return "1-0";
    } else if (uitslag.resultaat === db.REMISE) {
        return "½-½";
    } else if (uitslag.resultaat === db.VERLIES) {
        return "0-1";
    } else {
        return "";
    }
}

function uitslagWijzigen(uitslag)  {
    if (zyq.o_o_o.seizoen !== zyq.ditSeizoen) { // vorig seizoen nooit wijzigen
        return false;
    } else if (zyq.gebruiker.mutatieRechten >= db.WEDSTRIJDLEIDER) {
        return true;
    } else if (zyq.gebruiker.mutatieRechten >= db.GEREGISTREERD && uitslag.resultaat === "") {
        return uitslag.knsbNummer === gebruiker.knsbNummer || uitslag.tegenstanderNummer === gebruiker.knsbNummer;
    } else {
        return false;
    }
}

// TODO html.selectie toepassen
function uitslagSelecteren(rondeNummer, uitslag) {
    const select = document.createElement("select");
    select.append(html.optie(db.WINST, "1-0"));
    select.append(html.optie(db.REMISE, "½-½"));
    select.append(html.optie(db.VERLIES, "0-1"));
    select.value = uitslag.resultaat;
    select.addEventListener("input",function () {
        html.zelfdePagina(
            `ronde=${rondeNummer}&wit=${uitslag.knsbNummer}&zwart=${uitslag.tegenstanderNummer}&uitslag=${select.value}`);
    });
    return select;
}

async function wedstrijdenBijRonde(rondeNummer, lijst) {
    if (rondeNummer > 1) {
        lijst.append(rondeInterneCompetitie(rondeNummer - 1)); // vorige ronde
    }
    if (zyq.o_o_o.competitie === db.INTERNE_COMPETITIE) { // wedstrijden die meetellen voor de interne competitie
        const wedstrijden = await zyq.localFetch(`/wedstrijden/${zyq.o_o_o.seizoen}`);
        for (const wedstrijd of wedstrijden) {
            if (wedstrijdBijRonde(rondeNummer, wedstrijd.datum)) {
                const datumKolom = zyq.datumLeesbaar(wedstrijd);
                const wedstrijdKolom = zyq.naarTeam(wedstrijd);
                const rondeUitslagen = await zyq.uitslagenTeamAlleRonden(wedstrijd.teamCode);
                const u = rondeUitslagen[wedstrijd.rondeNummer - 1];
                const uitslagKolom = zyq.uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
                lijst.append(html.rij("", datumKolom, wedstrijdKolom, uitslagKolom));
            }
        }
    }
    if (zyq.o_o_o.laatsteRonde > rondeNummer) {
        lijst.append(rondeInterneCompetitie(rondeNummer + 1)); // volgende ronde
        }
    }

function rondeInterneCompetitie(rondeNummer) {
    return html.rij(rondeNummer,
        html.naarPagina(`ronde.html?ronde=${rondeNummer}`, zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer])),
        zyq.teamVoluit(zyq.o_o_o.competitie),
        "");
}

function wedstrijdBijRonde(rondeNummer, datum) {
    if (rondeNummer === 1) {
        return datum <= zyq.o_o_o.ronde[1].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === zyq.o_o_o.laatsteRonde) {
        return datum > zyq.o_o_o.ronde[rondeNummer - 1].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > zyq.o_o_o.ronde[rondeNummer - 1].datum && datum <= zyq.o_o_o.ronde[rondeNummer].datum;
    }
}