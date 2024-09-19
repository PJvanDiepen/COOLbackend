use waagtoren; -- ga naar TODO

-- TODO issue #37 afwezig en externe wedstrijd op dinsdag

-- aantal interne uitslagen per speler per seizoen
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;
set @seizoen = '1819'; -- TODO Han Rauws en Bob de Mon 26
set @seizoen = '1920'; -- TODO 19, 18, 17, 16, 15, 13, 10, 8, 1
set @seizoen = '2122'; -- TODO 24, 23, 22, 21, 20
set @seizoen = '2223'; -- TODO 32, 31, 30, 29
set @seizoen = '2324';
set @seizoen = '2324';
set @seizoen = '2425';


with 
  e as (select * from uitslag where anderTeam = "int" and partij = "e")
select p.naam, u.teamCode, u.rondeNummer, u.partij, e.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
join e on u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
where u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

with
  e as (select * from uitslag where anderTeam = "int" and partij = "e")
update uitslag u
join e on u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
set u.partij = "e"
where u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

-- externe partijen op andere datums dan de wedstrijd
select p.naam, r.uithuis, r.tegenstander, r.datum, u.* from uitslag u
join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.anderTeam and u.datum <> r.datum; 

select * from uitslag where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
select * from ronde where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
update uitslag set datum = '2022-04-26' where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 

-- externe partijen zonder uitslag
select p.naam, u.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
where seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

delete from uitslag
where seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

-- issue #46 hack
insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2324", "int", 34, "t", "", '2024-06-30');

delete from ronde where clubCode = 0 and seizoen = "2324" and teamCode = "int" and rondeNummer = 34; 

-- aantal rating leden per maand 
select maand, jaar, count(*) leden from rating group by maand, jaar;

-- TODO wijzig datum externe wedstrijd
set @seizoen = '2324';
set @team = 'int';
set @ronde = 32;
set @datum = '2024-02-20';

select * from ronde where seizoen = @seizoen and teamCode = @team;
select * from uitslag where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

update ronde set datum = @datum where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
update uitslag set partij = "p", datum = @datum where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde; 

-- TODO partij wijzigen
set @seizoen = '2425';
set @team = 'int';
set @competitie = 'int';
set @ronde = 2;
set @bord = 22;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit = 189; -- Jan
set @zwart = 7691728; -- Karel

set @oneven = 6212404; -- Peter
set @afwezig = 9001586; -- Abdul Rashid
set @extern = 7758014; -- Alex

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

-- TODO partij wijzigen

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO teams offline
select * from team where clubCode = 0 and seizoen = "2425";
delete from team where clubCode = 0 and seizoen = "2425";

insert into team (clubCode, seizoen, teamCode, reglement, bond, poule, omschrijving, borden, teamleider) values
(0, "2425", "",    0,  "",  "",   "geen",               0, 0),
(0, "2425", "int", 3,  "i", "nt", "interne competitie", 0, 0),
(0, "2425", "ira", 4,  "i", "ra", "rapid competitie", 0, 0);

-- teams
insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "ije", "i", "je", "jeugd competitie", 0, 0),
("2425", "ijv", "i", "jv", "jeugd voorjaarscompetitie", 0, 0); 

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "", "", "", "geen", 0, 0),
("2425", "0", "k", "", "KNSB bij andere schaakvereniging", 0, 0),
("2425", "n0", "n", "", "NHSB bij andere schaakvereniging", 0, 0),
("2425", "1", "k", "m", "KNSB meester", 10, 0),
("2425", "2", "k", "3c", "KNSB 3c", 8, 0),
("2425", "3", "k", "4c", "KNSB 4c", 8, 0),
("2425", "4", "k", "6e", "KNSB 6e", 8, 0),
("2425", "5", "k", "6e", "KNSB 6e", 8, 0),
("2425", "kbe", "k", "be", "KNSB beker", 4, 0),
("2425", "int", "i", "nt", "interne competitie", 0, 0),
("2425", "ira", "i", "ra", "rapid competitie", 0, 0),
("2425", "n1", "n", "t", "NHSB top", 8, 0),
("2425", "n2", "n", "1a", "NHSB 1a", 8, 0),
("2425", "n3", "n", "2a", "NHSB 2a", 6, 0),
("2425", "n4", "n", "3a", "NHSB 3a", 8, 0),
("2425", "nv1", "n", "vc", "NHSB vc", 4, 0),
("2425", "nv2", "n", "vb", "NHSB vb", 4, 0);

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "nbe", "n", "be", "NHSB beker", 4, 0),
("2425", "nbz", "n", "bz", "NHSB beker (zilver)", 4, 0),
("2425", "nbb", "n", "bb", "NHSB beker (brons)", 4, 0);

