use waagtoren; -- ga naar TODO
set @seizoen = "2526";

-- actieve gebruikers
select distinct m.knsbNummer, naam from mutatie m join persoon p on p.knsbNummer = m.knsbNummer order by naam;   

-- TODO issue #37 afwezig en externe wedstrijd op dinsdag

-- aantal interne uitslagen per speler per seizoen
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where clubCode = 0 and seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;

set @seizoen = '1819'; -- TODO Han Rauws en Bob de Mon 26
set @seizoen = '1920'; -- TODO 19, 18, 17, 16, 15, 13, 10, 8, 1
set @seizoen = '2122'; -- TODO 24, 23, 22, 21, 20
set @seizoen = '2223'; -- TODO 32, 31, 30, 29

with 
  e as (select * from uitslag where competitie = "int" and partij = "e")
select p.naam, u.teamCode, u.rondeNummer, u.partij, e.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
join e on u.clubCode = e.clubCode and u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
where u.clubCode = 0 and u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

with
  e as (select * from uitslag where competitie = "int" and partij = "e")
update uitslag u
join e on u.clubCode = e.clubCode and u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
set u.partij = "e"
where u.clubCode = 0 and u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

-- externe partijen op andere datums dan de wedstrijd
select p.naam, r.uithuis, r.tegenstander, r.datum, u.* from uitslag u
join ronde r on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.anderTeam and u.datum <> r.datum; 

select * from uitslag where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
select * from ronde where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
update uitslag set datum = '2022-04-26' where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 

-- externe partijen zonder uitslag
select p.naam, u.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
where clubCode = 0 and seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

delete from uitslag
where clubCode = 0 and seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

-- issue #46 hack
insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2324", "int", 34, "t", "", '2024-06-30');

delete from ronde where clubCode = 0 and seizoen = "2324" and teamCode = "int" and rondeNummer = 34; 

-- aantal rating leden per maand 
select maand, jaar, count(*) leden from rating group by maand, jaar;

-- TODO wijzig datum externe wedstrijd
set @seizoen = '2526';
set @team = 'n1';
set @ronde = 1;
set @datum = '2025-10-10';

select * from ronde where clubCode = 0 and seizoen = @seizoen and teamCode = @team;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

update ronde set datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
update uitslag set partij = "p", datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde; 

-- TODO partij wijzigen
set @seizoen = '2526';
set @team = 'int';
set @competitie = 'int';
set @ronde = 6;
set @bord = 25;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit   = 7084022; -- John Kramer
set @zwart = 8350738; -- Ramon Witte

select * from persoon where knsbNummer = @wit;

set @oneven = 7824674; -- Guido Florijn
set @afwezig = 7399469; -- Nico Mak
set @extern = 7758014; -- Alex

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

-- TODO partij wijzigen

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer in(193, 194);

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- teams
select * from team where clubCode = 0 and seizoen = @seizoen;

insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values
(0, "2526", "", 0, 0, 0, "", "", "geen", 0, 0),
(0, "2526", "0", 0, 0, 0, "k", "", "KNSB bij andere schaakvereniging", 0, 0),
(0, "2526", "1", 0, 0, 0, "k", "2b", "KNSB 2B", 10, 0),
(0, "2526", "2", 0, 0, 0, "k", "3c", "KNSB 3C", 10, 0),
(0, "2526", "3", 0, 0, 0, "k", "4d", "KNSB 4D", 10, 0),
(0, "2526", "4", 0, 0, 0, "k", "6h", "KNSB 6H", 10, 0),
(0, "2526", "5", 0, 0, 0, "k", "6g", "KNSB 6G", 10, 0),
(0, "2526", "6", 0, 0, 0, "k", "6f", "KNSB 6F", 10, 0),
(0, "2526", "int", 3, 0, 0, "i", "nt", "interne competitie", 0, 0),
(0, "2526", "ira", 4, 0, 0, "i", "ra", "rapid competitie", 0, 0),
(0, "2526", "kbe", 0, 0, 0, "k", "be", "KNSB beker", 4, 0),
(0, "2526", "n1", 0, 0, 0, "n", "t", "NHSB T", 8, 0),
(0, "2526", "n2", 0, 0, 0, "n", "1a", "NHSB 1A", 8, 0),
(0, "2526", "n3", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2526", "n4", 0, 0, 0, "n", "2b", "NHSB 2B", 6, 0),
(0, "2526", "n5", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2526", "nbb", 0, 0, 0, "n", "b", "Brons", 4, 0),
(0, "2526", "nbe", 0, 0, 0, "n", "b", "Goud", 4, 0),
(0, "2526", "nbz", 0, 0, 0, "n", "b", "Zilver", 4, 0);

set @seizoen = "2526";
set @team = "1";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7584566, 7657342, 7428960, 7970094, 8096242, 7828183, 7468417,	7099950); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7584566, 7657342, 7428960, 7970094, 8096242, 7828183, 7468417, 7099950); 

set @seizoen = "2526";
set @team = "2";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(5968611, 7613166, 7129991, 7707832, 6335670, 7509920, 8112654, 8587337); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(5968611, 7613166, 7129991, 7707832, 6335670, 7509920, 8112654, 8587337); 

set @seizoen = "2526";
set @team = "3";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(9065100, 6207520, 7665834, 8484443, 6572511, 6930957, 9056674, 8400183); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(9065100, 6207520, 7665834, 8484443, 6572511, 6930957, 9056674, 8400183); 

set @seizoen = "2526";
set @team = "4";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7546506, 7282033, 7809285, 7699010, 7904589, 7504310, 7758014, 7519930); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7546506, 7282033, 7809285, 7699010, 7904589, 7504310, 7758014, 7519930); 

set @seizoen = "2526";
set @team = "5";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7269900, 6951362, 7443172, 6212404, 7399469, 8182416, 8073978, 8472530); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7269900, 6951362, 7443172, 6212404, 7399469, 8182416, 8073978, 8472530); 

set @seizoen = "2526";
set @team = "6";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(8224502, 7321534, 9077651, 9023234, 7691728, 8978717, 7777715, 7771665); 

update speler set knsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(8224502, 7321534, 9077651, 9023234, 7691728, 8978717, 7777715, 7771665);

