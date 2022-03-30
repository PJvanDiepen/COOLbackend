"use strict";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */

(async function() {
    await init();
    competitieTitel();
    competitie.team = competitie.competitie;
    const rondeNummer = bepaalRondeNummer();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [WEDSTRIJDLEIDER, `ranglijst na ronde ${rondeNummer}`, function() {
            naarAnderePagina(`ranglijst.html?ronde=${rondeNummer}`);
        }],
        [WEDSTRIJDLEIDER, `ronde ${rondeNummer} opnieuw indelen`, function () {
            naarAnderePagina(`indelen.html?ronde=${rondeNummer}`);
        }],
        [WEDSTRIJDLEIDER, `ronde ${rondeNummer} wijzigen`, function () {
            naarAnderePagina(`wijzig.html?ronde=${rondeNummer}`);
        }],
        [BEHEERDER, `ranglijst ${ditSeizoen} opnieuw verwerken`, function () {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${ditSeizoen}`)) {
                    sessionStorage.removeItem(key);
                }
            }
        }],
        [BEHEERDER, `backup ronde ${rondeNummer}` , async function () {
            await backupUitslag(rondeNummer);
        }],
        [BEHEERDER, `verwijder indeling ronde ${rondeNummer}`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/indeling/${competitie.seizoen}/${competitie.competitie}/${rondeNummer}`);
            if (mutaties) {
                sessionStorage.removeItem(`/ronde/${competitie.seizoen}/${rondeNummer}`);  // TODO ranglijst weggooien
                naarAnderePagina("ronde.html?ronde=" + rondeNummer);
            }
        }],
        [BEHEERDER, `verwijder ronde ${rondeNummer}`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/ronde/${competitie.seizoen}/int/${rondeNummer}`);
        }]);
    await uitslagenRonde(rondeNummer, document.getElementById("uitslagen"));
    await wedstrijdenBijRonde(rondeNummer, document.getElementById("wedstrijden"));
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(competitie.ronde[rondeNummer]);
    if (competitie.competitie === INTERNE_COMPETITIE) {
        document.getElementById("subkop").innerHTML = "Andere ronden en wedstrijden";
    }
})();

function bepaalRondeNummer() {
    let rondeNummer = Number(params.get("ronde"));
    if (rondeNummer) { // niet 0
        return rondeNummer;
    } else if (competitie.huidigeRonde && competitie.ronde[competitie.huidigeRonde].resultaten === 0) {
        return competitie.huidigeRonde; // indien indeling definitief, maar nog geen uitslagen
    } else if (competitie.vorigeRonde) {
        return competitie.vorigeRonde;
    } else {
        return 1;
    }
}

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
    const uitslagen = await serverFetch(`/ronde/${competitie.seizoen}/${competitie.competitie}/${rondeNummer}`); // actuele situatie
    if (uitslagen.length > 0) {
        for (const uitslag of uitslagen) {
            const uitslagKolom = uitslagVerwerken(rondeNummer, uitslag);
            htmlVerwerkt(uitslagKolom, uitslag.knsbNummer === gewijzigd.wit && uitslag.tegenstanderNummer === gewijzigd.zwart);
            lijst.appendChild(htmlRij(
                uitslag.bordNummer,
                naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                uitslagKolom));
        }
    } else {
        lijst.appendChild(htmlRij("nog", "geen", "uitslagen", ""));
    }
}

/*
    verwerk &ronde=<rondeNummer>&wit=<wit>&zwart=<zwart>&uitslag=<uitslag>
 */
async function uitslagMutatie(rondeNummer) {
    const wit = params.get("wit");
    const zwart = params.get("zwart");
    const uitslag = params.get("uitslag");
    if (wit && zwart && uitslag) {
        const mutaties = await serverFetch(
            `/${uuidToken}/uitslag/${competitie.seizoen}/${competitie.competitie}/${rondeNummer}/${wit}/${zwart}/${uitslag}`);
        if (mutaties > 0) {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${competitie.seizoen}`) ||
                    key.startsWith(`/uitslagen/${competitie.seizoen}`)) {
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
    } else if (uitslag.resultaat === WINST) {
        return "1-0";
    } else if (uitslag.resultaat === REMISE) {
        return "½-½";
    } else if (uitslag.resultaat === VERLIES) {
        return "0-1";
    } else {
        return "";
    }
}

