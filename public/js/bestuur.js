"use strict";

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    ledenLijst(document.getElementById("kop"), document.getElementById("tabel"));
    testRegEx1();
    theFileReader();
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
    let filesList = document.getElementById("olaFile");
    filesList.addEventListener("change", function (event) {
        let info = "",
            output = document.getElementById("output"),
            progress = document.getElementById("progress"),
            files = event.target.files,
            type = "default",
            reader = new FileReader();

        if (/image/.test(files[0].type)) {
            reader.readAsDataURL(files[0]);
            type = "image";
        } else {
            reader.readAsText(files[0]);
            type = "text";
        }

        reader.onerror = function() {
            output.innerHTML = "Could not read file, error code is " +
                reader.error.code;
        };

        reader.onprogress = function(event) {
            if (event.lengthComputable) {
                progress.innerHTML = `${event.loaded}/${event.total}`;
            }
        };

        reader.onload = function() {
            let html = "";

            switch(type) {
                case "image":
                    html = `<img src="${reader.result}">`;
                    break;
                case "text":
                    html = reader.result;
                    break;
            }
            output.innerHTML = html;
        };
    });
}