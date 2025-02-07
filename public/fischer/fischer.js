"use strict";

const A1 = 0;
const B1 = 1;
const C1 = 2;
const D1 = 3;
const E1 = 4;
const F1 = 5;
const G1 = 6;
const H1 = 7;

// https://www.chessprogramming.org/Pieces
const KONING = "\u2654";
const DAME = "\u2655";
const TOREN = "\u2656";
const LOPER = "\u2657";
const PAARD = "\u2658";

const velden = [];
for (const veld of ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]) {
    velden.push(document.getElementById(veld));
}

function kiesEen(uitAantal) {
    return uitAantal.splice(Math.floor(Math.random() * uitAantal.length), 1);
}

const zwarteVelden = [A1, C1, E1, G1];
velden[kiesEen(zwarteVelden)].textContent = LOPER;

const witteVelden = [B1, D1, F1, H1];
velden[kiesEen(witteVelden)].textContent = LOPER;

const restVelden = [...zwarteVelden, ...witteVelden];
velden[kiesEen(restVelden)].textContent = DAME;
velden[kiesEen(restVelden)].textContent = PAARD;
velden[kiesEen(restVelden)].textContent = PAARD;

restVelden.sort();
velden[restVelden[0]].textContent = TOREN;
velden[restVelden[1]].textContent = KONING;
velden[restVelden[2]].textContent = TOREN;