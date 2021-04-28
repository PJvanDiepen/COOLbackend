"use strict";

actieSelecteren(document.getElementById("actieSelecteren"),
    hamburgerMenu,
    naarAgenda,
    naarRanglijst,
    terugNaar
);

alert("test!");

document.getElementById("naam").value = naam;
document.getElementById("knsbNummer").value = speler;
let form = document.querySelector("form");
form.addEventListener("submit", function (event) {
    alert("test!!! " + event);
    console.log("Saving value", form.elements.value.value);
    event.preventDefault();
});