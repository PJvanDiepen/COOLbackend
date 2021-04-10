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

function naarTeam(tekst, u) {
    return htmlLink(`team.html?team=${u.teamCode}#ronde${u.rondeNummer}`, tekst);
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

function wedstrijdUitslag(winst, remise, verlies) {
    while (remise >= 2) {
        winst += 1;
        verlies += 1;
        remise -= 2;
    }
    if (remise === 0) {
        return winst + " - " + verlies;
    } else if (winst === 0) {
        return REMISE + " - " + verlies + REMISE;
    } else if (verlies === 0) {
        return winst + REMISE + " - " + REMISE;
    } else {
        return winst + REMISE + " - " + verlies + REMISE;
    }
}

function uitslagTeam(uithuis, winst, verlies, remise) {
    return uithuis === THUIS ? wedstrijdUitslag(winst, remise, verlies) : wedstrijdUitslag(verlies, remise, winst);
}

function percentage(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        return (100 * (winst + remise / 2) / partijen).toFixed() + "%";
    } else {
        return "";
    }
}

function actieSelecteren(acties, ...menu) {
    let functies = [];
    for (let [tekst, functie] of menu) {
        acties.appendChild(htmlOptie(functies.length, tekst));
        functies.push(functie ? functie :
            function () {
                console.log(tekst);
            });
    }
    acties.addEventListener("input",
        function() {
            functies[acties.value]();
            acties.value = 0;
        });
}

const hamburgerMenu = ["\u2630", function () { }];

const terugNaar = ["\uD83E\uDC68", function() {
    history.back();
}];

const naarRanglijst = ["ranglijst", function () {
    naarAnderePagina("ranglijst.html");
}];

function naarZelfdePagina() {
    location.replace(pagina.pathname);
}

function naarAnderePagina(naarPagina) {
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

async function seizoenSelecteren(seizoenen, teamCode) {
    await mapAsync("/seizoenen/" + teamCode,
        function (team) {
            seizoenen.appendChild(htmlOptie(team.seizoen, seizoenVoluit(team.seizoen)));
        });
    seizoenen.value = seizoen; // werkt uitsluitend na await
    seizoenen.addEventListener("input",
        function () {
            sessionStorage.setItem("seizoen", seizoenen.value);
            naarZelfdePagina();
        });
}

async function teamSelecteren(teams, teamCode) {
    await mapAsync("/teams/" + seizoen,
        function (team) {
            teams.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        });
    teams.value = teamCode; // werkt uitsluitend na await
    teams.addEventListener("input",
        function () {
            naarAnderePagina(teams.value === INTERNE_COMPETITIE ? "ranglijst.html" : "team.html?team=" + teams.value);
        });
}

async function rondeSelecteren(ronden, teamCode, rondeNummer) {
    await mapAsync("/ronden/" + seizoen + "/" + teamCode,
        function (ronde) {
            ronden.appendChild(htmlOptie(ronde.rondeNummer, datumLeesbaar(ronde.datum) + SCHEIDING + "ronde " + ronde.rondeNummer));
        });
    ronden.appendChild(htmlOptie(0, ronden.length + " ronden"))
    ronden.value = rondeNummer ? rondeNummer : 0; // werkt uitsluitend na await
    ronden.addEventListener("input",
        function () {
            if (ronden.value) {
                naarAnderePagina("ronde.html?ronde=" + ronden.value);
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
    const wedstrijden = await localFetch("/wedstrijden/" + seizoen);
    for (const wedstrijd of wedstrijden) {
        if (wedstrijdBijRonde(wedstrijd.datum, ronden)) {
            const datumKolom = datumLeesbaar(wedstrijd.datum);
            const wedstrijdKolom = naarTeam(wedstrijdVoluit(wedstrijd), wedstrijd);
            const rondeUitslagen = await uitslagenTeamAlleRonden(wedstrijd.teamCode);
            const u = rondeUitslagen[wedstrijd.rondeNummer - 1];
            const uitslagKolom = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
            lijst.appendChild(htmlRij(datumKolom, wedstrijdKolom, uitslagKolom));
        }
    }
    lijst.appendChild(htmlRij(datumLeesbaar(dezeDatum), "interne competitie ronde " + rondeNummer, ""));
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
    const tegenstanderKolom = naarTeam(wedstrijdVoluit(u), u);
    const puntenKolom = vorigeUitslag.punten + u.punten;
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, puntenKolom, totaal);
}

function externePartij(u, totaal) {
    const rondeKolom = "";
    const datumKolom = datumLeesbaar(u.datum);
    const tegenstanderKolom = naarTeam(wedstrijdVoluit(u), u);
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, u.punten, totaal);
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

async function uitslagenTeamAlleRonden(teamCode) {
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
    return rondeUitslagen;
}

async function uitslagenTeam(kop, rondenTabel) {
    await findAsync("/teams/" + seizoen,
        function (team) {
            if (team.teamCode === teamCode) {
                kop.innerHTML = [wedstrijdTeam(teamCode), seizoenVoluit(seizoen), team.omschrijving].join(SCHEIDING);
                return true;
            }
        });
    const rondeUitslagen = await uitslagenTeamAlleRonden(teamCode);
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
    div.appendChild(document.createElement("h2")).innerHTML = "Ronde " + rondeNummer;
    if (u) {
        const datum = datumLeesbaar(u.ronde.datum);
        const wedstrijd = wedstrijdVoluit(u.ronde);
        const uitslag = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datum, naarTeam(wedstrijd, u.ronde), uitslag));
        const tabel = div.appendChild(document.createElement("table"));
        tabel.appendChild(htmlRij(datum, wedstrijd, "", uitslag));
        if (u.uitslagen.length) {
            for (let uitslag of u.uitslagen) {
                tabel.appendChild(uitslag);
            }
        } else {
            tabel.appendChild(htmlRij("","geen uitslagen","",""));
        }
    }
}