set @seizoen = "2526";
set @team = "n1";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7428960, 7970094, 8096242, 5968611, 7613166, 7129991, 7707832, 8587337); 

update speler set nhsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7428960, 7970094, 8096242, 5968611, 7613166, 7129991, 7707832, 8587337);

set @seizoen = "2526";
set @team = "n2";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7099950, 9065100, 8112654, 6207520, 8484443, 7824674); 

update speler set nhsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7099950, 9065100, 8112654, 6207520, 8484443, 7824674);

set @seizoen = "2526";
set @team = "n3";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(6565801, 6930957, 7468362, 9056674, 7529522, 7731812); 

update speler set nhsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(6565801, 6930957, 7468362, 9056674, 7529522, 7731812);

set @seizoen = "2526";
set @team = "n4";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7546506, 7282033, 7758014, 7210137, 6214153, 6212404); 

update speler set nhsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7546506, 7282033, 7758014, 7210137, 6214153, 6212404);

set @seizoen = "2526";
set @team = "n5";
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = @seizoen and s.knsbNummer in(7399469, 8276752, 8485059, 7101193, 7519930, 7321534); 

update speler set nhsbTeam = @team 
where seizoen = @seizoen and knsbNummer in(7399469, 8276752, 8485059, 7101193, 7519930, 7321534);

-- ronde
select * from ronde where clubCode = 0 and seizoen = @seizoen;
delete from ronde where clubCode = 0 and seizoen = @seizoen;

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "1", 1, "u", "Promotie 1", '2025-09-20'),
(0, "2526", "1", 2, "t", "Spijkenisse 1", '2025-10-04'),
(0, "2526", "1", 3, "u", "Kennemer Combinatie 2", '2025-11-01'),
(0, "2526", "1", 4, "t", "Caissa-Eenhoorn 2", '2025-11-22'),
(0, "2526", "1", 5, "u", "VAS 2", '2025-12-13'),
(0, "2526", "1", 6, "t", "Leiderdorp 1", '2026-01-10'),
(0, "2526", "1", 7, "t", "CSV 1", '2026-02-07'),
(0, "2526", "1", 8, "u", "De Wijker Toren 1", '2026-03-07'),
(0, "2526", "1", 9, "t", "Philidor Leiden 1", '2026-04-11'),
(0, "2526", "2", 1, "u", "Caissa 2", '2025-09-20'),
(0, "2526", "2", 2, "t", "’t Saense Paard 1", '2025-10-04'),
(0, "2526", "2", 3, "u", "Zukertort Amstelveen 2", '2025-11-01'),
(0, "2526", "2", 4, "t", "Santpoort 1", '2025-11-22'),
(0, "2526", "2", 5, "u", "De Amstel 1", '2025-12-13'),
(0, "2526", "2", 6, "t", "Laurierboom-Gambiet 1", '2026-01-10'),
(0, "2526", "2", 7, "t", "Amsterdam West 1", '2026-02-07'),
(0, "2526", "2", 8, "u", "HWP Haarlem 2", '2026-03-07'),
(0, "2526", "2", 9, "t", "Emanuel Lasker 1", '2026-04-11'),
(0, "2526", "3", 1, "u", "Aartswoud 1", '2025-09-20'),
(0, "2526", "3", 2, "t", "Purmerend 2", '2025-10-04'),
(0, "2526", "3", 3, "u", "Zuidoost United 1", '2025-11-01'),
(0, "2526", "3", 4, "t", "Het Spaarne 1", '2025-11-22'),
(0, "2526", "3", 5, "u", "Opening '64 1", '2025-12-13'),
(0, "2526", "3", 6, "t", "Boven IJ / de Volewijckers 1", '2026-01-10'),
(0, "2526", "3", 7, "t", "Amsterdam West 2", '2026-02-07'),
(0, "2526", "3", 8, "u", "De Wijker Toren 2", '2026-03-07'),
(0, "2526", "3", 9, "t", "Philidor Leiden 2", '2026-04-11'),
(0, "2526", "4", 1, "t", "DSC Delft 6", '2025-10-04'),
(0, "2526", "4", 2, "u", "’t Saense Paard 4", '2025-11-01'),
(0, "2526", "4", 3, "t", "LSG 7", '2025-11-22'),
(0, "2526", "4", 4, "u", "Almere 4", '2025-12-13'),
(0, "2526", "4", 5, "t", "Kennemer Combinatie 5", '2026-01-10'),
(0, "2526", "4", 6, "t", "Amsterdam West 3", '2026-02-07'),
(0, "2526", "4", 7, "u", "DD 5", '2026-03-07'),
(0, "2526", "5", 1, "t", "Muider Schaakkring 1", '2025-10-04'),
(0, "2526", "5", 2, "u", "Zuidoost United 2", '2025-11-01'),
(0, "2526", "5", 3, "t", "De Queer Schaakclub 2", '2025-11-22'),
(0, "2526", "5", 4, "u", "VAS 9", '2025-12-13'),
(0, "2526", "5", 5, "t", "Kennemer Combinatie 6", '2026-01-10'),
(0, "2526", "5", 6, "t", "HWP Haarlem 7", '2026-02-07'),
(0, "2526", "5", 7, "u", "De Rode Loper 3", '2026-03-07'),
(0, "2526", "6", 1, "t", "Assendelft 1", '2025-10-04'),
(0, "2526", "6", 2, "u", "Purmerend 3", '2025-11-01'),
(0, "2526", "6", 3, "t", "Santpoort 3", '2025-11-22'),
(0, "2526", "6", 4, "u", "HHW Pietbulls 2", '2025-12-13'),
(0, "2526", "6", 5, "t", "Boven IJ / de Volewijckers 2", '2026-01-10'),
(0, "2526", "6", 6, "t", "Magnus 2", '2026-02-07'),
(0, "2526", "6", 7, "u", "HWP Haarlem 6", '2026-03-07');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "n1", 1, "t", "Opening 64 N1", '2025-09-23'),
(0, "2526", "n1", 2, "u", "Wijker Toren N1", '2025-10-16'),
(0, "2526", "n1", 3, "u", "HWP Haarlem N1", '2025-11-11'),
(0, "2526", "n1", 4, "t", "Chess Society Zandvoort N1", '2025-12-02'),
(0, "2526", "n1", 5, "u", "Bloemendaal N1", '2026-01-07'),
(0, "2526", "n1", 6, "t", "Purmerend N1", '2026-02-10'),
(0, "2526", "n1", 7, "u", "Santpoort N1", '2026-03-10'),
(0, "2526", "n1", 8, "t", "Caïssa-Eenhoorn N1", '2026-03-31'),
(0, "2526", "n1", 9, "u", "'t Saense Paard N1", '2026-04-17'),
(0, "2526", "n2", 1, "u", "Noordk. Comb. Magnus N1", '2025-09-26'),
(0, "2526", "n2", 2, "t", "Caïssa-Eenhoorn N2", '2025-10-14'),
(0, "2526", "n2", 3, "t", "Aartswoud N1", '2025-11-11'),
(0, "2526", "n2", 4, "u", "Schaakmat N1", '2025-12-02'),
(0, "2526", "n2", 5, "t", "Krommenie N1", '2026-02-10'),
(0, "2526", "n2", 6, "u", "Aris de Heer N1", '2026-03-09'),
(0, "2526", "n2", 7, "t", "Opening 64 N2", '2026-03-31'),
(0, "2526", "n3", 1, "u", "NKC MSC 2", '2025-09-30'),
(0, "2526", "n3", 2, "t", "Koedijk N1", '2025-10-28'),
(0, "2526", "n3", 3, "t", "De Waagtoren N5", '2025-11-18'),
(0, "2526", "n3", 4, "u", "HHW Pietbulls N1", '2025-12-11'),
(0, "2526", "n3", 5, "t", "Bergen N1", '2026-02-03'),
(0, "2526", "n3", 6, "u", "En Passant N", '2026-03-14'),
(0, "2526", "n3", 7, "t", "Oppositie N1", '2026-04-07'),
(0, "2526", "n4", 1, "t", "'t Saense Paard N3", '2025-09-30'),
(0, "2526", "n4", 2, "u", "KTV N1", '2025-10-31'),
(0, "2526", "n4", 3, "t", "Caïssa-Eenhoorn N3", '2025-11-18'),
(0, "2526", "n4", 4, "u", "Castricum N2", '2025-12-12'),
(0, "2526", "n4", 5, "t", "Krommenie N2", '2026-02-03'),
(0, "2526", "n4", 6, "u", "Aartswoud N2", '2026-03-06'),
(0, "2526", "n4", 7, "t", "Volendam N1", '2026-04-07'),
(0, "2526", "n5", 1, "u", "Oppositie N1", '2025-09-30'),
(0, "2526", "n5", 2, "t", "NKC MSC 2", '2025-10-28'),
(0, "2526", "n5", 3, "u", "De Waagtoren N3", '2025-11-18'),
(0, "2526", "n5", 4, "t", "Koedijk N1", '2025-12-09'),
(0, "2526", "n5", 5, "t", "HHW Pietbulls N1", '2026-02-03'),
(0, "2526", "n5", 6, "u", "Bergen N1", '2026-03-05'),
(0, "2526", "n5", 7, "t", "En Passant N", '2026-04-11');

