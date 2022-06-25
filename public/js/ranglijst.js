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
    teamSelecteren(o_o_o.competitie);
    rondeSelecteren(o_o_o.competitie, 0);
    versieSelecteren(document.getElementById("versies"));
    ledenSelecteren(document.getElementById("leden"));
    spelersLijst(document.getElementById("kop"), document.getElementById("tabel"));
})();

async function spelersLijst(kop, lijst) {
    const rondeNummer = Number(params.get("ronde")) || o_o_o.vorigeRonde;
    kop.innerHTML = seizoenVoluit(o_o_o.seizoen) + SCHEIDING + "ranglijst na ronde " + rondeNummer;
    let i = 0;
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    const spelers = await ranglijst(rondeNummer);
    for (const speler of spelers) {
        if (speler.intern() || speler.oneven() || speler.extern() || alleLeden) {
            lijst.appendChild(htmlRij(
                ++i,
                naarSpeler(speler),
                speler.intern() || speler.oneven() ? speler.punten() : "",
                speler.winnaarSubgroep(winnaars),
                speler.scoreIntern(),
                speler.percentageIntern(),
                speler.saldoWitZwart() ? speler.saldoWitZwart() : "",
                speler.oneven() ? speler.oneven() : "",
                speler.scoreExtern(),
                speler.percentageExtern()));
        }
    }
    const laagsteSubgroep = [];
    for (let j = 0; j < spelers.length; j++) {
        if (spelers[j].prijs()) {
            laagsteSubgroep[spelers[j].eigenWaardeCijfer()] = j;
        }
    }
    console.log(laagsteSubgroep);
    for (let j = 0; j < spelers.length; j++) {
        if (spelers[j].prijs()) {
            console.log(`${spelers[j].naam} in ${spelers[j].subgroep} promoveert ${promotieSubgroep(j, spelers, laagsteSubgroep)}`);
        }
    }
    const promoties = {}; // voor promotieSubgroep() in totalen
}

function promotieSubgroep(j, spelers, laagsteSubgroep) {
    // console.log(`spelers[j]: ${spelers[j].naam}`);
    for (let i = laagsteSubgroep.length - 1; i > 0; i--) {
        // console.log(`i: ${i} a[i]: ${laagsteSubgroep[i]}`);
        if (spelers[laagsteSubgroep[i]].eigenWaardeCijfer() <= spelers[j].eigenWaardeCijfer()) {
            return "niet";
        } else if (laagsteSubgroep[i] > j) {
            return `naar ${spelers[laagsteSubgroep[i]].subgroep}`;
        }
    }
    return "niet ?";
}

function versieSelecteren(versies) {  // TODO: versies en teksten in database
    versies.appendChild(htmlOptie(0, "versie 0 volgens reglement interne competitie van het seizoen"));
    versies.appendChild(htmlOptie(2, "versie 2 met afzeggingenAftrek zoals in seizoen = 1819, 1920, 2021"));
    versies.appendChild(htmlOptie(3, "versie 3 zonder afzeggingenAftrek vanaf seizoen = 2122"));
    versies.appendChild(htmlOptie(4, "versie 4 volgens reglement rapid competitie"));
    versies.appendChild(htmlOptie(5, "versie 5 voor snelschaken"));
    versies.value = o_o_o.versie;
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