function uitslagWijzigen(uitslag)  {
    if (competitie.seizoen !== ditSeizoen) { // vorig seizoen nooit wijzigen
        return false;
    } else if (gebruiker.mutatieRechten >= WEDSTRIJDLEIDER) {
        return true;
    } else if (gebruiker.mutatieRechten >= GEREGISTREERD && uitslag.resultaat === "") {
        return uitslag.knsbNummer === gebruiker.knsbNummer || uitslag.tegenstanderNummer === gebruiker.knsbNummer;
    } else {
        return false;
    }
}

function uitslagSelecteren(rondeNummer, uitslag) {
    const select = document.createElement("select");
    select.appendChild(htmlOptie(WINST, "1-0"));
    select.appendChild(htmlOptie(REMISE, "½-½"));
    select.appendChild(htmlOptie(VERLIES, "0-1"));
    select.value = uitslag.resultaat;
    select.addEventListener("input",function () {
        naarZelfdePagina(
            `ronde=${rondeNummer}&wit=${uitslag.knsbNummer}&zwart=${uitslag.tegenstanderNummer}&uitslag=${select.value}`);
    });
    return select;
}

async function wedstrijdenBijRonde(rondeNummer, lijst) {
    lijst.appendChild(rondeInterneCompetitie(1));
    if (rondeNummer > 2) {
        lijst.appendChild(rondeInterneCompetitie(rondeNummer - 1));
    }
    if (competitie.competitie === INTERNE_COMPETITIE) { // wedstrijden die meetellen voor de interne competitie
        const wedstrijden = await localFetch("/wedstrijden/" + competitie.seizoen);
        for (const wedstrijd of wedstrijden) {
            if (wedstrijdBijRonde(rondeNummer, wedstrijd.datum)) {
                const datumKolom = datumLeesbaar(wedstrijd);
                const wedstrijdKolom = naarTeam(wedstrijd);
                const rondeUitslagen = await uitslagenTeamAlleRonden(wedstrijd.teamCode);
                const u = rondeUitslagen[wedstrijd.rondeNummer - 1];
                const uitslagKolom = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
                lijst.appendChild(htmlRij("", datumKolom, wedstrijdKolom, uitslagKolom));
            }
        }
    }
    if (competitie.laatsteRonde > rondeNummer) {
        if (rondeNummer > 1) {
            lijst.appendChild(rondeInterneCompetitie(rondeNummer));
        }
        if (competitie.laatsteRonde > rondeNummer + 1) {
            lijst.appendChild(rondeInterneCompetitie(rondeNummer + 1));
        }
    }
    lijst.appendChild(rondeInterneCompetitie(competitie.laatsteRonde));
}

function rondeInterneCompetitie(rondeNummer) {
    const aantal = competitie.ronde[rondeNummer].resultaten > 0 ? competitie.ronde[rondeNummer].resultaten / 2 : "";
    return htmlRij(
        rondeNummer,
        htmlLink(`ronde.html?ronde=${rondeNummer}`, datumLeesbaar(competitie.ronde[rondeNummer])),
        teamVoluit(competitie.competitie),
        aantal);
}

function wedstrijdBijRonde(rondeNummer, datum) {
    if (rondeNummer === 1) {
        return datum <= competitie.ronde[1].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === competitie.laatsteRonde) {
        return datum > competitie.ronde[rondeNummer - 1].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > competitie.ronde[rondeNummer - 1].datum && datum <= competitie.ronde[rondeNummer].datum;
    }
}

async function backupUitslag(rondeNummer) {
    const rijen = await serverFetch(`/backup/uitslag/${competitie.seizoen}/${competitie.team}/${rondeNummer}/${rondeNummer}`);
    let velden = [];
    for (const [key, value] of Object.entries(rijen[0])) {
        velden.push(key);
    }
    console.log(`insert into uitslag (${velden.join(", ")}) values`);
    for (const rij of rijen) {
        let kolommen = [];
        for (const [key, value] of Object.entries(rij)) {
            // TODO backupRij = selecteer(key, value); waarbij selecteer als parameter aan backup doorgeven
            kolommen.push(valueSQL(value));
        }
        console.log(`(${kolommen.join(", ")}),`);
    }
}

/*
insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2021', 'int', '1', '0', '101', 'a', '', '0', '', '2020-08-25', 'int'),
 */
function valueSQL(value) {
    if (typeof value === "string") {
        const datum = new Date(value);
        if (value.length > 10 && datum instanceof Date && !isNaN(datum)) {
            return `'${datumSQL(value)}'`;
        } else {
            return `'${value}'`;
        }
    } else if (typeof value === "number") {
        return value;
    }
}
