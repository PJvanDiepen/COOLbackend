"use strict";

const tk = [
    {jaar: 2012,
        zetels: "VVD=41&PvdA=38&PVV=15&SP=15&CDA=13&D66=12&CU=5&GL=4&SGP=3&PvdD=2&50plus=2",
        kabinet: "Rutte2",
        coalitie: "VVD, PvdA",
        breed: 1024,
        hoog: 580,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Rutte_II"
    },
    {jaar: 2017,
        zetels: "VVD=33&PVV=20&CDA=19&D66=19&GL=14&SP=14&PvdA=9&CU=5&PvdD=5&50plus=4&SGP=3&Denk=3&FvD=2",
        kabinet: "Rutte3",
        coalitie: "VVD, VVD, CDA, D66, CU",
        breed: 830,
        hoog: 553,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Rutte_III"
    },
    {jaar: 2021,
        zetels: "VVD=39&PVV=19&CDA=17&D66=15&GL=11&SP=10&PvdA=13&CU=6&PvdD=6&50plus=3&SGP=3&Denk=2&FvD=4&Bij1=0&JA21=1&CodeOranje=0&Volt=1",
        kabinet: "Partijen",
        coalitie: "klik voor peilingwijzer",
        breed: 600,
        hoog: 430,
        link: "https://peilingwijzer.tomlouwerse.nl/p/laatste-cijfers.html"
    }
]

console.log(tk);
const pagina = new URL(location);
console.log(pagina.search);

const uitslagen = new URLSearchParams(pagina.search);
const lijsten = [];
let jaar = 0;
const kabinetten = [];

function verkiezingsJaren(jaren) {
    let komma = " ";
    for (const verkiezing of tk) {
        jaren.appendChild(htmlLink("tk.html?jaar=" + verkiezing.jaar, komma + verkiezing.jaar));
        komma = ", ";
    }
}

function uitslagenVerwerken(kabinet, plaatje, kop, deLijsten) {
    for (const [key, value] of uitslagen) {
        if (key.startsWith("_")) {
            laatsteTweedeKamerVerkiezingen(kop, deLijsten);
            break;
        } else if (key === "jaar") {
            jaar = Number(value);
        } else if (key === "klik") {
            lijsten[lijsten.indexOf(value)].wel = partijDoetMee(value);
        } else {
            const wel  = Number(value) > 1;
            lijsten.push({partij: key, zetels: Number(value), wel: wel, coalitie: false});
        }
    }
    let nummer = 0;
    for (const lijst of lijsten) {
        deLijsten.appendChild(htmlRij(++nummer, lijst.partij, lijst.zetels, lijst.wel ? " ✔ " : " - ")); // TODO klik
    }
}

function laatsteTweedeKamerVerkiezingen(kop, deLijsten) {
    kabinet.appendChild(htmlLink("https://nl.wikipedia.org/wiki/Kabinet-Rutte_III", "Rutte3: VVD, CDA, D66, CU", true));
    plaatje.appendChild(htmlPlaatje("images/tk/Rutte3.jpg", 830, 553));
    deLijsten.appendChild(htmlRij("klik op een jaar"));
}

function klik(knsbNummer, naam) {
    return htmlLink(`speler.html?speler=${knsbNummer}&naam=${naam}`, naam);
}

function partijDoetMee(partij) {
    if (sessionStorage.getItem(partij)) {
        sessionStorage.removeItem(partij);
        return false;
    } else {
        sessionStorage.setItem(partij);
        return true;
    }
}

function kabinetFormeren(deKabinetten) {
    kabinet(0, 0);
    let nummer = 0;
    while (kabinetten.length > 0) {
        let i = 0;
        let j = 1;
        while (j < kabinetten.length) {
            if (kabinetten[j].aantalPartijen < kabinetten[i].aantalPartijen) {
                i = j;
            } else if (kabinetten[j].aantalPartijen === kabinetten[i].aantalPartijen && kabinetten[j].coalitieZetels > kabinetten[i].coalitieZetels) {
                i = j;
            }
            j++;
        }
        deKabinetten.appendChild(htmlRij(++nummer, kabinetten[i].partijenLijst, kabinetten[i].aantalPartijen, kabinetten[i].coalitieZetels));
        kabinetten.splice(i,1);
    }
}

function kabinet(vanaf, coalitieZetels) {
    if (coalitieZetels < 76) {
        while (vanaf < lijsten.length) {
            if (lijsten[vanaf].zetels > 1) {
                lijsten[vanaf].coalitie = true;
                kabinet(vanaf + 1, coalitieZetels + lijsten[vanaf].zetels);
                lijsten[vanaf].coalitie = false;
            }
            vanaf++;
        }
    } else {
        const partijen = [];
        for (let lijst of lijsten) {
            if (lijst.coalitie) {
                partijen.push(lijst.partij);
            }
        }
        kabinetten.push({aantalPartijen: partijen.length, coalitieZetels: coalitieZetels, partijenLijst: partijen.join(", ")});
    }
}

function htmlOptie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.innerHTML = kolom;
        tr.appendChild(td);
    });
    return tr;
}

function htmlLink(link, tekst, tabblad) {
    const a = document.createElement("a");
    if (tekst) {
        a.appendChild(document.createTextNode(tekst));
    }
    a.href = link;
    if (tabblad) { // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
        a.target = "_blank";
        a.rel = "noopener noreferrer"
    }
    return a;
}

function htmlPlaatje(plaatje, breed, hoog) {
    const img = document.createElement("img");
    img.src = plaatje;
    img.width = breed;
    img.height = hoog;
    return img;
}