select * from ronde where clubCode = 0 and seizoen = @seizoen and teamCode in("nbb", "nbe", "nbz");
delete from ronde where clubCode = 0 and seizoen = @seizoen and teamCode in("nbb", "nbe", "nbz");

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "int", 1, "t", "", '2025-09-02'),
(0, "2526", "int", 2, "t", "", '2025-09-09'),
(0, "2526", "int", 3, "t", "", '2025-09-16'),
(0, "2526", "int", 4, "t", "", '2025-09-23'),
(0, "2526", "int", 5, "t", "", '2025-09-30'),
(0, "2526", "int", 6, "t", "", '2025-10-07'),
(0, "2526", "int", 7, "t", "", '2025-10-14'),
(0, "2526", "int", 8, "t", "", '2025-10-28'),
(0, "2526", "int", 9, "t", "", '2025-11-04'),
(0, "2526", "int", 10, "t", "", '2025-11-11'),
(0, "2526", "int", 11, "t", "", '2025-11-18'),
(0, "2526", "int", 12, "t", "", '2025-11-25'),
(0, "2526", "int", 13, "t", "", '2025-12-02'),
(0, "2526", "int", 14, "t", "", '2025-12-09'),
(0, "2526", "int", 15, "t", "", '2025-12-16'),
(0, "2526", "int", 16, "t", "", '2026-01-06'),
(0, "2526", "int", 17, "t", "", '2026-01-13'),
(0, "2526", "int", 18, "t", "", '2026-01-20'),
(0, "2526", "int", 19, "t", "", '2026-02-03'),
(0, "2526", "int", 20, "t", "", '2026-02-10'),
(0, "2526", "int", 21, "t", "", '2026-02-17'),
(0, "2526", "int", 22, "t", "", '2026-03-03'),
(0, "2526", "int", 23, "t", "", '2026-03-10'),
(0, "2526", "int", 24, "t", "", '2026-03-17'),
(0, "2526", "int", 25, "t", "", '2026-03-24'),
(0, "2526", "int", 26, "t", "", '2026-03-31'),
(0, "2526", "int", 27, "t", "", '2026-04-07'),
(0, "2526", "int", 28, "t", "", '2026-04-14'),
(0, "2526", "int", 29, "t", "", '2026-04-21'),
(0, "2526", "int", 30, "t", "", '2026-05-05'),
(0, "2526", "int", 31, "t", "", '2026-05-12'),
(0, "2526", "int", 32, "t", "", '2026-05-19'),
(0, "2526", "int", 33, "t", "", '2026-05-26'),
(0, "2526", "ira", 1, "t", "", '2025-10-21'),
(0, "2526", "ira", 2, "t", "", '2025-10-21'),
(0, "2526", "ira", 3, "t", "", '2025-10-21'),
(0, "2526", "ira", 4, "t", "", '2025-10-21'),
(0, "2526", "ira", 5, "t", "", '2026-02-24'),
(0, "2526", "ira", 6, "t", "", '2026-02-24'),
(0, "2526", "ira", 7, "t", "", '2026-02-24'),
(0, "2526", "ira", 8, "t", "", '2026-02-24'),
(0, "2526", "ira", 9, "t", "", '2026-04-28'),
(0, "2526", "ira", 10, "t", "", '2026-04-28'),
(0, "2526", "ira", 11, "t", "", '2026-04-28'),
(0, "2526", "ira", 12, "t", "", '2026-04-28');

