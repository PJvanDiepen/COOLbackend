"use strict";

const tk = [
    {jaar: 1956,
        zetels: "PvdA=50&KVP=49&ARP=15&VVD=13&CHU=13&CPN=7&SGP=3",
        kabinet: "Drees3",
        coalitie: "PvdA, KVP, ARP, CHU",
        breed: 732,
        hoog: 555,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Drees_III"
    },
    {jaar: 1958,
        verkiezing: 1956,
        kabinet: "Beel2",
        coalitie: "KVP, ARP, CHU",
        breed: 3243,
        hoog: 2006,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Beel_II"
    },
    {jaar: 1959,
        zetels: "KVP=49&PvdA=48&VVD=19&ARP=14&CHU=12&CPN=3&SGP=3&PSP=2",
        kabinet: "DeQuay",
        coalitie: "KVP, VVD, ARP, CHU",
        breed: 3064,
        hoog: 1960,
        link: "https://nl.wikipedia.org/wiki/Kabinet-De_Quay"
    },
    {jaar: 1963,
        zetels: "KVP=50&PvdA=43&VVD=16&ARP=13&CHU=13&PSP=4&CPN=4&SGP=3&BP=3&GPV=1",
        kabinet: "Marijnen",
        coalitie: "KVP, VVD, ARP, CHU",
        breed: 3005,
        hoog: 1737,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Marijnen"
    },
    {jaar: 1965,
        verkiezing: 1963,
        kabinet: "Cals",
        coalitie: "KVP, PvdA, ARP",
        breed: 768,
        hoog: 582,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Cals"
    },
    {jaar: 1966,
        verkiezing: 1963,
        kabinet: "Zijlstra",
        coalitie: "KVP, ARP",
        breed: 901,
        hoog: 452,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Zijlstra"
    },
    {jaar: 1967,
        zetels: "KVP=42&PvdA=37&VVD=17&ARP=15&CHU=12&BP=7&D’66=7&CPN=5&PSP=4&SGP=3&GPV=1",
        kabinet: "DeJong",
        coalitie: "KVP, VVD, ARP, CHU",
        breed: 3268,
        hoog: 1636,
        link: "https://nl.wikipedia.org/wiki/Kabinet-De_Jong"
    },
    {jaar: 1971,
        zetels: "PvdA=39&KVP=35&VVD=16&ARP=13&D’66=11&CHU=10&DS'70=8&CPN=6&SGP=3&PPR=2&GPV=2&NMP=2&PSP=2&BP=1",
        kabinet: "Biesheuvel1",
        coalitie: "KVP, VVD, ARP, CHU, DS'70",
        breed: 3388,
        hoog: 1624,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Biesheuvel_I"
    },
    {jaar: 1972,
        verkiezing: 1971,
        kabinet: "Biesheuvel2",
        coalitie: "KVP, VVD, ARP, CHU",
        breed: 3684,
        hoog: 2451,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Biesheuvel_II"
    },
    {jaar: 1972.1,
        zetels: "PvdA=43&KVP=27&VVD=22&ARP=14&PPR=7&CHU=7&CPN=7&D’66=6&DS'70=6&SGP=3&BP=3&GPV=2&PSP=2&RKPN=1",
        kabinet: "DenUyl",
        coalitie: "PvdA, KVP, ARP, PPR, D'66",
        breed: 2656,
        hoog: 1234,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Den_Uyl"
    },
    {jaar: 1977,
        zetels: "PvdA=53&CDA=49&VVD=28&D’66=8&SGP=3&PPR=3&CPN=2&GPV=1&PSP=1&BP=1&DS'70=1",
        kabinet: "VanAgt1",
        coalitie: "CDA, VVD",
        breed: 2922,
        hoog: 1887,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Van_Agt_I"
    },
    {jaar: 1981,
        zetels: "CDA=48&PvdA=44&VVD=26&D’66=17&PSP=3&CPN=3&SGP=3&PPR=3&RPF=2&GPV=1",
        kabinet: "VanAgt2",
        coalitie: "CDA, PvdA, D'66",
        breed: 1022,
        hoog: 632,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Van_Agt_II"
    },
    {jaar: 1982,
        verkiezing: 1981,
        kabinet: "VanAgt3",
        coalitie: "CDA, D'66",
        breed: 1180,
        hoog: 884,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Van_Agt_III"
    },
    {jaar: 1982.1,
        zetels: "PvdA=47&CDA=45&VVD=36&D66=6&PSP=3&SGP=3&CPN=3&PPR=2&RPF=2&CP=1&GPV=1&EVP=1",
        kabinet: "Lubbers1",
        coalitie: "CDA, VVD",
        breed: 738,
        hoog: 476,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Lubbers_I"
    },
    {jaar: 1986,
        zetels: "CDA=54&PvdA=52&VVD=27&D66=9&SGP=3&PPR=2&PSP=1&GPV=1&RPF=1",
        kabinet: "Lubbers2",
        coalitie: "CDA, PvdA",
        breed: 1280,
        hoog: 791,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Lubbers_II"
    },
    {jaar: 1989,
        zetels: "CDA=54&PvdA=49&VVD=22&D66=12&GL=6&SGP=3&GPV=2&RPF=1&CD=1",
        kabinet: "Lubbers3",
        coalitie: "CDA, PvdA",
        breed: 792,
        hoog: 429,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Lubbers_III"
    },
    {jaar: 1994,
        zetels: "PvdA=37&CDA=34&VVD=31&D66=24&AOV=6&GL=5&CD=3&RPF=3&SGP=2&GPV=2&SP=2&Unie55plus=1",
        kabinet: "Kok1",
        coalitie: "PvdA, VVD, D66",
        breed: 1280,
        hoog: 625,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Kok_I"
    },
    {jaar: 1998,
        zetels: "PvdA=45&VVD=38&CDA=29&D66=14&GL=11&SP=5&RPF=3&SGP=3&GPV=2",
        kabinet: "Kok2",
        coalitie: "PvdA, VVD, D66",
        breed: 429,
        hoog: 317,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Kok_II"
    },
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
        verkiezing: 2003,
        kabinet: "Balkenende3",
        coalitie: "CDA, VVD",
        breed: 960,
        hoog: 637,
        link: "https://nl.wikipedia.org/wiki/Kabinet-Balkenende_III"
    },
    {jaar: 2006.1,
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
        zetels: "VVD=35&D66=27&PVV=17&CDA=14&PvdA=9&GL=8&SP=8&FvD=7&PvdD=6&Volt=4&SGP=3&JA21=3&Denk=2&CU=1&50plus=1&BBB=1&Bij1=n",
        kabinet: "Nog geen kabinet",
        breed: 600,
        hoog: 338,
        link: "https://www.ipsos.com/nl-nl/tweede-kamerverkiezing-2021-de-exitpoll"
    }
]

