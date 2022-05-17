use waagtoren;

-- TODO spelers selecteren
select naam, s.knsbNummer, knsbRating, knsbOpgegeven, nhsbOpgegeven
from speler s join persoon p on p.knsbNummer = s.knsbNummer
where seizoen = '2122' order by naam; -- knsbRating desc;

-- TODO afwezig wijzigen/toevoegen tijdens toernooi
set @competitie = 'ira';
set @ronde = 8;
set @datum = '2022-05-03';
set @speler = 7758014; -- Alex Albrecht

set @competitie = 'ipa';
set @ronde = 1;
set @datum = '2022-04-29';
set @speler = 7210137; -- Arjen Dibbets
set @speler = 8372881; -- Egbert van Oene
set @speler = 7099950; -- Jos Vlaming

select * from uitslag where seizoen = '2122' and teamCode = @competitie and rondeNummer <= @ronde and knsbNummer = @speler;
update uitslag set partij = 'a' where seizoen = '2122' and teamCode = @competitie and rondeNummer <= @ronde and knsbNummer = @speler;

select * from uitslag where seizoen = '2122' and teamCode = @competitie and knsbNummer = @speler;
delete from uitslag where seizoen = '2122' and teamCode = @competitie and rondeNummer <= @ronde and knsbNummer = @speler;
insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2122', @competitie, 1, 0, @speler, 'a', '', 0, '', @datum, @competitie),
('2122', @competitie, 2, 0, @speler, 'a', '', 0, '', @datum, @competitie);

-- TODO partij wijzigen
set @competitie = 'int';
set @ronde = 22;
set @bord = 13;
set @wit = 105; -- Richard Meijer
set @zwart = 103; -- Charles Stoorvogel

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = 7731812;

select * from uitslag where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = 7731812;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart);

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;



-- TODO speler toevoegen
insert into persoon (knsbNummer, naam) values
    (7771665, 'Yvonne Schol');

insert into speler (seizoen, nhsbTeam, nhsbOpgegeven, knsbTeam, knsbOpgegeven, knsbNummer, knsbRating, datumRating) values
    ('2122', '', '', '', '', 100, 1000, '2022-04-23');

insert into speler (seizoen, nhsbTeam, nhsbOpgegeven, knsbTeam, knsbOpgegeven, knsbNummer, knsbRating, datumRating) values
    ('2122', '', '', '', '', 7771665, 1264, '2022-04-10');

-- TODO ronde toevoegen
set @competitie = 'ipa';
set @datum = '2022-04-30';

select * from team where seizoen = '2122'; 
delete from team where seizoen = '2122' and teamCode = @competitie;

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
('2122', 'ipa', 'i', 'pa', 'Paas competitie', 0, 0);

select * from ronde where seizoen = '2122' and teamCode = @competitie; 
select * from uitslag where seizoen = '2122' and teamCode = @competitie;

update ronde set datum = @datum where seizoen = '2122' and teamCode = @competitie and rondeNummer > 2; 
update uitslag set datum = @datum where seizoen = '2122' and teamCode = @competitie and rondeNummer > 2;

delete from ronde where seizoen = '2122' and teamCode = @competitie;
delete from uitslag where seizoen = '2122' and teamCode = @competitie;

-- TODO wedstrijden en ronden voor vandaag opruimen
set @datum = '2022-04-30';
select * from uitslag where datum < @datum and partij in ('m', 'n', 'u', 't') order by datum;

delete from uitslag where seizoen = '2122' and datum < @datum and partij in ('m', 'n', 'u', 't');

delete from uitslag where seizoen = '21ra' and datum < '2022-03-12' and partij in ('m', 'n', 'u', 't');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, plaats, datum) values
('2122', 'ipa', '1', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '2', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '3', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '4', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '5', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '6', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '7', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '8', 't', '', 'Alkmaar', '2022-04-29'),
('2122', 'ipa', '9', 't', '', 'Alkmaar', '2022-04-29');

select * from uitslag where seizoen = '2122' and teamCode = 'ipa'; 
delete from uitslag where seizoen = '2122' and teamCode = 'ipa';

-- TODO ranglijst Rapid
set @competitie = 'ira';
set @ronde = 5;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde order by bordNummer, witZwart;  -- and u.knsbNummer in (@wit, @zwart);