-- speler TODO compleet maken
with r as (select * from rating  where jaar = 2025 and maand = 8)
select r.knsbNaam, r.knsbRating, s.* 
from speler s left join r on s.knsbNummer = r.knsbNummer  
where seizoen = "2425" and s.knsbNummer < 7234567;

-- speler toevoegen met knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
with r as (select * from rating  where jaar = 2025 and maand = 8) -- augustus
select 0, "2526", "int", "", "", p.knsbNummer, r.knsbRating, "2025-08-01", r.knsbRating, "int", "", "", "", "", 0, 0, 0
from persoon p join r on p.knsbNummer = r.knsbNummer  
where p.knsbNummer in(8978717, 6420557, 7509920); -- Ellen van der Hoeven, Jasper Seelmeijer, Dirk van der Meiden

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 7879520, 2054, '2025-09-01', 2054, "int", "", "", "", "", 0, 0, 0); -- Vincent Pandelaar

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 6187885, 1615, '2025-09-01', 1615, "int", "", "", "", "", 0, 0, 0); -- Bob de Mon

-- rating 1-9-2025
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8795941; -- Guido van Hesseling 
update speler set interneRating = 2232, knsbRating = 2232, datum = '2025-09-01', nhsbTeam = "n0" 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8795941;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7428960; -- Frank Agter 
update speler set interneRating = 2227, knsbRating = 2227, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7428960;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8096242; -- Michaël van Liempt 
update speler set interneRating = 2172, knsbRating = 2172, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8096242;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 6335670; -- Hebert Perez Garcia 
update speler set interneRating = 2027, knsbRating = 2027, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 6335670;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7613166; -- Peter Kalisvaart 
update speler set interneRating = 2047, knsbRating = 2047, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7613166;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8587337; -- Max Hooijmans 
update speler set interneRating = 1939, knsbRating = 1939, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8587337;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7292043; -- Rob Freer 
update speler set interneRating = 1879, knsbRating = 1879, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7292043;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7546506; -- Edward Schenkel
update speler set interneRating = 1861, knsbRating = 1861, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7546506;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7699010; -- Ruud Niewenhuis
update speler set interneRating = 1826, knsbRating = 1826, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7699010;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 6951362; -- Johan Plooijer 
update speler set interneRating = 1778, knsbRating = 1778, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 6951362;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7443172; -- Anton Schermer 
update speler set interneRating = 1776, knsbRating = 1776, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7443172;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 9077651; -- Lennart van der Kraan
update speler set interneRating = 1630, knsbRating = 1630, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 9077651;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7777715; -- Richard Gooijers
update speler set interneRating = 1463, knsbRating = 1463, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7777715;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7771665; -- Yvonne Schol
update speler set interneRating = 1433, knsbRating = 1433, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7771665;

select * from speler where knsbNummer = 7084022;

update speler set knsbRating = 1888 where knsbNummer = 7084022;

insert into gebruiker (knsbNummer, mutatieRechten, uuidToken, email, datumEmail, telefoon) values
(7084022, 1, uuid(), "john-kramer@kpnmail.nl", "2025-08-27", "");

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where s.knsbNummer = 7084022; -- John Kramer

update speler set knsbTeam = "0" where seizoen = "2526" and knsbNummer = 8795941; -- Guido van Hesseling 


-- gebruiker toevoegen
set @seizoen = '2526';

select * from speler
where seizoen = @seizoen and knsbNummer in(7359913, 8285574, 8611922, 189, 190, 8966133, 9040845, 9045388); 
-- Dimitri Reinderman, Maaike Keetman, Tycho Bakker, Julian en Christian Huisman, Jelle Koopmans 

delete from speler
where seizoen = @seizoen and knsbNummer in(7359913, 8285574, 7778100, 8611922, 189, 190, 8966133, 9040845, 9045388); 
-- Dimitri Reinderman, Maaike Keetman, Arlette van Weersel, Tycho Bakker, Julian en Christian Huisman, Jelle Koopmans 

select * from uitslag 
where seizoen = @seizoen and teamCode ="1" and rondeNummer = 3 and knsbNummer = 8795941;

delete from uitslag 
where seizoen = @seizoen and teamCode ="1" and rondeNummer = 3 and knsbNummer = 8795941;

-- kopieer spelers van vorig seizoen met knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
with r as (select * from rating  where jaar = 2025 and maand = 8) -- augustus
select 0, "2526", "int", "", "", s.knsbNummer, r.knsbRating, "2025-08-01", r.knsbRating, "int", "", "", "", "", 0, 0, 0
from speler s join r on s.knsbNummer = r.knsbNummer  
where seizoen = "2425";

-- kopieer spelers van vorig seizoen zonder knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
select 0, "2526", "int", "", "", knsbNummer, 0, "2025-09-01", 1000, "int", "", "", "", "", 0, 0, 0
from speler  
where seizoen = "2425" and knsbNummer < 1000000;

select p.naam, s.* 
from speler s join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen order by p.naam;

with r as (select * from rating  where jaar = 2025 and maand = 9) -- september
select r.knsbRating, r.knsbNaam, s.* 
from speler s join r on s.knsbNummer = r.knsbNummer
where seizoen = @seizoen;

-- update spelers met rating van 1 september
with r as (select * from rating  where jaar = 2025 and maand = 9) -- september
update speler s join r on s.knsbNummer = r.knsbNummer
set s.knsbRating = r.knsbRating, s.interneRating = r.knsbRating, s.datum = "2025-09-01"
where seizoen = @seizoen;  

-- spelers op rating
select naam, s.* 
from speler s join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2526" and teamCode = "int" 
order by s.knsbRating desc; 