function jarenVerwerken(jaren) {
    const laatsteJaar = tk[tk.length - 1].jaar;
    for (const kabinet of tk) {
        jaren.appendChild(htmlLink(
            "tk.html?jaar=" + kabinet.jaar,
            " " + Math.round(kabinet.jaar) + (kabinet.verkiezing ? "*" : "") + (kabinet.jaar < laatsteJaar ? "," : ".")));
    }
}

const pagina = new URL(location);
const params = new URLSearchParams(pagina.search);
const jaar = jaarVerwerken();

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
    if (partij) {
        if (sessionStorage.getItem(partij)) {
            sessionStorage.removeItem(partij);
        } else {
            sessionStorage.setItem(partij,"klik");
        }
    }
}

const DEEL = 55; // plaatje als percentage van window
const lijsten = [];
const kabinetten = [];

function uitslagenVerwerken(kabinet, plaatje, kop, deLijsten) {
    let i = jaarIndex(jaar);
    kop.innerHTML = "Zetels per partij in " + Math.round(jaar);
    const coalitie = tk[i].coalitie ? ": " + tk[i].coalitie : "";
    kabinet.appendChild(htmlLink(tk[i].link, tk[i].kabinet + coalitie, true));
    plaatje.appendChild(htmlPlaatje("images/tk/"+tk[i].kabinet+".jpg", DEEL, tk[i].breed, tk[i].hoog));
    const uitslagen = new URLSearchParams(tk[tk[i].verkiezing ? jaarIndex(tk[i].verkiezing) : i].zetels);
    for (const [partij, zetels] of uitslagen) {
        const wel = Number(zetels) > 1 && !sessionStorage.getItem(partij);
        lijsten.push({partij: partij, zetels: Number(zetels), wel: wel, coalitie: false});
    }
    let nummer = 0;
    let kamer = 0;
    for (const lijst of lijsten) {
        kamer = kamer + lijst.zetels;
        deLijsten.appendChild(htmlRij(
            ++nummer,
            lijst.partij,
            lijst.zetels,
            htmlLink("tk.html?klik=" + lijst.partij, lijst.wel ? "✔" : "_")));
    }
    console.assert(kamer === 150, "kamer = " + kamer);
}

function jaarIndex(jaar) {
    let index = 0;
    while (jaar > tk[index].jaar) {
        index++;
    }
    return index;
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

function htmlPlaatje(plaatje, percentage, breed, hoog) {
    const img = document.createElement("img");
    img.src = plaatje;
    const factor = (window.innerWidth * percentage / 100) / breed; // percentage maximale breedte
    if (factor > 1.0) {
        img.width = breed;
        img.height = hoog;
    } else {
        img.width = Math.round(breed * factor);
        img.height = Math.round(hoog * factor);
    }
    img.width = Math.round(breed * factor);
    img.height = Math.round(hoog * factor);
    return img;
}