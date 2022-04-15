"use strict";

/*
    verwerk leden=0
           &ronde=<rondeNummer>
 */

const alleLeden = Number(params.get("leden"));

(async function() {
    await init();
    competitieTitel();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    teamSelecteren(competitie.competitie);
    rondeSelecteren(competitie.competitie, 0);
    versieSelecteren(document.getElementById("versies"));
    ledenSelecteren(document.getElementById("leden"));
    spelersLijst(document.getElementById("kop"), document.getElementById("tabel"));
})();

async function spelersLijst(kop, lijst) {
    const rondeNummer = Number(params.get("ronde")) || competitie.vorigeRonde;
    kop.innerHTML = seizoenVoluit(competitie.seizoen) + SCHEIDING + "ranglijst na ronde " + rondeNummer;
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    (await ranglijst(rondeNummer)).forEach(function (t, i) {
        if (t.inRanglijst() || alleLeden) {
            lijst.appendChild(htmlRij(
                i + 1,
                naarSpeler(t),
                t.punten() ? t.punten() : "",
                t.winnaarSubgroep(winnaars),
                t.scoreIntern(),
                t.percentageIntern(),
                t.saldoWitZwart() ? t.saldoWitZwart() : "",
                t.oneven() ? t.oneven() : "",
                t.scoreExtern(),
                t.percentageExtern()));
        }
    });
}

async function rondeSelecteren(teamCode, rondeNummer) {
    competitie.team = competitie.competitie;
    const ronden = document.getElementById("rondeSelecteren");
    (await localFetch("/ronden/" + competitie.seizoen + "/" + teamCode)).forEach(
        function (ronde) {
            ronden.appendChild(htmlOptie(ronde.rondeNummer, datumLeesbaar(ronde) + SCHEIDING + "ronde " + ronde.rondeNummer));
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

function versieSelecteren(versies) {  // TODO: versies en teksten in database
    versies.appendChild(htmlOptie(0, "versie 0 volgens reglement interne competitie van het seizoen"));
    versies.appendChild(htmlOptie(2, "versie 2 met afzeggingenAftrek zoals in seizoen = 1819, 1920, 2021"));
    versies.appendChild(htmlOptie(3, "versie 3 zonder afzeggingenAftrek vanaf seizoen = 2122"));
    versies.appendChild(htmlOptie(4, "versie 4 volgens reglement rapid competitie"));
    versies.value = competitie.versie;
    versies.addEventListener("input",
        function () {
            naarZelfdePagina(`versie=${versies.value}`);
        });
}

function ledenSelecteren(leden) {
    leden.appendChild(htmlOptie(0, "alleen actieve leden"));
    leden.appendChild(htmlOptie(1, "inclusief niet actieve spelers"));
    leden.value = alleLeden;
    leden.addEventListener("input",
        function () {
            naarZelfdePagina(`leden=${leden.value}`);
        })
}