select * from speler where seizoen = @seizoen and knsbNummer = 8978717;
delete from speler where seizoen = @seizoen;

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 103, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "0", "0", 132, 0, '2000-09-01', 1300, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 191, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "0", "0", 192, 0, '2000-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "0", "0", 193, 0, '2000-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "0", "0", 194, 0, '2000-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 5968611, 2102, '2025-08-01', 2102, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6187885, 1615, '2025-09-01', 1615, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6207520, 1962, '2025-08-01', 1962, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6212404, 1771, '2025-08-01', 1771, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6214153, 1790, '2025-08-01', 1790, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6225934, 1885, '2025-08-01', 1885, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6335670, 2027, '2025-09-01', 2027, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6420557, 1864, '2025-08-01', 1864, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6565801, 1902, '2025-08-01', 1902, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6572511, 1912, '2025-08-01', 1912, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6930957, 1900, '2025-08-01', 1900, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6951362, 1778, '2025-09-01', 1778, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7084022, 1888, '2025-08-01', 1888, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7099950, 2010, '2025-08-01', 2010, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7101193, 1731, '2025-08-01', 1731, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7129991, 2045, '2025-08-01', 2045, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7210137, 1792, '2025-08-01', 1792, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7269900, 1785, '2025-08-01', 1785, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7282033, 1850, '2025-08-01', 1850, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7292043, 1879, '2025-09-01', 1879, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7321534, 1655, '2025-08-01', 1655, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7386060, 1811, '2025-08-01', 1811, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7399469, 1757, '2025-08-01', 1757, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7419621, 1782, '2025-08-01', 1782, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7428960, 2227, '2025-09-01', 2227, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7441346, 1878, '2025-08-01', 1878, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7443172, 1776, '2025-09-01', 1776, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7468362, 1880, '2025-08-01', 1880, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7468417, 2018, '2025-08-01', 2018, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7504310, 1809, '2025-08-01', 1809, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7509920, 1986, '2025-08-01', 1986, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7518203, 1652, '2025-08-01', 1652, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7519930, 1678, '2025-08-01', 1678, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7529522, 1860, '2025-08-01', 1860, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7535385, 1808, '2025-08-01', 1808, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7535396, 1929, '2025-08-01', 1929, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7544438, 1923, '2025-08-01', 1923, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7546506, 1861, '2025-09-01', 1861, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7582102, 1554, '2025-08-01', 1554, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7584566, 2326, '2025-08-01', 2326, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7613166, 2047, '2025-09-01', 2047, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7649213, 1769, '2025-08-01', 1769, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7657342, 2274, '2025-08-01', 2274, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7665834, 1951, '2025-08-01', 1951, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7691728, 1589, '2025-08-01', 1589, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7699010, 1826, '2025-09-01', 1826, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7707832, 2040, '2025-08-01', 2040, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7731812, 1850, '2025-08-01', 1850, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7757409, 1857, '2025-08-01', 1857, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7758014, 1803, '2025-08-01', 1803, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7771665, 1433, '2025-09-01', 1433, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7777715, 1463, '2025-09-01', 1463, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7809285, 1846, '2025-08-01', 1846, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7824674, 1915, '2025-08-01', 1915, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7828183, 2075, '2025-08-01', 2075, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7904589, 1816, '2025-08-01', 1816, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7970094, 2219, '2025-08-01', 2219, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8073978, 1663, '2025-08-01', 1663, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8096242, 2172, '2025-09-01', 2172, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8112654, 1985, '2025-08-01', 1985, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8182416, 1736, '2025-08-01', 1736, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8224502, 1661, '2025-08-01', 1661, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8226317, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8243312, 1593, '2025-08-01', 1593, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8276752, 1736, '2025-08-01', 1736, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8335415, 1537, '2025-08-01', 1537, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8350738, 1468, '2025-08-01', 1468, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8358966, 1565, '2025-08-01', 1565, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8372881, 1820, '2025-08-01', 1820, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8400183, 1871, '2025-08-01', 1871, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8472530, 1658, '2025-08-01', 1658, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8484443, 1924, '2025-08-01', 1924, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8485059, 1734, '2025-08-01', 1734, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8587337, 1939, '2025-09-01', 1939, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8617367, 1710, '2025-08-01', 1710, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8744494, 1668, '2025-08-01', 1668, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8750093, 1810, '2025-08-01', 1810, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "n0", "0", 8795941, 2232, '2025-09-01', 2232, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8851073, 1200, '2025-08-01', 1200, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8886625, 1630, '2025-08-01', 1630, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8915346, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8931098, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8950876, 1310, '2025-08-01', 1310, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8978717, 1483, '2025-08-01', 1483, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9008967, 1787, '2025-08-01', 1787, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9023234, 1618, '2025-08-01', 1618, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9056674, 1879, '2025-08-01', 1879, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9065100, 2006, '2025-08-01', 2006, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9077651, 1630, '2025-09-01', 1630, "int", "", "", "", "", 0, 0, 0);

-- ronde 1
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 1, 0, 6565801, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7101193, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7399469, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7544438, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7582102, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7649213, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7665834, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7707832, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7771665, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8400183, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8472530, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8484443, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8795941, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8978717, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 9065100, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8226317, "p", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 1, 7535396, "i", "w", 5968611, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 1, 5968611, "i", "z", 7535396, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 2, 7613166, "i", "w", 7824674, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 2, 7824674, "i", "z", 7613166, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 3, 6572511, "i", "w", 7129991, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 3, 7129991, "i", "z", 6572511, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 4, 7099950, "i", "w", 6930957, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 4, 6930957, "i", "z", 7099950, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 5, 7084022, "i", "w", 8112654, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 5, 8112654, "i", "z", 7084022, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 6, 6207520, "i", "w", 7292043, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 6, 7292043, "i", "z", 6207520, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 7, 7441346, "i", "w", 8587337, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 7, 8587337, "i", "z", 7441346, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 8, 7386060, "i", "w", 7546506, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 8, 7546506, "i", "z", 7386060, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 9, 7529522, "i", "w", 7758014, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 9, 7758014, "i", "z", 7529522, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 10, 7210137, "i", "w", 7731812, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 10, 7731812, "i", "z", 7210137, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 11, 7282033, "i", "w", 7269900, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 11, 7269900, "i", "z", 7282033, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 12, 7419621, "i", "w", 7699010, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 12, 7699010, "i", "z", 7419621, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 13, 8372881, "i", "w", 6951362, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 13, 6951362, "i", "z", 8372881, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 14, 7443172, "i", "w", 7904589, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 14, 7904589, "i", "z", 7443172, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 15, 9023234, "i", "w", 6212404, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 15, 6212404, "i", "z", 9023234, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 16, 8617367, "i", "w", 6187885, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 16, 6187885, "i", "z", 8617367, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 17, 8243312, "i", "w", 7519930, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 17, 7519930, "i", "z", 8243312, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 18, 8073978, "i", "w", 8358966, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 18, 8358966, "i", "z", 8073978, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 19, 8335415, "i", "w", 8224502, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 19, 8224502, "i", "z", 8335415, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 20, 7321534, "i", "w", 8350738, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 20, 8350738, "i", "z", 7321534, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 21, 7777715, "i", "w", 7518203, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 21, 7518203, "i", "z", 7777715, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 22, 9077651, "i", "w", 8950876, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 22, 8950876, "i", "z", 9077651, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 23, 8915346, "i", "w", 192, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 23, 192, "i", "z", 8915346, "0", '2025-09-02', "int");

