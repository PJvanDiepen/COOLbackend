use waagtoren;

-- waagtoren 1
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (7359913, 7584566, 7428960, 7657342, 7970094, 8285574, 8096242, 7778100, 7828183, 8795941)
order by s.knsbRating desc;

update speler set knsbTeam = "1"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (7359913, 7584566, 7428960, 7657342, 7970094, 8285574, 8096242, 7778100, 7828183, 8795941);

-- waagtoren 2
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (5968611, 6335670, 7613166, 7707832, 7129991, 7099950, 8112654, 8611922)
order by s.knsbRating desc;

update speler set knsbTeam = "2"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (5968611, 6335670, 7613166, 7707832, 7129991, 7099950, 8112654, 8611922);

-- waagtoren 3
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (6572511, 6207520, 8587337, 6225934, 8484443, 7758014, 9065100, 8400183)
order by s.knsbRating desc;

update speler set knsbTeam = "3"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (6572511, 6207520, 8587337, 6225934, 8484443, 7758014, 9065100, 8400183);

-- waagtoren 4
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (9056674, 7282033, 8372881, 7699010, 7546506, 7504310, 6951362, 7399469)
order by s.knsbRating desc;

update speler set knsbTeam = "4"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (9056674, 7282033, 8372881, 7699010, 7546506, 7504310, 6951362, 7399469);

-- waagtoren 5
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (7809285, 6212404, 8276752, 8182416, 8224502, 8073978, 8472530, 9023234)
order by s.knsbRating desc;

update speler set knsbTeam = "5"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (7809285, 6212404, 8276752, 8182416, 8224502, 8073978, 8472530, 9023234);

set @seizoen = '2425';
set @competitie = 'int';
set @ronde = 22;

-- waagtoren 6
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (7519930, 7321534, 7691728, 7771665, 9045388, 9077651, 9040845, 8966133)
order by s.knsbRating desc;

update speler set knsbTeam = "6"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (7519930, 7321534, 7691728, 7771665, 9045388, 9077651, 9040845, 8966133);

-- waagtoren n1
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (7428960, 8096242, 5968611, 7613166, 7707832, 7129991, 7099950, 8587337)
order by s.knsbRating desc;

update speler set nhsbTeam = "n1"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (7428960, 8096242, 5968611, 7613166, 7707832, 7129991, 7099950, 8587337);

-- waagtoren n2
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (8611922, 6930957, 6207520, 6225934, 7529522, 9065100)
order by s.knsbRating desc;

update speler set nhsbTeam = "n2"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (8611922, 6930957, 6207520, 6225934, 7529522, 9065100);

-- waagtoren n3
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (9056674, 6565801, 7468362, 7824674, 7758014, 7535385)
order by s.knsbRating desc;

update speler set nhsbTeam = "n3"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (9056674, 6565801, 7468362, 7824674, 7758014, 7535385);

-- waagtoren n4
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (6214153, 7282033, 7441346, 7731812, 7546506, 7210137)
order by s.knsbRating desc;

update speler set nhsbTeam = "n4"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (6214153, 7282033, 7441346, 7731812, 7546506, 7210137);

-- waagtoren n5
select naam, s.knsbNummer, s.knsbRating, nhsbTeam, knsbTeam from speler s
join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2425" and s.knsbNummer in (7399469, 6212404, 8276752, 8485059, 7101193, 7519930)
order by s.knsbRating desc;

update speler set nhsbTeam = "n5"
where clubCode = 0 and seizoen = "2425" and knsbNummer in (7399469, 6212404, 8276752, 8485059, 7101193, 7519930);

----

set @seizoen = '2425';
set @competitie = 'int';
set @ronde = 22;

select * from uitslag where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde; 
delete from ronde where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde; 


set @bord = 14;

set @wit = 126;
set @zwart = 9065100;

select * from gebruiker where knsbNummer = @wit;
select * from gebruiker where knsbNummer = @zwart;

select * from mutatie where knsbNummer = @wit;
select * from mutatie where knsbNummer = @zwart;

select * from persoon where knsbNummer = @wit;
select * from persoon where knsbNummer = @zwart;

select * from ranglijst;

select * from rating where knsbNummer = @zwart;

select * from speler where knsbNummer = @wit;
select * from speler where knsbNummer = @zwart;

select * from uitslag where knsbNummer = @wit;
select * from uitslag where knsbNummer = @zwart;

show tables;


update speler set intern2 = "ira" where seizoen = "2324" and knsbNummer = 7699010;

select * from ronde where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;
update ronde set datum = '2024-03-08' where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;


select * from uitslag where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;
update uitslag set datum = '2024-03-08' where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;


insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "ije", 13, "t", "", '2024-04-01');


select p.naam, r.*, u.* from uitslag u
join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.competitie and u.datum <> r.datum;

set @seizoen = "1920"; -- 20, 19, 18, 17, 16, 15, 13, 10, 8 en 1
set @seizoen = "2021"; -- 17
set @seizoen = "2122"; -- 25, 24, 23, 22, 21 en 20
set @seizoen = "2223"; -- 33, 32, 31, 30 en 29
set @seizoen = "2324"; -- 33

select * from uitslag where seizoen = @seizoen and teamCode = "int" and knsbNummer = 7099620;

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2223", "int", 7, 0, 7099950, "e", "", 0, "", '2022-10-25', "int"),
("2223", "int", 16, 0, 7099950, "e", "", 0, "", '2023-01-10', "int"),
("2223", "int", 21, 0, 7099950, "e", "", 0, "", '2023-02-21', "int"),
-- ("2223", "int", 25, 0, 7129991, "e", "", 0, "", '2023-03-28', "int"),
("2223", "int", 27, 0, 7099950, "e", "", 0, "", '2023-04-11', "int");

delete from uitslag where seizoen = @seizoen and teamCode = "int" and knsbNummer = 7970094;



select * from team where seizoen = "2324"; -- and teamCode = "nbb";
select * from ronde where seizoen = "2324" and teamCode = "nbb";