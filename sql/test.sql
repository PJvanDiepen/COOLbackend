use waagtoren;

select * from ronde where tegenstander regexp "attaqueer"; 
 
describe ronde; 

select * from gebruiker where mutatieRechten > 1;
 
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7904589, 1911, '2024-09-01', 1911, "int", "ira", "", "", "", 0, 0, 0), -- Wim Nieland
(0, "2425", "int", "", "", 8851073, 1229, '2024-09-01', 1229, "int", "ira", "", "", "", 0, 0, 0), -- Frans Wolfkamp
(0, "2425", "int", "", "", 6225934, 1916, '2024-09-01', 1916, "int", "ira", "", "", "", 0, 0, 0); -- Ruud Adema

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 6335670, 2075, '2024-09-01', 2075, "int", "ira", "", "", "", 0, 0, 0); -- Herbert Perez Garcia

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8400183, 1852, '2024-09-01', 1852, "int", "ira", "", "", "", 0, 0, 0); -- Daan de Vetten

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7359913, 2527, '2024-09-01', 2527, "int", "ira", "", "", "", 0, 0, 0), -- Dimitri Reinderman
(0, "2425", "int", "", "", 7584566, 2314, '2024-09-01', 2314, "int", "ira", "", "", "", 0, 0, 0), -- Yong Hoon de Rover
(0, "2425", "int", "", "", 7657342, 2290, '2024-09-01', 2290, "int", "ira", "", "", "", 0, 0, 0), -- Frank van Tellingen
(0, "2425", "int", "", "", 8285574, 2195, '2024-09-01', 2195, "int", "ira", "", "", "", 0, 0, 0), -- Maaike Keetman
-- (0, "2425", "int", "", "", 7778100, 2153, '2024-09-01', 2153, "int", "ira", "", "", "", 0, 0, 0); -- Arlette van Weersel
(0, "2425", "int", "", "", 7828183, 2125, '2024-09-01', 2125, "int", "ira", "", "", "", 0, 0, 0), -- Rob Konijn
(0, "2425", "int", "", "", 7468417, 2065, '2024-09-01', 2065, "int", "ira", "", "", "", 0, 0, 0); -- Daan Geerke

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

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7504310, 1660, '2024-09-01', 1660, "int", "ira", "", "", "", 0, 0, 0); -- Leonard Haakman

select * from persoon where knsbNummer = 8182416;
update persoon set knsbNummer = 9045388 where knsbNummer = 169;

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8966133, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0), -- Julian Huisman
(0, "2425", "int", "", "", 9040845, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0), -- Kristian Huisman
(0, "2425", "int", "", "", 9045388, 0, '2024-09-01', 1500, "int", "", "", "", "", 0, 0, 0); -- Jelle Koopmans

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8744494, 1660, '2024-09-01', 1660, "int", "ira", "", "", "", 0, 0, 0); -- Joris Hartog

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7778100, 2153, '2024-09-01', 2153, "int", "ira", "", "", "", 0, 0, 0); -- Arlette van Weersel

select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "n1";
delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "n1";


insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 8484443, 1895, '2024-09-01', 1895, "int", "ira", "", "", "", 0, 0, 0); -- Chaim Bookelman

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 7504310, 1812, '2024-09-01', 1812, "int", "ira", "", "", "", 0, 0, 0); -- Leonard Haakman

select * from gebruiker where knsbNummer = 8485059;

update gebruiker set mutatieRechten = 2 where knsbNummer = 7399469;




describe speler;

select * from team where clubCode = 0 and seizoen = "2425";
select * from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
select * from uitslag where clubCode = 0 and seizoen = "2425" and datum < "2024-09-01";


delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from ronde where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");
delete from team where clubCode = 0 and seizoen = "2425" and teamCode in ("nbb", "nbe", "nbz");

select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "int" and partij in ("m", "n", "p");

update uitslag set partij = "n" where clubCode = 0 and seizoen = "2425" and teamCode = "int" and partij = "p";