-- ronde 2
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 2, 0, 5968611, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6207520, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6565801, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7101193, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7210137, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7399469, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7518203, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7544438, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7758014, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7771665, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7824674, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7904589, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8226317, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8243312, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8358966, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8400183, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8472530, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8617367, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8750093, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8978717, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 1, 7129991, "i", "w", 7613166, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 1, 7613166, "i", "z", 7129991, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 2, 7441346, "i", "w", 7099950, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 2, 7099950, "i", "z", 7441346, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 3, 7546506, "i", "w", 8112654, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 3, 8112654, "i", "z", 7546506, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 4, 7443172, "i", "w", 7529522, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 4, 7529522, "i", "z", 7443172, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 5, 6187885, "i", "w", 7282033, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 5, 7282033, "i", "z", 6187885, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 6, 7519930, "i", "w", 8073978, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 6, 8073978, "i", "z", 7519930, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 7, 9077651, "i", "w", 7321534, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 7, 7321534, "i", "z", 9077651, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 8, 7535396, "i", "w", 8915346, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 8, 8915346, "i", "z", 7535396, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 9, 6951362, "i", "w", 7419621, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 9, 7419621, "i", "z", 6951362, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 10, 7699010, "i", "w", 8372881, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 10, 8372881, "i", "z", 7699010, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 11, 8335415, "i", "w", 9023234, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 11, 9023234, "i", "z", 8335415, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 12, 6212404, "i", "w", 8795941, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 12, 8795941, "i", "z", 6212404, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 13, 7970094, "i", "w", 7428960, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 13, 7428960, "i", "z", 7970094, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 14, 9065100, "i", "w", 7707832, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 14, 7707832, "i", "z", 9065100, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 15, 8224502, "i", "w", 7777715, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 15, 7777715, "i", "z", 8224502, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 16, 7649213, "i", "w", 8484443, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 16, 8484443, "i", "z", 7649213, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 17, 8485059, "i", "w", 8276752, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 17, 8276752, "i", "z", 8485059, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 18, 132, "i", "w", 7582102, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 18, 7582102, "i", "z", 132, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 19, 7665834, "i", "w", 6572511, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 19, 6572511, "i", "z", 7665834, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 20, 7292043, "i", "w", 6930957, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 20, 6930957, "i", "z", 7292043, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 21, 8587337, "i", "w", 7386060, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 21, 7386060, "i", "z", 8587337, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 22, 7731812, "i", "w", 7269900, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 22, 7269900, "i", "z", 7731812, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 23, 192, "i", "w", 8950876, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 23, 8950876, "i", "z", 192, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 24, 193, "i", "w", 194, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 24, 194, "i", "z", 193, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 25, 7084022, "i", "w", 8350738, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 25, 8350738, "i", "z", 7084022, "0", '2025-09-09', "int");

-- ronde 3
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 3, 0, 132, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 192, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 193, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6207520, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6565801, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6951362, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7084022, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7210137, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7269900, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7428960, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7519930, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7649213, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7665834, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7699010, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7758014, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7771665, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7904589, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8226317, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8243312, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8276752, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8372881, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8400183, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8472530, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8484443, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8587337, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8617367, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8750093, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8795941, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8978717, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7777715, "o", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8950876, "o", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 1, 7546506, "i", "w", 7129991, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 1, 7129991, "i", "z", 7546506, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 2, 7282033, "i", "w", 7529522, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 2, 7529522, "i", "z", 7282033, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 3, 7321534, "i", "w", 7441346, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 3, 7441346, "i", "z", 7321534, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 4, 7099950, "i", "w", 7970094, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 4, 7970094, "i", "z", 7099950, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 5, 9023234, "i", "w", 7535396, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 5, 7535396, "i", "z", 9023234, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 6, 7613166, "i", "w", 7292043, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 6, 7292043, "i", "z", 7613166, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 7, 8112654, "i", "w", 7386060, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 7, 7386060, "i", "z", 8112654, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 8, 7707832, "i", "w", 7443172, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 8, 7443172, "i", "z", 7707832, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 9, 6187885, "i", "w", 9065100, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 9, 9065100, "i", "z", 6187885, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 10, 5968611, "i", "w", 7419621, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 10, 7419621, "i", "z", 5968611, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 11, 194, "i", "w", 8915346, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 11, 8915346, "i", "z", 194, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 12, 8073978, "i", "w", 7544438, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 12, 7544438, "i", "z", 8073978, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 13, 8224502, "i", "w", 9077651, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 13, 9077651, "i", "z", 8224502, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 14, 6572511, "i", "w", 9056674, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 14, 9056674, "i", "z", 6572511, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 15, 7518203, "i", "w", 7399469, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 15, 7399469, "i", "z", 7518203, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 16, 6212404, "i", "w", 7101193, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 16, 7101193, "i", "z", 6212404, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 17, 7824674, "i", "w", 7582102, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 17, 7582102, "i", "z", 7824674, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 18, 8485059, "i", "w", 8335415, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 18, 8335415, "i", "z", 8485059, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 19, 6930957, "i", "w", 8358966, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 19, 8358966, "i", "z", 6930957, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 20, 8350738, "i", "w", 7731812, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 20, 7731812, "i", "z", 8350738, "1", '2025-09-16', "int");

