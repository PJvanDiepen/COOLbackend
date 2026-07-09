use waagtoren;

select * from team where 

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7904589, 1911, '2024-09-01', 1911, "int", "ira", "", "", "", 0, 0, 0), -- Wim Nieland
(0, "2425", "int", "", "", 8851073, 1229, '2024-09-01', 1229, "int", "ira", "", "", "", 0, 0, 0), -- Frans Wolfkamp
(0, "2425", "int", "", "", 6225934, 1916, '2024-09-01', 1916, "int", "ira", "", "", "", 0, 0, 0); -- Ruud Adema

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8851073, 1229, '2024-09-01', 1229, "int", "ira", "", "", "", 0, 0, 0); -- Frans Wolfkamp

select * from gebruiker where knsbNummer = 8851073;

describe speler;

select * from team where clubCode = 0 and seizoen = "2425";
select * from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and datum < "2024-09-01";


delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from team where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");