-- teamleiders 2023-2024
select naam, team.* from team join persoon on knsbNummer = teamleider where seizoen = "2425";
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "1"; -- Jan Poland
update team set teamleider = 7129991 where seizoen = "2425" and teamCode = "2"; -- Gerard de Geus
update team set teamleider = 7758014 where seizoen = "2425" and teamCode = "3"; -- Alex Albrecht
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "4"; -- Peter van Diepen
update team set teamleider = 7321534 where seizoen = "2425" and teamCode = "5"; -- Ronald Kamps
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "kbe"; -- Jan Poland
update team set teamleider = 7428960 where seizoen = "2425" and teamCode = "nbe"; -- Frank Agter
update team set teamleider = 7529522 where seizoen = "2425" and teamCode = "nbz"; -- Willem Meyles
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "nbb"; -- Peter van Diepen
update team set teamleider = 7428960 where seizoen = "2425" and teamCode = "n1"; -- Frank Agter
update team set teamleider = 7529522 where seizoen = "2425" and teamCode = "n2"; -- Willem Meyles
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "n3"; -- Jan Poland
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "n4"; -- Peter van Diepen
update team set teamleider = 7321534 where seizoen = "2425" and teamCode = "nv1"; -- Ronald Kamps
update team set teamleider = 8950876 where seizoen = "2425" and teamCode = "nv2"; -- Jos Albers

-- ronde
select * from ronde where clubCode = 0 and seizoen = "2425";
delete from ronde where clubCode = 0 and seizoen = "2425";

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2425", "int", 1, "t", "", '2024-09-10'), -- interne competitie
(0, "2425", "int", 2, "t", "", '2024-09-17'),
(0, "2425", "int", 3, "t", "", '2024-09-24'),
(0, "2425", "int", 4, "t", "", '2024-10-01'),
(0, "2425", "int", 5, "t", "", '2024-10-15'),
(0, "2425", "int", 6, "t", "", '2024-10-22'),
(0, "2425", "int", 7, "t", "", '2024-11-05'),
(0, "2425", "int", 8, "t", "", '2024-11-12'),
(0, "2425", "int", 9, "t", "", '2024-11-19'),
(0, "2425", "int", 10, "t", "", '2024-11-26'),
(0, "2425", "int", 11, "t", "", '2024-12-03'),
(0, "2425", "int", 12, "t", "", '2024-12-10'),
(0, "2425", "int", 13, "t", "", '2024-12-17'),
(0, "2425", "int", 14, "t", "", '2025-01-07'),
(0, "2425", "int", 15, "t", "", '2025-01-14'),
(0, "2425", "int", 16, "t", "", '2025-01-21'),
(0, "2425", "int", 17, "t", "", '2025-02-04'),
(0, "2425", "int", 18, "t", "", '2025-02-11'),
(0, "2425", "int", 19, "t", "", '2025-02-25'),
(0, "2425", "int", 20, "t", "", '2025-03-04'),
(0, "2425", "int", 21, "t", "", '2025-03-11'),
(0, "2425", "int", 22, "t", "", '2025-03-18'),
(0, "2425", "int", 23, "t", "", '2025-03-25'),
(0, "2425", "int", 24, "t", "", '2025-04-01'),
(0, "2425", "int", 25, "t", "", '2025-04-08'),
(0, "2425", "int", 26, "t", "", '2025-04-15'),
(0, "2425", "int", 27, "t", "", '2025-04-22'),
(0, "2425", "int", 28, "t", "", '2025-05-06'),
(0, "2425", "int", 29, "t", "", '2025-05-13'),
(0, "2425", "int", 30, "t", "", '2025-05-20'),
(0, "2425", "int", 31, "t", "", '2025-05-27'),
(0, "2425", "int", 32, "t", "", '2025-06-03'),
(0, "2425", "int", 33, "t", "", '2025-06-10'),
(0, "2425", "ira", 1, "t", "", '2024-10-29'), -- rapid competitie
(0, "2425", "ira", 2, "t", "", '2024-10-29'),
(0, "2425", "ira", 3, "t", "", '2024-10-29'),
(0, "2425", "ira", 4, "t", "", '2024-10-29'),
(0, "2425", "ira", 5, "t", "", '2025-02-18'),
(0, "2425", "ira", 6, "t", "", '2025-02-18'),
(0, "2425", "ira", 7, "t", "", '2025-02-18'),
(0, "2425", "ira", 8, "t", "", '2025-02-18'),
(0, "2425", "ira", 9, "t", "", '2025-04-29'),
(0, "2425", "ira", 10, "t", "", '2025-04-29'),
(0, "2425", "ira", 11, "t", "", '2025-04-29'),
(0, "2425", "ira", 12, "t", "", '2025-04-29');

