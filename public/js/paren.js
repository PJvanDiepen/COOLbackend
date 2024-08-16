"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import {o_o_o, init, ranglijst} from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>

    terug naar indelen.html
 */
const rondeNummer = Number(html.params.get("ronde"));
const witSpeler   = Number(html.params.get("wit"));
const zwartSpeler = Number(html.params.get("zwart"));

(async function() {
    await init();
    db.competitieTitel();
    const totDatum = o_o_o.ronde[rondeNummer].datum;
    html.id("subkop").textContent =
        `Handmatig indelen ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar({datum: totDatum})}`;
    const partijen = html.id("partijen");
    let bordNummer = 0;
    const paren = await zyq.serverFetch(`/${zyq.uuidToken}/${db.key(o_o_o.ronde[rondeNummer])}/paren`);
    if (paren.length) {
        for (const paar of paren) {
            bordNummer = paar.bordNummer;
            partijen.append(html.rij(bordNummer, paar.wit, paar.zwart, await eventueelVerwijderen(paar)));
        }
    }
    const spelers = (await ranglijst(rondeNummer)).filter(function (speler) {
        if (speler.knsbNummer === witSpeler || speler.knsbNummer === zwartSpeler) {
            return false;
        } else {
            for (const paar of paren) {
                if (speler.knsbNummer === paar.knsbNummer || speler.knsbNummer === paar.tegenstanderNummer) {
                    return false;
                }
            }
            return true; // voorlopig iedereen TODO indien deelnemer db.inCompetitie()
        }
    }).map(function (speler) {
        return [speler, speler.naam];
    });
    bordNummer++;
    const witKnop = await spelerSelecteren(bordNummer,true, spelers);
    const zwartKnop = await spelerSelecteren(bordNummer, false, spelers);
    partijen.append(html.rij(bordNummer, witKnop, zwartKnop, ""));
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
})();

async function eventueelVerwijderen(paar) {
    const knop = document.createElement("select");
    const opties = [[0, ""], [paar, "verwijder partij", async function (paar) {
        const mutaties = await zyq.serverFetch(
            `/${zyq.uuidToken}/${db.key(o_o_o.ronde[rondeNummer])}/${paar.knsbNummer}/los/${paar.bordNummer}/${paar.tegenstanderNummer}`);
        if (mutaties) {
            html.zelfdePagina(`ronde=${rondeNummer}`);
        } else {
            console.log(`Partij ${wit.knsbNummer} tegen ${zwart.knsbNummer} verwijderen is mislukt.`);
        }
    }]];
    html.selectie(knop, 0, opties);
    return knop;
}

async function spelerSelecteren(bordNummer, metWit, spelers) {
    const naam = html.params.get("naam");
    if (metWit && witSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: witSpeler});
    } else if (!metWit && zwartSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: zwartSpeler});
    }
    const knop = document.createElement("select");
    html.selectie(knop, 0, [[0,"selecteer speler"], ...spelers], async function (speler) {
        if (metWit && zwartSpeler) {
            await paarWitZwart(bordNummer, speler, {naam: naam, knsbNummer: zwartSpeler});
        } else if (!metWit && witSpeler) {
            await paarWitZwart(bordNummer, {naam: naam, knsbNummer: witSpeler}, speler);
        } else {
            const kleur = metWit ? "wit" : "zwart";
            html.zelfdePagina(`ronde=${rondeNummer}&${kleur}=${speler.knsbNummer}&naam=${speler.naam}`);
        }
    });
    return knop;
}

async function paarWitZwart(bordNummer, wit, zwart) {
    const mutaties = await zyq.serverFetch(
        `/${zyq.uuidToken}/${db.key(o_o_o.ronde[rondeNummer])}/${wit.knsbNummer}/paar/${bordNummer}/${zwart.knsbNummer}`);
    if (mutaties) {
        html.zelfdePagina(`ronde=${rondeNummer}`);
    } else {
        console.log(`Handmatig indelen ${wit.knsbNummer} tegen ${zwart.knsbNummer} is mislukt.`);
    }
}