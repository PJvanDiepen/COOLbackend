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
    o_o_o.team = o_o_o.competitie;
    const rondeNummer = Number(params.get("ronde")) || o_o_o.vorigeRonde || 1;
    menu([WEDSTRIJDLEIDER, `ranglijst na ronde ${rondeNummer}`, function() {
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
        [BEHEERDER, `backup uitslagen ronde ${rondeNummer}` , async function () {
            const rijen = await serverFetch(`/backup/ronde/uitslag/${o_o_o.seizoen}/${o_o_o.team}/${rondeNummer}/${rondeNummer}`);
            backupSQL("uitslag", rijen);
        }],
        [BEHEERDER, `verwijder indeling ronde ${rondeNummer}`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/indeling/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}`);
            if (mutaties) {
                sessionStorage.removeItem(`/ronde/${o_o_o.seizoen}/${rondeNummer}`);  // TODO ranglijst weggooien
                naarAnderePagina(`ronde.html?ronde=${rondeNummer}`);
            }
        }],
        [BEHEERDER, `wijzig ronde ${rondeNummer}`, async function () {
            naarAnderePagina(`wijzig.html?ronde=${rondeNummer}`);
        }],
        [BEHEERDER, `verwijder ronde ${rondeNummer} (pas op!)`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/ronde/${o_o_o.seizoen}/int/${rondeNummer}`);
        }]);
    rondeSelecteren(o_o_o.competitie, rondeNummer);
    await uitslagenRonde(rondeNummer, document.getElementById("uitslagen"));
    await wedstrijdenBijRonde(rondeNummer, document.getElementById("wedstrijden"));
    document.getElementById("kop").innerHTML =
        "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(o_o_o.ronde[rondeNummer]);
    if (o_o_o.competitie === INTERNE_COMPETITIE) {
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
    const uitslagen = await serverFetch(`/ronde/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}`); // actuele situatie
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
            `/${uuidToken}/uitslag/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/${wit}/${zwart}/${uitslag}`);
        if (mutaties > 0) {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${o_o_o.seizoen}`) ||
                    key.startsWith(`/uitslagen/${o_o_o.seizoen}`)) {
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
    if (o_o_o.seizoen !== ditSeizoen) { // vorig seizoen nooit wijzigen
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
    if (rondeNummer > 1) {
        lijst.appendChild(rondeInterneCompetitie(rondeNummer - 1)); // vorige ronde
    }
    if (o_o_o.competitie === INTERNE_COMPETITIE) { // wedstrijden die meetellen voor de interne competitie
        const wedstrijden = await localFetch("/wedstrijden/" + o_o_o.seizoen);
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
    if (o_o_o.laatsteRonde > rondeNummer) {
        lijst.appendChild(rondeInterneCompetitie(rondeNummer + 1)); // volgende ronde
        }
    }

function rondeInterneCompetitie(rondeNummer) {
    return htmlRij(rondeNummer,
        htmlLink(`ronde.html?ronde=${rondeNummer}`, datumLeesbaar(o_o_o.ronde[rondeNummer])),
        teamVoluit(o_o_o.competitie),
        "");
}

function wedstrijdBijRonde(rondeNummer, datum) {
    if (rondeNummer === 1) {
        return datum <= o_o_o.ronde[1].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === o_o_o.laatsteRonde) {
        return datum > o_o_o.ronde[rondeNummer - 1].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > o_o_o.ronde[rondeNummer - 1].datum && datum <= o_o_o.ronde[rondeNummer].datum;
    }
}