-- ronde 4
set @seizoen = "2526";
set @team = "int";
set @ronde = 4;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 4, 0, 193, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 194, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 5968611, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 6187885, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 6207520, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7084022, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7101193, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7269900, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7399469, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7529522, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7535396, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7649213, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7707832, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7758014, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7771665, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8224502, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8243312, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8372881, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8400183, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8472530, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8485059, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8617367, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8795941, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 9056674, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 9065100, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7099950, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7129991, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7428960, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7613166, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7970094, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8096242, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8112654, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8587337, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 1, 7441346, "i", "w", 7282033, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 1, 7282033, "i", "z", 7441346, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 2, 7519930, "i", "w", 7546506, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 2, 7546506, "i", "z", 7519930, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 3, 8484443, "i", "w", 7699010, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 3, 7699010, "i", "z", 8484443, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 4, 7544438, "i", "w", 7321534, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 4, 7321534, "i", "z", 7544438, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 5, 7777715, "i", "w", 9077651, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 5, 9077651, "i", "z", 7777715, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 6, 7386060, "i", "w", 7210137, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 6, 7210137, "i", "z", 7386060, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 7, 8276752, "i", "w", 6212404, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 7, 6212404, "i", "z", 8276752, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 8, 9023234, "i", "w", 7665834, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 8, 7665834, "i", "z", 9023234, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 9, 7292043, "i", "w", 7824674, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 9, 7824674, "i", "z", 7292043, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 10, 7879520, "i", "w", 6951362, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 10, 6951362, "i", "z", 7879520, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 11, 6930957, "i", "w", 6565801, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 11, 6565801, "i", "z", 6930957, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 12, 7419621, "i", "w", 7443172, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 12, 7443172, "i", "z", 7419621, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 13, 8750093, "i", "w", 7518203, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 13, 7518203, "i", "z", 8750093, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 14, 7731812, "i", "w", 8073978, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 14, 8073978, "i", "z", 7731812, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 15, 192, "i", "w", 6572511, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 15, 6572511, "i", "z", 192, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 16, 8915346, "i", "w", 7904589, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 16, 7904589, "i", "z", 8915346, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 17, 8950876, "i", "w", 132, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 17, 132, "i", "z", 8950876, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 18, 7582102, "i", "w", 8978717, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 18, 8978717, "i", "z", 7582102, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 19, 8226317, "i", "w", 8335415, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 19, 8335415, "i", "z", 8226317, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 20, 8358966, "i", "w", 8350738, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 20, 8350738, "i", "z", 8358966, "1", '2025-09-23', "int");

-- ronde 5
set @seizoen = "2526";
set @team = "int";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 5, 0, 132, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 193, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 194, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6207520, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7084022, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7428960, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7535396, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7544438, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7613166, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7649213, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7699010, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7707832, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7771665, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7970094, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8096242, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8335415, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8372881, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8400183, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8472530, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8484443, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8587337, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8617367, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8750093, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8795941, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8915346, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8950876, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8978717, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6212404, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6214153, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6565801, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6930957, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7101193, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7210137, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7282033, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7321534, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7399469, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7468362, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7519930, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7529522, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7546506, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7731812, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7758014, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8276752, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8485059, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 9056674, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 1, 7129991, "i", "w", 9065100, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 1, 9065100, "i", "z", 7129991, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 2, 8112654, "i", "w", 7441346, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 2, 7441346, "i", "z", 8112654, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 3, 5968611, "i", "w", 7099950, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 3, 7099950, "i", "z", 5968611, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 4, 9077651, "i", "w", 7292043, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 4, 7292043, "i", "z", 9077651, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 5, 7665834, "i", "w", 7879520, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 5, 7879520, "i", "z", 7665834, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 6, 7269900, "i", "w", 7419621, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 6, 7419621, "i", "z", 7269900, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 7, 7386060, "i", "w", 7777715, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 7, 7777715, "i", "z", 7386060, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 8, 7824674, "i", "w", 6572511, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 8, 6572511, "i", "z", 7824674, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 9, 7904589, "i", "w", 9023234, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 9, 9023234, "i", "z", 7904589, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 10, 6951362, "i", "w", 8073978, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 10, 8073978, "i", "z", 6951362, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 11, 7443172, "i", "w", 6187885, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 11, 6187885, "i", "z", 7443172, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 12, 7518203, "i", "w", 8224502, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 12, 8224502, "i", "z", 7518203, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 13, 8350738, "i", "w", 192, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 13, 192, "i", "z", 8350738, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 14, 7582102, "i", "w", 8243312, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 14, 8243312, "i", "z", 7582102, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 15, 8358966, "i", "w", 8226317, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 15, 8226317, "i", "z", 8358966, "0", '2025-09-30', "int");

-- ronde 6 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 6;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 6, 0, 6212404, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6214153, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6565801, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6572511, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6951362, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7099950, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7282033, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7321534, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7386060, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7399469, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7419621, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7441346, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7443172, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7529522, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7544438, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7546506, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7582102, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7665834, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7699010, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7731812, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7758014, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7771665, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7777715, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8073978, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8112654, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8224502, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8243312, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8350738, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8358966, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8485059, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 9077651, "m", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7084022, "n", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7535396, "n", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7649213, "n", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 132, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 192, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 193, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 194, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 5968611, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6187885, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6207520, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6930957, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7101193, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7129991, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7210137, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7269900, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7292043, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7428960, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7468362, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7518203, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7519930, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7613166, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7707832, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7824674, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7879520, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7904589, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7970094, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8096242, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8226317, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8276752, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8335415, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8372881, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8400183, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8472530, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8484443, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8587337, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8617367, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8750093, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8795941, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8915346, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8950876, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8978717, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 9023234, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 9056674, "p", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 9065100, "p", "", 0, "", '2025-10-07', "int");


-- ronde 7 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- ronde 8 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 8;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- ronde 9 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 9;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- ronde 10 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 10;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- ronde 11 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 11;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- Waagtoren KNSB beker

-- Waagtoren 1 TODO
set @seizoen = "2526";
set @team = "1";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"1",1,6,7099950,"e","z",0,"½",'2025-09-20',"int"),
(0,2526,"1",1,2,7428960,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,8,7468417,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,3,7584566,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,4,7657342,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,7,7828183,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,1,7970094,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"1",1,5,8096242,"e","w",0,"½",'2025-09-20',"int"),
(0,2526,"1",2,8,7099950,"e","w",0,"½",'2025-10-04',"int"),
(0,2526,"1",2,4,7428960,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"1",2,7,7468417,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"1",2,3,7584566,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"1",2,2,7657342,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"1",2,6,7828183,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"1",2,1,7970094,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"1",2,5,8096242,"e","z",0,"0",'2025-10-04',"int");

