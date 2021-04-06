"use strict";

const pagina = new URL(location);
const api = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;
const schaakVereniging = doorgeven("schaakVereniging");
const seizoen = doorgeven("seizoen");
const teamCode = doorgeven("team");
const speler = doorgeven("speler"); // knsbNummer
const naam = doorgeven("naam");
const rondeNummer = doorgeven("ronde");

const INTERNE_COMPETITIE = "int";
const SCHEIDING = " » ";

function doorgeven(key) {
    let value = params.get(key);
    if (value) {
        sessionStorage.setItem(key, value);
    } else {
        value = sessionStorage.getItem(key);
    }
    return value;
}

async function findAsync(url, findFun) {
    const objects = await localFetch(url);
    objects.find(findFun); // verwerk en stop indien gevonden
}

async function mapAsync(url, mapFun) {
    const objects = await localFetch(url);
    objects.map(mapFun); // verwerk ze allemaal
}

async function localFetch(url) {
    let object = JSON.parse(sessionStorage.getItem(url));
    if (!object) {
        object = await serverFetch(url);
        sessionStorage.setItem(url, JSON.stringify(object));
    }
    return object;
}

async function serverFetch(url) {
    try {
        const response = await fetch(api + url);
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

function htmlOptie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

function htmlTekst(tekst) {
    return tekst.nodeType === Node.ELEMENT_NODE ? tekst : document.createTextNode(tekst);
}

function htmlParagraaf(tekst) {
    const p = document.createElement("p");
    p.appendChild(htmlTekst(tekst));
    return p;
}

function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.appendChild(htmlTekst(kolom));
        tr.appendChild(td);
    });
    return tr;
}

function htmlLink(link, tekst, tabblad) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
    a.href = link;
    if (tabblad) { // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
        a.target = "_blank";
        a.rel = "noopener noreferrer"
    }
    return a;
}

function naarSpeler(knsbNummer, naam) {
    return htmlLink(`speler.html?speler=${knsbNummer}&naam=${naam}`, naam);
}

function naarRonde(tekst, u) {
    return htmlLink(`ronde.html?ronde=${u.rondeNummer}`, tekst);
}

function naarTeam(u) {
    return htmlLink(`team.html?team=${u.teamCode}#ronde${u.rondeNummer}`, wedstrijdVoluit(u));
}

function naarZelfdePagina() {
    location.replace(pagina.pathname);
}

