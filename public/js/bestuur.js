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
            const regex = /(),|(\d*),|"([^"]*)",|([^,]*),/g;
            const regels = reader.result.split('\n');
            for (const regel of regels) {
                regelVerwerken(regex, regel);
            }
            output.innerHTML = `${files[0].name} ${files[0].type} ${files[0].size} bytes gelezen`;
            // console.log(regel);
        };
    });
}

/*
01 Relatienummer > knsbNummer
02 Volledige naam > voornaam, tussenvoegsel, achternaam
03 Geslacht > M of V
04 Geboortejaar
05 Categorie > S of J
06 Email
07 Telefoonnummer 1
08 Telefoonnummer 2
09 Adres > straat, huisNummer
10 Postcode
11 Plaatsnaam
12 Landnaam
13 Lidmaatschap
14 Lid sinds
15 Afgemeld per
16 KNSB-rating > knsbRating
17 FIDE-rating
18 Jeugdrating
19 Stappenniveau
20 Verlengingsdatum
21 Gebruik NAW
22 Beeldmateriaal
 */

function regelVerwerken(regex, regel) {
    console.log("--- regelVerwerken ---");
    console.log(regel);
    let m;
    while ((m = regex.exec(regel)) !== null) {
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