-- Waagtoren 2 TODO 
set @seizoen = "2526";
set @team = "2";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"2",1,1,5968611,"e","w",0,"½",'2025-09-20',"int"),
(0,2526,"2",1,2,6335670,"e","z",0,"½",'2025-09-20',"int"),
(0,2526,"2",1,3,7129991,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"2",1,6,7509920,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"2",1,5,7613166,"e","w",0,"½",'2025-09-20',"int"),
(0,2526,"2",1,4,7707832,"e","z",0,"0",'2025-09-20',"int"),
(0,2526,"2",1,7,8112654,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"2",1,8,8587337,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"2",2,3,5968611,"e","z",0,"½",'2025-10-04',"int"),
(0,2526,"2",2,2,6335670,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"2",2,7,7129991,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"2",2,4,7509920,"e","w",0,"½",'2025-10-04',"int"),
(0,2526,"2",2,1,7613166,"e","z",0,"½",'2025-10-04',"int"),
(0,2526,"2",2,8,7707832,"e","w",0,"½",'2025-10-04',"int"),
(0,2526,"2",2,5,8112654,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"2",2,6,8587337,"e","w",0,"0",'2025-10-04',"int");

-- Waagtoren 3 TODO 
set @seizoen = "2526";
set @team = "3";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"3",1,2,6207520,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"3",1,8,6420557,"e","z",0,"1",'2025-09-20',"int"),
(0,2526,"3",1,5,6930957,"e","w",0,"0",'2025-09-20',"int"),
(0,2526,"3",1,6,7292043,"e","z",0,"0",'2025-09-20',"int"),
(0,2526,"3",1,3,7665834,"e","w",0,"½",'2025-09-20',"int"),
(0,2526,"3",1,4,8484443,"e","z",0,"0",'2025-09-20',"int"),
(0,2526,"3",1,7,9056674,"e","w",0,"1",'2025-09-20',"int"),
(0,2526,"3",1,1,9065100,"e","w",0,"0",'2025-09-20',"int"),
(0,2526,"3",2,2,6207520,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"3",2,6,6420557,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"3",2,4,6572511,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"3",2,7,6930957,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"3",2,8,8400183,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"3",2,3,8484443,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"3",2,5,9056674,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"3",2,1,9065100,"e","z",0,"1",'2025-10-04',"int");

-- Waagtoren 4 TODO 
set @seizoen = "2526";
set @team = "4";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"4",1,1,7282033,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"4",1,8,7504310,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"4",1,7,7519930,"e","z",0,"½",'2025-10-04',"int"),
(0,2526,"4",1,3,7546506,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"4",1,4,7699010,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"4",1,6,7758014,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"4",1,2,7809285,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"4",1,5,7904589,"e","z",0,"1",'2025-10-04',"int");

-- Waagtoren 5 TODO 
set @seizoen = "2526";
set @team = "5";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"5",1,4,6212404,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"5",1,2,6951362,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"5",1,6,7269900,"e","w",0,"1",'2025-10-04',"int"),
(0,2526,"5",1,5,7399469,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"5",1,3,7443172,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"5",1,1,8073978,"e","z",0,"½",'2025-10-04',"int"),
(0,2526,"5",1,7,8182416,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"5",1,8,8472530,"e","w",0,"½",'2025-10-04',"int");

-- Waagtoren 6 TODO 
set @seizoen = "2526";
set @team = "6";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,2526,"6",1,5,6187885,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"6",1,2,7321534,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"6",1,8,7771665,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"6",1,1,8224502,"e","z",0,"1",'2025-10-04',"int"),
(0,2526,"6",1,6,8243312,"e","w",0,"½",'2025-10-04',"int"),
(0,2526,"6",1,7,8978717,"e","z",0,"0",'2025-10-04',"int"),
(0,2526,"6",1,4,9023234,"e","w",0,"0",'2025-10-04',"int"),
(0,2526,"6",1,3,9077651,"e","z",0,"0",'2025-10-04',"int");


-- Waagtoren NHSB beker

-- Waagtoren n1 TODO
set @team = "n1";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n1",1,4,7099950,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,6,7129991,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,2,7428960,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,5,7613166,"e","z",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,1,7970094,"e","z",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,3,8096242,"e","z",0,"½",'2025-09-23',"int"),
(0,"2526","n1",1,7,8112654,"e","z",0,"½",'2025-09-23',"int"),
(0,"2526","n1",1,8,8587337,"e","w",0,"1",'2025-09-23',"int");

-- Waagtoren n2 TODO
set @team = "n2";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n2",1,4,6207520,"e","z",0,"½",'2025-09-26',"int"),
(0,"2526","n2",1,3,7529522,"e","w",0,"1",'2025-09-26',"int"),
(0,"2526","n2",1,6,7824674,"e","z",0,"1",'2025-09-26',"int"),
(0,"2526","n2",1,1,8112654,"e","w",0,"0",'2025-09-26',"int"),
(0,"2526","n2",1,5,8484443,"e","w",0,"½",'2025-09-26',"int"),
(0,"2526","n2",1,2,9065100,"e","z",0,"1",'2025-09-26',"int");

-- Waagtoren n3 TODO
set @team = "n3";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n3",1,1,6930957,"e","w",0,"½",'2025-09-30',"int"),
(0,"2526","n3",1,2,7529522,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n3",1,3,9056674,"e","w",0,"1",'2025-09-30',"int"),
(0,"2526","n3",1,4,6565801,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n3",1,5,7468362,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n3",1,6,7731812,"e","z",0,"1",'2025-09-30',"int");


-- Waagtoren n4 TODO
set @team = "n4";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n4",1,1,7546506,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,2,7282033,"e","w",0,"1",'2025-09-30',"int"),
(0,"2526","n4",1,3,7758014,"e","z",0,"½",'2025-09-30',"int"),
(0,"2526","n4",1,4,7210137,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,5,6214153,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,6,6212404,"e","w",0,"½",'2025-09-30',"int");

-- Waagtoren n5 TODO
set @team = "n5";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n5",1,1,7399469,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,2,8276752,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,3,8485059,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,4,7101193,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n5",1,5,7519930,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,6,7321534,"e","z",0,"1",'2025-09-30',"int");
