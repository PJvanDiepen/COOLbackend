"use strict";

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    ledenLijst(document.getElementById("kop"), document.getElementById("tabel"));
    // testRegEx1();
    theFileReader();
    // drieGroepen();
    // meerGroepen();
})();

async function ledenLijst(kop, lijst) {
    kop.innerHTML = seizoenVoluit(o_o_o.seizoen) + SCHEIDING + "leden";
    const leden = await localFetch(`/personen/${o_o_o.seizoen}`);
    for (const lid of leden) {
        console.log(lid);
        const knsbNummer = Number(lid.knsbNummer);
        if (knsbNummer > 100) {
            tabel.appendChild(htmlRij(
                lid.naam,
                "", // eventueel interne rating
                "", // lid ? lid.knsbRating : "",
                "", // lid ? datumLeesbaar(lid) : "",
                "", // lid ? lid.knsbTeam : "",
                "",
                "", // lid ? lid.nhsbTeam : "",
                "",
                ""));
        }
    }
}

/*
Zie https://regex101.com/codegen?language=javascript
 */
function testRegEx1() {
    const regex = /(.*),.*\.\s(.*)\((.*)\)/gm;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('(.*),.*\\.\\s(.*)\\((.*)\\)', 'gm')

    const str = `Diepen, P.J. van (Peter)
Bakker, J. (Jos)
Meiden, D. van der (Dirk)
Horst, C.A. v.d. (Corné)
`;
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    }
}

/*
Zie Matt Frisbie: Professional JavaScript for Web Developers blz. 760
 */
function theFileReader() {
    const filesList = document.getElementById("olaFile");
    filesList.addEventListener("change", function (event) {
        const output = document.getElementById("output");
        const files = event.target.files;
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onerror = function() {
            output.innerHTML = "Could not read file, error code is " + reader.error.code;
        };
        reader.onload = function() {
            const regels = reader.result.split('\n');
            for (const regel of regels) {
                olaVerwerken(csv(regel));
            }
            output.innerHTML = `${files[0].name} type: ${files[0].type} size: ${files[0].size}`;
        };
    });
}

const regex = /(),|(\d*),|"([^"]*)",|([^,]*),/g;

/**
 * Zie https://regex101.com/codegen?language=javascript
 *
 * bovenstaande regular expression onderscheid kolommen geschieden door komma's
 * per kolom is er een groep met een komma
 * groep 0 is de complete match
 * groep 1 indien leeg
 * groep 2 indien getal
 * groep 3 indien tekst met "" (eventueel met komma's)
 * groep 4 indien tekst zonder ""
 *
 * csv verwerkt een regel tot kolommen met behulp van regex
 * behalve de laatste kolom, want die heeft geen komma
 *
 * @param regel in csv
 * @returns {*[]} kolommen
 */
function csv(regel) {
    let kolommen = [];
    let m;
    while ((m = regex.exec(regel)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++; // This is necessary to avoid infinite loops with zero-width matches
        } else {
            m.forEach(function (match, groupIndex) {
                if (groupIndex === 1 && match !== undefined) {
                    kolommen.push("");
                } else if (groupIndex === 2 && match !== undefined) {
                    kolommen.push(Number(match));
                } else if (groupIndex === 3 && match !== undefined) {
                    kolommen.push(match);
                } else if (groupIndex === 4 && match !== undefined) {
                    kolommen.push(match);
                }
            });
        }
    }
    return kolommen;
}

/*
00 Relatienummer > knsbNummer
01 Volledige naam > voornaam, tussenvoegsel, achternaam
02 Geslacht > M of V
03 Geboortejaar
04 Categorie > S of J
05 Email
06 Telefoonnummer 1
07 Telefoonnummer 2
08 Adres > straat, huisNummer
09 Postcode
10 Plaatsnaam
11 Landnaam
12 Lidmaatschap
13 Lid sinds
14 Afgemeld per
15 KNSB-rating > knsbRating
16 FIDE-rating
17 Jeugdrating
18 Stappenniveau
19 Verlengingsdatum
20 Gebruik NAW
21 Beeldmateriaal (laatste kolom ontbreekt!)
 */

function olaVerwerken(kolom) {
    console.log(`${kolom[1]} ${kolom[0]} ${kolom[5]} speelt ${kolom[4] === "S" ? "dinsdag" : "niet"} ${kolom[15]}`);
}


function drieGroepen() {
    const regex = /"(\d*),""([^"]*)"",([^"]*)";/gm;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('"(\\d*),""([^"]*)"",([^"]*)";', 'gm')

    const str = `"7970094,""Ruiter, D.E. de (Danny)"",M,1991,S,dannyderuiter@hotmail.com,072-5159175,06-53269132,De Kempenstraat 7,1827 AG,Alkmaar,Nederland,Dubbellid,1/7/2021,,2271,2251,,,,Toegestaan,Toegestaan";;;;;;;;;;;;;;;;;;;;;;;;;"7970094,""Ruiter, D.E. de (Danny)"",M,1991,S,dannyderuiter@hotmail.com,072-5159175,06-53269132,De Kempenstraat 7,1827 AG,Alkmaar,Nederland,Dubbellid,1/7/2021,,2271,2251,,,,Toegestaan,Toegestaan%%%%%%%%%%%%%%%%%%%%%%"
`;
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        console.log("--- dit is m:");
        console.log(m);
        console.log("--- tot hier");

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    }
}

function meerGroepen () {
    const regex = /([^,]*)/gm;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('([^,]*)', 'gm')

    const str = `M,1991,S,dannyderuiter@hotmail.com,072-5159175,06-53269132,De Kempenstraat 7,1827 AG,Alkmaar,Nederland,Dubbellid,1/7/2021,,2271,2251,,,,Toegestaan,Toegestaan`;
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    }
}