-- speler

select * from speler where clubCode = 0 and seizoen = "2425";
delete from speler where clubCode = 0 and seizoen = "2425";

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2425", "int", "", "", 103, 0, '2024-09-01', 1000, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 189, 0, '2024-09-01', 1500, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 5968611, 2153, '2024-09-01', 2153, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6192098, 1683, '2024-09-01', 1683, "", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6207520, 1942, '2024-09-01', 1942, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6212404, 1770, '2024-09-01', 1770, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6565801, 1907, '2024-09-01', 1907, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6572511, 1943, '2024-09-01', 1943, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6930957, 1945, '2024-09-01', 1945, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 6951362, 1783, '2024-09-01', 1783, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7099950, 2019, '2024-09-01', 2019, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7101193, 1710, '2024-09-01', 1710, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7129991, 2020, '2024-09-01', 2020, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7210137, 1788, '2024-09-01', 1788, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7269900, 1765, '2024-09-01', 1765, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7282033, 1865, '2024-09-01', 1865, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7292043, 1843, '2024-09-01', 1843, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7321534, 1673, '2024-09-01', 1673, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7386060, 1802, '2024-09-01', 1802, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7399469, 1771, '2024-09-01', 1771, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7419621, 1777, '2024-09-01', 1777, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7428960, 2293, '2024-09-01', 2293, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7441346, 1848, '2024-09-01', 1848, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7518203, 1677, '2024-09-01', 1677, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7519930, 1696, '2024-09-01', 1696, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7529522, 1907, '2024-09-01', 1907, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7535396, 1932, '2024-09-01', 1932, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7544438, 1923, '2024-09-01', 1923, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7546506, 1814, '2024-09-01', 1814, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7582102, 1554, '2024-09-01', 1554, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7613166, 2051, '2024-09-01', 2051, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7649213, 1779, '2024-09-01', 1779, "", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7691728, 1626, '2024-09-01', 1626, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7699010, 1823, '2024-09-01', 1823, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7731812, 1832, '2024-09-01', 1832, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7757409, 1863, '2024-09-01', 1863, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7758014, 1875, '2024-09-01', 1875, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7771665, 1476, '2024-09-01', 1476, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7777715, 1451, '2024-09-01', 1451, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7824674, 1904, '2024-09-01', 1904, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 7970094, 2258, '2024-09-01', 2258, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8073978, 1642, '2024-09-01', 1642, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8112654, 2007, '2024-09-01', 2007, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8224502, 1683, '2024-09-01', 1683, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8243312, 1629, '2024-09-01', 1629, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8335415, 1537, '2024-09-01', 1537, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8350738, 1483, '2024-09-01', 1483, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8358966, 1513, '2024-09-01', 1513, "", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8372881, 1846, '2024-09-01', 1846, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8485059, 1735, '2024-09-01', 1735, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8611922, 1983, '2024-09-01', 1983, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8617367, 1691, '2024-09-01', 1691, "", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8750093, 1793, '2024-09-01', 1793, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8795941, 2021, '2024-09-01', 2021, "ira", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8886625, 1667, '2024-09-01', 1667, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8931098, 0, '2024-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 8950876, 1367, '2024-09-01', 1367, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 9023234, 1603, '2024-09-01', 1603, "int", "", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 9056674, 1908, '2024-09-01', 1908, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 9065100, 0, '2024-09-01', 1900, "int", "ira", "", "", "", 0, 0, 0),
(0, "2425", "int", "", "", 9077651, 0, '2024-09-01', 1000, "int", "ira", "", "", "", 0, 0, 0);

