use waagtoren;
 
describe gebruiker; 

select * from gebruiker where mutatieRechten > 1;
 
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7904589, 1911, '2024-09-01', 1911, "int", "ira", "", "", "", 0, 0, 0), -- Wim Nieland
(0, "2425", "int", "", "", 8851073, 1229, '2024-09-01', 1229, "int", "ira", "", "", "", 0, 0, 0), -- Frans Wolfkamp
(0, "2425", "int", "", "", 6225934, 1916, '2024-09-01', 1916, "int", "ira", "", "", "", 0, 0, 0); -- Ruud Adema

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8851073, 1229, '2024-09-01', 1229, "int", "ira", "", "", "", 0, 0, 0); -- Frans Wolfkamp

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7468362, 1907, '2024-09-01', 1907, "", "", "", "", "", 0, 0, 0), -- Paul Toepoel
(0, "2425", "int", "", "", 7535385, 1854, '2024-09-01', 1854, "", "", "", "", "", 0, 0, 0), -- Marten Coerts
(0, "2425", "int", "", "", 8096242, 2154, '2024-09-01', 2154, "", "", "", "", "", 0, 0, 0), -- Michaël van Liempt
(0, "2425", "int", "", "", 7707832, 2040, '2024-09-01', 2040, "", "", "", "", "", 0, 0, 0), -- Ronald Groot
(0, "2425", "int", "", "", 8587337, 1921, '2024-09-01', 1921, "", "", "", "", "", 0, 0, 0); -- Max Hooijmans

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8182416, 1736, '2024-09-01', 1736, "", "", "", "", "", 0, 0, 0), -- Andre Bremmers
(0, "2425", "int", "", "", 8472530, 1624, '2024-09-01', 1624, "", "", "", "", "", 0, 0, 0), -- Rosa Leek
(0, "2425", "int", "", "", 7809285, 1835, '2024-09-01', 1835, "", "", "", "", "", 0, 0, 0); -- Albert van der Meiden

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8744494, 1660, '2024-09-01', 1660, "int", "ira", "", "", "", 0, 0, 0); -- Joris Hartog

select * from persoon where knsbNummer = 169;
update persoon set knsbNummer = 9045388 where knsbNummer = 169;

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8966133, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0), -- Julian Huisman
(0, "2425", "int", "", "", 9040845, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0), -- Kristian Huisman
(0, "2425", "int", "", "", 9045388, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0); -- Jelle Koopmans

select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "n1";
delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "n1";


insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8484443, 1895, '2024-09-01', 1895, "int", "ira", "", "", "", 0, 0, 0); -- Chaim Bookelman

select * from gebruiker where knsbNummer = 8851073;

describe speler;

select * from team where clubCode = 0 and seizoen = "2425";
select * from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and datum < "2024-09-01";


delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from team where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");



