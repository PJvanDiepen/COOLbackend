"use strict";

const pagina = new URL(location);
const uitslagen = new URLSearchParams(pagina.searchParams);
const lijsten = [];
const deLijsten = document.getElementById("lijsten");
let nummer = 0;
for (const [partij, zetels] of uitslagen) {
    if (partij.startsWith("_")) { // TODO test leeg
        deLijsten.appendChild(rij("", "klik op een Tweede Kamer Verkiezing", ""));
    } else {
        lijsten.push({partij: partij, zetels: Number(zetels), coalitie: false});
        deLijsten.appendChild(rij(++nummer, partij, zetels));
    }
}
const kabinetten = [];
kabinet(0, 0);
const deKabinetten = document.getElementById("kabinetten");
nummer = 0;
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
    deKabinetten.appendChild(rij(++nummer, kabinetten[i].partijenLijst, kabinetten[i].aantalPartijen, kabinetten[i].coalitieZetels));
    kabinetten.splice(i,1);
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

function rij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.innerHTML = kolom;
        tr.appendChild(td);
    });
    return tr;
}