-- ronde 1
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2425", "int", 1, 0, 6212404, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 6565801, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 6951362, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7101193, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7210137, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7386060, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7419621, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7518203, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7529522, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7544438, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7613166, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7649213, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 7699010, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8112654, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8243312, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8358966, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8611922, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8886625, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 0, 8950876, "a", "", 0, "", '2024-09-10', "int"),
(0, "2425", "int", 1, 1, 6207520, "i", "w", 8795941, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 1, 8795941, "i", "z", 6207520, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 2, 7129991, "i", "w", 7535396, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 2, 7535396, "i", "z", 7129991, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 3, 9056674, "i", "w", 7099950, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 3, 7099950, "i", "z", 9056674, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 4, 6930957, "i", "w", 7824674, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 4, 7824674, "i", "z", 6930957, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 5, 9065100, "i", "w", 6572511, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 5, 6572511, "i", "z", 9065100, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 6, 7546506, "i", "w", 7758014, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 6, 7758014, "i", "z", 7546506, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 7, 7282033, "i", "w", 8750093, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 7, 8750093, "i", "z", 7282033, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 8, 7399469, "i", "w", 7441346, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 8, 7441346, "i", "z", 7399469, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 9, 8372881, "i", "w", 8485059, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 9, 8485059, "i", "z", 8372881, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 10, 7519930, "i", "w", 7731812, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 10, 7731812, "i", "z", 7519930, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 11, 7582102, "i", "w", 8617367, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 11, 8617367, "i", "z", 7582102, "½", '2024-09-10', "int"),
(0, "2425", "int", 1, 12, 6192098, "i", "w", 189, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 12, 189, "i", "z", 6192098, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 13, 8350738, "i", "w", 8224502, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 13, 8224502, "i", "z", 8350738, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 14, 7321534, "i", "w", 7771665, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 14, 7771665, "i", "z", 7321534, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 15, 7777715, "i", "w", 8073978, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 15, 8073978, "i", "z", 7777715, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 16, 7691728, "i", "w", 103, "1", '2024-09-10', "int"),
(0, "2425", "int", 1, 16, 103, "i", "z", 7691728, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 17, 9077651, "i", "w", 9023234, "0", '2024-09-10', "int"),
(0, "2425", "int", 1, 17, 9023234, "i", "z", 9077651, "1", '2024-09-10', "int");

-- ronde 2
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "int" and rondeNUmmer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "int" and rondeNUmmer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2425", "int", 2, 0, 6207520, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 7441346, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 7546506, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 7649213, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 7824674, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 8358966, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 8795941, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 8886625, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 9023234, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 9065100, "a", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 0, 7321534, "o", "", 0, "", '2024-09-17', "int"),
(0, "2425", "int", 2, 1, 7099950, "i", "w", 6930957, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 1, 6930957, "i", "z", 7099950, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 2, 7758014, "i", "w", 6572511, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 2, 6572511, "i", "z", 7758014, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 3, 8485059, "i", "w", 7399469, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 3, 7399469, "i", "z", 8485059, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 4, 7771665, "i", "w", 7282033, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 4, 7282033, "i", "z", 7771665, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 5, 8224502, "i", "w", 6192098, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 5, 6192098, "i", "z", 8224502, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 6, 7535396, "i", "w", 8073978, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 6, 8073978, "i", "z", 7535396, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 7, 7519930, "i", "w", 7129991, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 7, 7129991, "i", "z", 7519930, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 8, 7731812, "i", "w", 7582102, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 8, 7582102, "i", "z", 7731812, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 9, 8112654, "i", "w", 7613166, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 9, 7613166, "i", "z", 8112654, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 10, 8617367, "i", "w", 8611922, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 10, 8611922, "i", "z", 8617367, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 11, 7529522, "i", "w", 7544438, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 11, 7544438, "i", "z", 7529522, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 12, 7699010, "i", "w", 6565801, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 12, 6565801, "i", "z", 7699010, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 13, 7210137, "i", "w", 7386060, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 13, 7386060, "i", "z", 7210137, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 14, 7419621, "i", "w", 6951362, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 14, 6951362, "i", "z", 7419621, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 15, 8276752, "i", "w", 6212404, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 15, 6212404, "i", "z", 8276752, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 16, 7518203, "i", "w", 7101193, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 16, 7101193, "i", "z", 7518203, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 17, 8335415, "i", "w", 8243312, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 17, 8243312, "i", "z", 8335415, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 18, 8950876, "i", "w", 9056674, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 18, 9056674, "i", "z", 8950876, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 19, 8750093, "i", "w", 8372881, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 19, 8372881, "i", "z", 8750093, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 20, 9077651, "i", "w", 8350738, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 20, 8350738, "i", "z", 9077651, "1", '2024-09-17', "int"),
(0, "2425", "int", 2, 21, 103, "i", "w", 7777715, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 21, 7777715, "i", "z", 103, "½", '2024-09-17', "int"),
(0, "2425", "int", 2, 22, 189, "i", "w", 7691728, "0", '2024-09-17', "int"),
(0, "2425", "int", 2, 22, 7691728, "i", "z", 189, "1", '2024-09-17', "int");

-- ronde 3 TODO local
set @ronde = 3;
select * from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "int" and rondeNUmmer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = "2425" and teamCode = "int" and rondeNUmmer = @ronde;