function naarAnderePagina(naarPagina) {
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

function datumLeesbaar(jsonDatum) {
    const d = new Date(jsonDatum);
    return `${voorloopNul(d.getDate())}-${voorloopNul(d.getMonth()+1)}-${d.getFullYear()}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

function seizoenVoluit(seizoen) {
    return "20" + seizoen.substring(0,2) + "-20" +  seizoen.substring(2,4);
}

function teamVoluit(teamCode) {
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === "kbe") {
        return schaakVereniging + " bekerteam";
    } else if (teamCode === "nbe") {
        return schaakVereniging + " nhsb bekerteam";
    } else {
        return wedstrijdTeam(teamCode)
    }
}

function wedstrijdTeam(teamCode) {
    return schaakVereniging + (teamCode.substring(1) === "be" ? " " : " " + teamCode);
}

function wedstrijdVoluit(r) {
    const eigenTeam = wedstrijdTeam(r.teamCode);
    return r.uithuis === THUIS ? eigenTeam + " - " + r.tegenstander : r.tegenstander + " - " + eigenTeam;
}

const REMISE = "½";
const WINST  = "1";
const VERLIES = "0";
const THUIS = "t";
const UIT = "u";

function wedstrijdUitslag(thuis, uit, remise) {
    while (remise >= 2) {
        thuis += 1;
        uit += 1;
        remise -= 2;
    }
    if (remise === 0) {
        return thuis + " - " + uit;
    } else if (thuis === 0) {
        return REMISE + " - " + uit + REMISE;
    } else if (uit === 0) {
        return thuis + REMISE + " - " + REMISE;
    } else {
        return thuis + REMISE + " - " + uit + REMISE;
    }
}

function score(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        while (remise >= 2) {
            winst += 1;
            remise -= 2;
        }
        if (remise === 0) {
            return winst + " / " + partijen;
        } else if (winst === 0) {
            return REMISE + " / " + partijen;
        } else {
            return winst + REMISE + " / " + partijen;
        }
    } else {
        return "";
    }

}

function percentage(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        return (100 * (winst + remise / 2) / partijen).toFixed() + "%";
    } else {
        return "";
    }
}

function menu(actieSelecteren) {
    let test = function() {
        console.log("test!");
    };
    test();
    console.log(typeof test);
    let acties = [];

    acties.push(function() {
        console.log("selecteer actie");
    });
    actieSelecteren.appendChild(htmlOptie(acties.length - 1, "selecteer actie"));

    acties.push(function() {
        console.log("menu!");
    });
    actieSelecteren.appendChild(htmlOptie(acties.length - 1, "menu!"));

    acties.push(async function () {
        console.log("partij = x");
        const mutaties = await serverFetch("/partij/x");
        console.log("mutaties: " + mutaties);
    });
    actieSelecteren.appendChild(htmlOptie(acties.length - 1, "partij = x"));

    acties.push(async function () {
        console.log("partij = y");
        const mutaties = await serverFetch("/partij/y");
        console.log("mutaties: " + mutaties);
    });
    actieSelecteren.appendChild(htmlOptie(acties.length - 1, "partij = y"));

    actieSelecteren.addEventListener("input",
        function() {
            acties[actieSelecteren.value]();
        });
}

async function seizoenen(seizoenSelecteren, teamCode) {
    await mapAsync("/seizoenen/" + teamCode,
        function (team) {
            seizoenSelecteren.appendChild(htmlOptie(team.seizoen, seizoenVoluit(team.seizoen)));
        });
    seizoenSelecteren.value = seizoen; // werkt uitsluitend na await
    seizoenSelecteren.addEventListener("input",
        function () {
            sessionStorage.setItem("seizoen", seizoenSelecteren.value);
            naarZelfdePagina();
        });
}

async function teams(teamSelecteren, teamCode) {
    await mapAsync("/teams/" + seizoen,
        function (team) {
            teamSelecteren.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        });
    teamSelecteren.value = teamCode; // werkt uitsluitend na await
    teamSelecteren.addEventListener("input",
        function () {
            if (teamSelecteren.value === INTERNE_COMPETITIE) {
                naarAnderePagina("ranglijst.html");
            } else {
                naarAnderePagina("team.html?team=" + teamSelecteren.value);
            }
        });
}

async function ronden(rondeSelecteren, teamCode, rondeNummer) {
    await mapAsync("/ronden/" + seizoen + "/" + teamCode,
        function (ronde) {
            rondeSelecteren.appendChild(htmlOptie(ronde.rondeNummer, datumLeesbaar(ronde.datum) + SCHEIDING + "ronde " + ronde.rondeNummer));
        });
    rondeSelecteren.appendChild(htmlOptie(0, rondeSelecteren.length + " ronden"))
    rondeSelecteren.value = rondeNummer ? rondeNummer : 0; // werkt uitsluitend na await
    rondeSelecteren.addEventListener("input",
        function () {
            if (rondeSelecteren.value) {
                naarAnderePagina("ronde.html?ronde=" + rondeSelecteren.value);
            }
        });
}

/*
 -- ranglijst
 select s.knsbNummer, naam, subgroep, knsbRating, internTotalen(@seizoen, s.knsbNummer) as totalen
 from speler s
 join persoon p on s.knsbNummer = p.knsbNummer
 where seizoen = @seizoen
 order by totalen desc;
  */
function ranglijst(kop, lijst) {
    kop.innerHTML = schaakVereniging + SCHEIDING + seizoenVoluit(seizoen);
    const winnaars = {};
    mapAsync("/ranglijst/" + seizoen,
        function (speler, i) {
            const t = totalen(speler.totalen);
            if (t.inRanglijst()) {
                lijst.appendChild(htmlRij(
                    i + 1,
                    naarSpeler(speler.knsbNummer, speler.naam),
                    t.punten(),
                    t.winnaarSubgroep(winnaars, speler.subgroep),
                    t.scoreIntern(),
                    t.percentageIntern(),
                    t.saldoWitZwart(),
                    t.intern() ? t.afzeggingen() : "", // TODO afzeggingen verwijderen indien geen interne partijen
                    t.oneven(),
                    t.scoreExtern(),
                    t.percentageExtern(),
                    speler.knsbRating));
            }});
}

async function totalenSpeler(seizoen, knsbNummer) {
    let alleTotalen = {};
    await findAsync("/ranglijst/" + seizoen,
        function (speler) {
            if (speler.knsbNummer === Number(knsbNummer)) { // knsbNummer blijkt string
                alleTotalen = speler.totalen;
                return true; // stop findAsync()
            }});
    return totalen(alleTotalen);
}

/*
totaal
[0] sorteer (3 posities eventueel voorloopnullen)
[1] prijs (0 = geen prijs, 1 = wel prijs)
[2] winstIntern
[3] remiseIntern
[4] verliesIntern
[5] witIntern
[6] zwartIntern
[7] oneven
[8] afzeggingen
[9] aftrek
[10] totaal
[11] startPunten
[12] winstExtern
[13] remiseExtern
[14] verliesExtern
[15] witExtern
[16] zwartExtern)
 */
function totalen(alleTotalen) {
    const totaal = alleTotalen.split(" ").map(Number);

    function intern() {
        return totaal[2] || totaal[3] || totaal[4];
    }

    function inRanglijst() {
        return totaal[0] > 0;
    }

    function punten() {
        return intern() ? totaal[0] : "";
    }

    function winnaarSubgroep(winnaars, subgroep) {
        if (!intern()) {
            return "";
        } else if (winnaars[subgroep]) {
            return subgroep;
        } else if (totaal[1]) {
            winnaars[subgroep] = true;
            return subgroep + "*";
        } else {
            return subgroep + "-"; // geen prijs
        }
    }

    function scoreIntern() {
        return score(totaal[2],totaal[3],totaal[4]);
    }

    function percentageIntern() {
        return percentage(totaal[2],totaal[3],totaal[4]);
    }

    function saldoWitZwart() {
        return intern() ? totaal[5] - totaal[6] : "";
    }

    function oneven() {
        return totaal[7] ? totaal[7] : "";
    }

    function afzeggingen() {
        return totaal[8];
    }

    function aftrek() {
        return - totaal[9];
    }

    function startPunten() {
        return totaal[11];
    }

    function scoreExtern() {
        return score(totaal[12],totaal[13],totaal[14]);
    }

    function percentageExtern() {
        return percentage(totaal[12],totaal[13],totaal[14]);
    }

    return Object.freeze({ // Zie blz. 17.1 Douglas Crockford: How JavaScript Works
        intern,
        inRanglijst,
        punten,
        winnaarSubgroep,
        scoreIntern,
        percentageIntern,
        saldoWitZwart,
        oneven,
        afzeggingen,
        aftrek,
        startPunten,
        scoreExtern,
        percentageExtern,
    });
}

/*
  -- uitslagen interne competitie per ronde
  select
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
function uitslagenRonde(kop, lijst) {
    kop.innerHTML = "Ronde " + rondeNummer;
    mapAsync("/ronde/" + seizoen + "/" + rondeNummer,
        function (uitslag) {
            lijst.appendChild(htmlRij(
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslag.resultaat === "1" ? "1-0" : uitslag.resultaat === "0" ? "0-1" : "½-½"));
        });
}

async function wedstrijdenBijRonde(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen)].join(SCHEIDING);
    const ronden = await localFetch("/ronden/" + seizoen + "/int");
    const dezeDatum = ronden[rondeNummer - 1].datum;
    await mapAsync("/wedstrijden/" + seizoen,
        function (wedstrijd) {
            if (wedstrijdBijRonde(wedstrijd.datum, ronden)) {
                lijst.appendChild(htmlRij(datumLeesbaar(wedstrijd.datum), naarTeam(wedstrijd)));
            }
        });
    lijst.appendChild(htmlRij(datumLeesbaar(dezeDatum), "interne competitie ronde " + rondeNummer));
}

function wedstrijdBijRonde(datum, ronden) {
    if (rondeNummer === 1) {
        return datum <= ronden[0].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === ronden.length) {
        return datum > ronden[rondeNummer - 2].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > ronden[rondeNummer - 2].datum && datum <= ronden[rondeNummer - 1].datum;
    }
}

/*
  -- punten van alle uitslagen per speler
  select u.datum,
      u.rondeNummer,
      u.bordNummer,
      u.witZwart,
      u.tegenstanderNummer,
      p.naam,
      u.resultaat,
      u.teamCode,
      r.compleet,
      r.uithuis,
      r.tegenstander,
      punten(@seizoen, @knsbNummer, u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
  from uitslag u
  join persoon p on u.tegenstanderNummer = p.knsbNummer
  join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
  where u.seizoen = @seizoen
      and u.knsbNummer = @knsbNummer
      and u.anderTeam = 'int'
  order by u.datum, u.bordNummer;
  */

const AFGEZEGD = 3;
const TIJDELIJK_LID_NUMMER = 100;
const EXTERNE_WEDSTRIJD = 2;

async function uitslagenSpeler(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen), naam].join(SCHEIDING);
    const t = await totalenSpeler(seizoen, speler);
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern()) {
        lijst.appendChild(htmlRij("", "", "startpunten", "", "", "", totaal, totaal));
    }
    let vorigeUitslag;
    await mapAsync("/uitslagen/" + seizoen + "/" + speler,
        function (uitslag) {
            if (t.intern()) {
                totaal += uitslag.punten;
            }
            if (!t.intern() && uitslag.tegenstanderNummer === AFGEZEGD) {
                // deze uitslag overslaan TODO deze uitslag verwijderen
            } else if (uitslag.tegenstanderNummer > TIJDELIJK_LID_NUMMER) {
                lijst.appendChild(internePartij(uitslag, totaal));
            } else if (uitslag.teamCode === INTERNE_COMPETITIE && uitslag.tegenstanderNummer === EXTERNE_WEDSTRIJD) {
                vorigeUitslag = uitslag; // deze uitslag overslaan en combineren met volgende uitslag
            } else if (uitslag.teamCode === INTERNE_COMPETITIE) {
                lijst.appendChild(geenPartij(uitslag, totaal));
            } else if (vorigeUitslag && vorigeUitslag.datum === uitslag.datum) {
                lijst.appendChild(externePartijTijdensInterneRonde(vorigeUitslag, uitslag, totaal))
            } else {
                lijst.appendChild(externePartij(uitslag, totaal));
            }
        });
    if (t.aftrek()) {
        lijst.appendChild(htmlRij("", "", "aftrek", "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
}

/*
kolommen in lijst
1. rondeNummer + link naar interne ronde indien interne ronde
2. datum + link naar interne ronde indien interne ronde
3. link naar interne tegenstander of link naar externe wedstrijd of andere tekst
4. externe bord
5. kleur
6. resultaat
7. punten
8. voortschrijdend totaal
 */

function internePartij(u, totaal) {
    const rondeKolom = naarRonde(u.rondeNummer, u);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    const tegenstanderKolom = naarSpeler(u.tegenstanderNummer, u.naam);
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, "", u.witZwart, u.resultaat, u.punten, totaal);
}

function geenPartij(u, totaal) {
    const rondeKolom = naarRonde(u.rondeNummer, u);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    return htmlRij(rondeKolom, datumKolom, u.naam, "", "", "", u.punten, totaal);
}

function externePartijTijdensInterneRonde(vorigeUitslag, u, totaal) {
    const rondeKolom = naarRonde(vorigeUitslag.rondeNummer, vorigeUitslag);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), vorigeUitslag);
    const tegenstanderKolom = naarTeam(u);
    const puntenKolom = vorigeUitslag.punten + u.punten;
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, puntenKolom, totaal);
}

function externePartij(u, totaal) {
    return htmlRij("", datumLeesbaar(u.datum), naarTeam(u), u.bordNummer, u.witZwart, u.resultaat, u.punten, totaal);
}

/*

-- uitslagen externe competitie per team
select uitslag.rondeNummer,
    uitslag.bordNummer,
    uitslag.witZwart,
    uitslag.resultaat,
    uitslag.knsbNummer,
    persoon.naam,
from uitslag
join persoon on uitslag.knsbNummer = persoon.knsbNummer
where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
 */

/**
 * uitslagenTeam doet fetch van JSON ronden en uitslagen per team
 * en verwerkt die tot een tabel met ronden en een aantal tabellen met uitslagen per ronde.
 *
 * @param kop
 * @param rondenTabel
 * @returns {Promise<void>}
 */

async function uitslagenTeam(kop, rondenTabel) {
    await findAsync("/teams/" + seizoen,
        function (team) {
            if (team.teamCode === teamCode) {
                kop.innerHTML = [wedstrijdTeam(teamCode), seizoenVoluit(seizoen), team.omschrijving].join(SCHEIDING);
                return true;
            }
        });
    const rondeUitslagen = [];
    await mapAsync("/ronden/" + seizoen + "/" + teamCode,
        function (ronde) {
            rondeUitslagen[ronde.rondeNummer - 1] = {ronde: ronde, winst: 0, verlies: 0, remise: 0, uitslagen: []};
        });
    await mapAsync("/team/" + seizoen + "/" + teamCode,
        function (u) {
            const rondeUitslag = rondeUitslagen[u.rondeNummer - 1];
            if (u.resultaat === WINST) {
                rondeUitslag.winst += 1;
            } else if (u.resultaat === VERLIES) {
                rondeUitslag.verlies += 1;
            } else {
                rondeUitslag.remise += 1;
            }
            rondeUitslag.uitslagen.push(htmlRij(u.bordNummer, naarSpeler(u.knsbNummer, u.naam), u.witZwart, u.resultaat));
        });
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
    div.appendChild(document.createElement("h2")).innerHTML = "Ronde " + rondeNummer;
    if (u) {
        const tabel = div.appendChild(document.createElement("table"));
        const datum = datumLeesbaar(u.ronde.datum);
        const uitslag = u.ronde.uithuis === THUIS ? wedstrijdUitslag(u.winst, u.verlies, u.remise) : wedstrijdUitslag(u.verlies, u.winst, u.remise);
        rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datum, naarTeam(u.ronde), uitslag));
        tabel.appendChild(htmlRij(datum, wedstrijdVoluit(u.ronde), "", uitslag));
        if (u.uitslagen.length) {
            for (let uitslag of u.uitslagen) {
                tabel.appendChild(uitslag);
            }
        } else {
            tabel.appendChild(htmlRij("","geen uitslagen","",""));
        }
    }
}
