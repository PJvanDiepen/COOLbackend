"use strict";

const tk = [
    {jaar: 2002,
        zetels: "CDA=43&LPF=26&VVD=24&PvdA=23&GL=10&SP=9&D66=7&CU=4&SGP=2&LN=2",
        kabinet: "Balkenende1",
        coalitie: "CDA, LPF, VVD",
        breed: 1280,
        hoog: 720,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Balkenende_I"
    },
    {jaar: 2003,
        zetels: "CDA=44&PvdA=42&VVD=28&SP=9&LPF=8&GL=8&D66=6&CU=3&SGP=2",
        kabinet: "Balkenende2",
        coalitie: "CDA, VVD, D66",
        breed: 1280,
        hoog: 754,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Balkenende_II"
    },
    {jaar: 2006,
        zetels: "CDA=41&PvdA=33&SP=25&VVD=22&PVV=9&GL=7&CU=6&D66=3&PvdD=2&SGP=2",
        kabinet: "Balkenende4",
        coalitie: "CDA, PvdA, CU",
        breed: 960,
        hoog: 629,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Balkenende_IV"
    },
    {jaar: 2010,
        zetels: "VVD=31&PvdA=30&PVV=24&CDA=21&SP=15&D66=10&GL=10&CU=5&SGP=2&PvdD=2",
        kabinet: "Rutte1",
        coalitie: "VVD, CDA",
        breed: 1280,
        hoog: 658,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Rutte_I"
    },
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
        kabinet: "Onbekend",
        coalitie: "peilingwijzer",
        breed: 600,
        hoog: 430,
        link: "https://peilingwijzer.tomlouwerse.nl/p/laatste-cijfers.html"
    }
]

function jarenVerwerken(jaren) {
    let komma = " ";
    for (const verkiezing of tk) {
        jaren.appendChild(htmlLink("tk.html?jaar=" + verkiezing.jaar, komma + verkiezing.jaar));
        komma = ", ";
    }
}

const pagina = new URL(location);
const params = new URLSearchParams(pagina.search);
const jaar = jaarVerwerken();
console.log(jaar);

function jaarVerwerken() {
    const jaar = Number(params.get("jaar"));
    if (jaar) {
        sessionStorage.clear();
        sessionStorage.setItem("jaar", jaar);
        return jaar;
    }
    return sessionStorage.getItem("jaar") || tk[tk.length - 1].jaar;
}

function klikVerwerken() {
    const partij = params.get("klik");
    if (sessionStorage.getItem(partij)) {
        sessionStorage.removeItem(partij);
    } else {
        sessionStorage.setItem(partij,"klik");
    }
}

const lijsten = [];
const kabinetten = [];

function uitslagenVerwerken(kabinet, plaatje, kop, deLijsten) {
    let i= 0;
    while (jaar > tk[i].jaar) {
        i++;
    }
    kop.innerHTML = "Zetels per partij in " + jaar;
    kabinet.appendChild(htmlLink(tk[i].link, tk[i].kabinet+": "+tk[i].coalitie, true));
    plaatje.appendChild(htmlPlaatje("images/tk/"+tk[i].kabinet+".jpg", tk[i].breed, tk[i].hoog));
    const uitslagen = new URLSearchParams(tk[i].zetels);
    for (const [partij, zetels] of uitslagen) {
        console.log(partij + " = " + zetels);
        const wel = Number(zetels) > 1 && !sessionStorage.getItem(partij);
        lijsten.push({partij: partij, zetels: Number(zetels), wel: wel, coalitie: false});
    }
    let nummer = 0;
    for (const lijst of lijsten) {
        deLijsten.appendChild(htmlRij(
            ++nummer,
            lijst.partij,
            lijst.zetels,
            htmlLink("tk.html?klik=" + lijst.partij, lijst.wel ? "✔" : "_")));
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
            if (lijsten[vanaf].wel) {
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

function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        if (kolom.nodeType === Node.ELEMENT_NODE) {
            td.appendChild(kolom);
        } else {
            td.innerHTML = kolom;
        }
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
