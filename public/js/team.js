'use strict'

/*
team.html:
- h1 id="team"
- table id="uitslagen"

URL searchParams:
- team
- ronde?

in localStarage:
- schaakVereniging
- seizoen
 */

const params = (new URL(document.location)).searchParams;
const teamNaam = document.getElementById('team');
teamNaam.innerHTML = teamVoluit(params.get('team'));
const rondeNummer = params.get('ronde');

const api = document.location.origin + "/api";

function teamVoluit(teamCode) {
    return localStorage.getItem("schaakVereniging") + " " + teamCode;
}
