use waagtoren;

drop function rating; -- 0-0-0.nl versie 0.8.59

delimiter $$
create function rating(clubCode int, seizoen char(4), knsbNummer int)
    returns int deterministic
begin
    declare interneRating int;
    select s.interneRating
    into interneRating
    from speler s
    where s.clubCode = clubCode and s.seizoen = seizoen and s.knsbNummer = knsbNummer;
    return interneRating;
end;
$$
delimiter ;

-- subgroep, waardeCijfer, punten en totalen
-- bevatten de logica voor verschillende reglementen voor de interne, rapid en jeugd competitie van de Waagtoren
-- versie 1 is de oorspronkelijke versie van Alkmaar systeem (geen SQL code)
-- versie 2 afzeggingenAftrek in seizoen = 1819, 1920, 2021
-- versie 3 geen afzeggingenAftrek vanaf seizoen = 2122
-- versie 4 rapidPunten voor rapid competitie
-- versie 5 zwitsersPunten voor Zwitsers systeem
-- versie 6 jeugd competitie met barrière punten en drie keer afzeggen

drop function subgroep; -- 0-0-0.nl versie 0.8.59

delimiter $$
create function subgroep(clubCode int, seizoen char(4), versie int, knsbNummer int)
    returns char(1) deterministic
begin
    declare interneRating int;
    set interneRating = rating(clubCode, seizoen, knsbNummer);
    if versie = 4 or versie = 5 then -- geen subgroep bij rapid competitie of Zwitsers systeem
        return ' ';
	elseif versie = 6 and interneRating < 1100 then -- kleine letters voor jeugd competitie
        return 'd';
	elseif versie = 6 and interneRating < 1200 then
        return 'c';
    elseif versie = 6 and interneRating < 1300 then
        return 'b';
    elseif versie = 6 then
        return 'a';    
	elseif interneRating < 1400 then -- grote letters voor interne competitie 
        return 'H';
	elseif interneRating < 1500 then
        return 'G';
	elseif interneRating < 1600 then
        return 'F';
    elseif interneRating < 1700 then
        return 'E';
    elseif interneRating < 1800 then
        return 'D';
    elseif interneRating < 1900 then
        return 'C';
    elseif interneRating < 2000 then
        return 'B';
    else
        return 'A';
    end if;
end;
$$
delimiter ;

drop function waardeCijfer; -- 0-0-0.nl versie 0.8.39

delimiter $$
create function waardeCijfer(versie int, interneRating int)
    returns int deterministic
begin
    if versie = 4 or versie = 5 then -- geen waardeCijfer bij rapid competitie of Zwitsers systeem
        return 0;
	elseif versie = 6 and interneRating < 1100 then -- verschoven waardeCijfer voor jeugd competitie
        return 9;
	elseif versie = 6 and interneRating < 1200 then
        return 10;
    elseif versie = 6 and interneRating < 1300 then
        return 11;
    elseif versie = 6 then
        return 12;    
    elseif interneRating < 1400 then -- waardeCijfer voor interne competitie
        return 5; -- H
	elseif interneRating < 1500 then
        return 6; -- G
	elseif interneRating < 1600 then
        return 7; -- F
    elseif interneRating < 1700 then
        return 8; -- E
    elseif interneRating < 1800 then
        return 9; -- D
    elseif interneRating < 1900 then
        return 10; -- C
    elseif interneRating < 2000 then
        return 11; -- B
    else
        return 12; -- A
    end if;
end;
$$
delimiter ;

drop function punten; -- 0-0-0.nl versie 0.8.59

delimiter $$
create function punten(clubCode int, seizoen char(4), teamCode char(3), versie int, knsbNummer int, eigenWaardeCijfer int, partij char(1), tegenstander int, resultaat char(1))
    returns int deterministic -- reglement artikel 12
begin
    if versie = 4 then
        return rapidPunten(partij, resultaat);
	elseif versie = 5 then
        return zwitsersPunten(partij, resultaat);
    elseif versie = 6 and partij = 'j' then
        return eigenWaardeCijfer + 4; -- uitsluitend voor de jeugd competitie   
    elseif partij = 'i' and resultaat = '1' then
        return waardeCijfer(versie, rating(clubCode, seizoen, tegenstander)) + 12;
    elseif partij = 'i' and resultaat = '½' then
        return waardeCijfer(versie, rating(clubCode, seizoen, tegenstander));
    elseif partij = 'i' and resultaat = '0' then
        return waardeCijfer(versie, rating(clubCode, seizoen, tegenstander)) - 12;
    elseif partij = 'a' then -- afwezig
        return eigenWaardeCijfer - 4;
    elseif partij = 'r' then -- reglementaire remise of vrijgesteld
        return eigenWaardeCijfer;
    elseif partij = 'o' then -- oneven
		return eigenWaardeCijfer + 12;
    elseif partij = 'w' then -- reglementaire winst
        return eigenWaardeCijfer + 12;
	elseif partij = 'v' then -- reglementair verlies
		return eigenWaardeCijfer - 12;
    elseif partij = 'e' and teamCode = 'int' then -- externe partij tijdens interne ronde
        return eigenWaardeCijfer;
	elseif partij = 'e' then -- elke externe partij
        return 4;
	else
		return 0;   
    end if;
end;
$$
delimiter ;

drop function rapidPunten; -- 0-0-0.nl versie 0.6.6

delimiter $$
create function rapidPunten(partij char(1), resultaat char(1))
    returns int deterministic
begin
    if partij = 'i' and resultaat = '1' then
        return 30;
    elseif partij = 'i' and resultaat = '½' then
        return 15;
    elseif partij = 'i' and resultaat = '0' then
        return 0;
    elseif partij = 'o' then -- oneven
		return 30;
	else
		return 10; -- bye  
    end if;
end;
$$
delimiter ;

drop function zwitsersPunten; -- 0-0-0.nl versie 0.7.24

delimiter $$
create function zwitsersPunten(partij char(1), resultaat char(1))
    returns int deterministic
begin
    if partij = 'i' and resultaat = '1' then
        return 10;
    elseif partij = 'i' and resultaat = '½' then
        return 5;
    elseif partij = 'i' and resultaat = '0' then
        return 0;
    elseif partij = 'o' then -- oneven
		return 10;
	else
		return 0;  
    end if;
end;
$$
delimiter ;

drop function totalen; -- 0-0-0.nl versie 0.8.59

delimiter $$
create function totalen(clubCode int, seizoen char(4), competitie char(3), ronde int, datum date, versie int, knsbNummer int)
    returns varchar(600) deterministic
begin
    declare sorteer int default 0; -- 0
    declare prijs int default 1; -- 1
    declare winstIntern int default 0; -- 2
    declare winstExtern int default 0; -- 3
    declare interneRating int; -- 4
    declare remiseIntern int default 0; -- 5
    declare verliesIntern int default 0; -- 6
    declare witIntern int default 0; -- 7
    declare zwartIntern int default 0; -- 8
    declare oneven int default 0; -- 9
	declare afzeggingen int default 0; -- 10
    declare aftrek int default 0; -- 11
    declare totaal int default 0; -- 12
    declare startPunten int default 0; -- 13
    declare eigenWaardeCijfer int; -- 14
	declare remiseExtern int default 0; -- 15
    declare verliesExtern int default 0; -- 16
    declare witExtern int default 0; -- 17
    declare zwartExtern int default 0; -- 18
   	declare minimumPartijenGeleden int default 99; -- 19
    declare tegenstanders varchar(500) default ''; -- 20
    declare reglementairGewonnen int default 0;
    declare externTijdensInterneRonde int default 0;
    declare minimumInternePartijen int default 0;
    declare internKleur int; -- 0 = wit, 1 = zwart
    declare internResultaat int; -- 0 = verlies, 1 = remise, 2 = winst
    declare teamCode char(3);
    declare rondeNummer int;
    declare partij char(1);
    declare tegenstander int;
    declare witZwart char(1);
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.clubCode, u.teamCode, u.rondeNummer, u.partij, u.tegenstanderNummer, u.witZwart, u.resultaat
        from uitslag u
        where u.clubCode = clubCode and u.seizoen = seizoen and u.knsbNummer = knsbNummer
            -- uitslagen van interne competitie tot en met deze ronde of uitslagen van externe competitie tot deze datum
            and ((u.teamCode = competitie and u.rondeNummer <= ronde) or (u.teamCode <> competitie and u.datum < datum))
            and u.competitie = competitie;
    declare continue handler for not found set found = false;
    if versie <= 4 then -- interne competitie
		set minimumInternePartijen = 20; -- reglement artikel 2
		set minimumPartijenGeleden = 7; -- reglement artikel 3
	end if;
    set interneRating = rating(clubCode, seizoen, knsbNummer);
    set startPunten = extraPunten(versie, interneRating);
    set eigenWaardeCijfer = waardeCijfer(versie, interneRating);
    open uitslagen;
    fetch uitslagen into clubCode, teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
    while found
        do
            if partij = 'i' and resultaat = '1' then
                set internResultaat = 2;
                set winstIntern = winstIntern + 1;
            elseif partij = 'i' and resultaat = '½' then
                set internResultaat = 1;
                set remiseIntern = remiseIntern + 1;
            elseif partij = 'i' and resultaat = '0' then
                set internResultaat = 0;
                set verliesIntern = verliesIntern + 1;
            elseif partij = 'a' then
                set afzeggingen = afzeggingen + 1;
            elseif partij = 'o' then
                set oneven = oneven + 1;
            elseif partij = 'w' then
                set reglementairGewonnen = reglementairGewonnen + 1;
            elseif partij = 'e' and teamCode = 'int' then
                set externTijdensInterneRonde = externTijdensInterneRonde + 1;
            elseif partij = 'e' and resultaat = '1' then
                set winstExtern = winstExtern + 1;
            elseif partij = 'e' and resultaat = '½' then
                set remiseExtern = remiseExtern + 1;
            elseif partij = 'e' and resultaat = '0' then
                set verliesExtern = verliesExtern + 1;
            end if;
            if partij = 'i' and witZwart = 'w' then
                set internKleur = 0;
                set witIntern = witIntern + 1;
            elseif partij = 'i' and witZwart = 'z' then
                set internKleur = 1;
                set zwartIntern = zwartIntern + 1;
            elseif partij = 'e' and witZwart = 'w' then
                set witExtern = witExtern + 1;
            elseif partij = 'e' and witZwart = 'z' then
                set zwartExtern = zwartExtern + 1;
            end if;
            if partij = 'i' then 
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' ', internKleur, ' ', tegenstander, ' ', internResultaat);
            elseif partij = 'o' then
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' 0 0 0'); -- verliest met wit indien geen tegenstander
            end if;
            set totaal = totaal + punten(clubCode, seizoen, teamCode, versie, knsbNummer, eigenWaardeCijfer, partij, tegenstander, resultaat);
            fetch uitslagen into clubCode, teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
        end while; 
    close uitslagen;
    set tegenstanders = concat(tegenstanders, ' 0'); -- rondeNummer = 0
    if witIntern = 0 and zwartIntern = 0 and oneven = 0 then
        set prijs = 0;
        set sorteer = witExtern + zwartExtern;
	else
        if (witIntern + zwartIntern + oneven + reglementairGewonnen + externTijdensInterneRonde) < minimumInternePartijen then
			set prijs = 0;
		end if;
        set aftrek = afzeggingenAftrek(versie, afzeggingen);
        set sorteer = startPunten + totaal - aftrek;
    end if;
    return concat(
        lpad(sorteer,3,'0'), ' ', -- 0
        prijs, ' ', -- 1
        lpad(winstIntern,2,'0'), ' ', -- 2
        lpad(winstExtern,2,'0'), ' ', -- 3
        lpad(interneRating,4, '0'), ' ', -- 4
        remiseIntern, ' ', -- 5
        verliesIntern, ' ', -- 6
        witIntern, ' ', -- 7
        zwartIntern, ' ', -- 8
        oneven, ' ', -- 9
        afzeggingen, ' ', -- 10
        aftrek, ' ', -- 11
        totaal, ' ', -- 12
        startPunten, ' ', -- 13
        eigenWaardeCijfer, ' ', -- 14
        remiseExtern, ' ', -- 15
        verliesExtern, ' ', -- 16
        witExtern, ' ', -- 17
        zwartExtern, ' ', -- 18
        minimumPartijenGeleden, -- 19
        tegenstanders); -- 20
end;
$$
delimiter ;

drop function extraPunten; -- 0-0-0.nl versie 0.8.41

delimiter $$
create function extraPunten(versie int, interneRating int)
    returns int deterministic
begin
    if versie <= 3 then -- interne competitie reglement artikel 11
        return 300;
	elseif versie = 6 and interneRating < 1100 then -- barrière punten voor jeugd competitie
        return 270;
	elseif versie = 6 and interneRating < 1200 then
        return 300;
    elseif versie = 6 and interneRating < 1300 then
        return 330;
    elseif versie = 6 then
        return 360;
    else
        return 0;
    end if;
end;
$$
delimiter ;

drop function afzeggingenAftrek; -- 0-0-0.nl versie 0.8.41

delimiter $$
create function afzeggingenAftrek(versie int, afzeggingen int)
    returns int deterministic
begin
    if versie = 2 and afzeggingen > 10 then -- interne competitie reglement artikel 12
        return (afzeggingen - 10) * 8;
    elseif versie = 6 and afzeggingen > 3 then -- jeugd competitie eerste drie keer afzeggen omgekeerde aftrek
        return -12;
    elseif versie = 6 then
        return afzeggingen * -4;
	else
        return 0;
    end if;
end;
$$
delimiter ;

set @club = 0;
set @seizoen = '2122';
set @versie = 3;
set @datum = '2022-04-11';

set @knsbNummer = 6212404; -- Peter van Diepen
set @competitie = 'int';

-- ranglijst
select
  s.knsbNummer,
  naam,
  subgroep(@club, @seizoen, @versie, s.knsbNummer) as subgroep,
  totalen(@club, @seizoen, @competitie, 0, @datum, @versie, s.knsbNummer) as totalen
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where clubCode = @club and seizoen = @seizoen
order by totalen desc;

-- punten van alle uitslagen per speler
select u.datum,
       u.rondeNummer,
       u.bordNummer,
       u.witZwart,
       u.tegenstanderNummer,
       p.naam,
       u.resultaat,
       u.teamCode,
       u.partij,
       r.uithuis,
       r.tegenstander,
       punten(
          @club,
          @seizoen,
          u.teamCode,
          @versie,
          @knsbNummer,
          waardeCijfer(@versie, rating(@club, @seizoen, @knsbNummer)),
          u.partij,
          u.tegenstanderNummer,
          u.resultaat) as punten
from uitslag u
join persoon p on u.tegenstanderNummer = p.knsbNummer
join ronde r on u.clubCode = r.clubCode and u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.clubCode = @club 
    and u.seizoen = @seizoen
    and u.knsbNummer = @knsbNummer
    and u.competitie = @competitie
order by u.datum, u.bordNummer;

-- aantal mutaties per gebruiker 
select naam, m.knsbNummer, count(*) mutaties
from mutatie m join persoon p on m.knsbNummer = p.knsbNummer where invloed > 0
group by m.knsbNummer
order by mutaties desc;

-- alle ratinglijsten (met correlated subqueries)
select r.maand, r.jaar from rating as r
where r.knsbNummer = (select een.knsbNummer from rating as een where een.maand = r.maand limit 1);

-- agenda voor alle interne en externe ronden per speler (met common table expressions)
with
  s as (select * from speler where clubCode = @club and seizoen = @seizoen and knsbNummer = @knsbNummer),
  u as (select * from uitslag where clubCode = @club and seizoen = @seizoen and knsbNummer = @knsbNummer)
select r.*, u.partij
  from ronde r
  join s on r.clubCode = s.clubCode and r.seizoen = s.seizoen
  left join u on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
where r.clubCode = @club and r.seizoen = @seizoen and r.teamCode in (s.knsbTeam, s.nhsbTeam, s.intern1, s.intern2, s.intern3, s.intern4, s.intern5)
order by r.datum, r.rondeNummer;

set @club = 0;
set @seizoen = '2324';
set @knsbNummer = 7428960; -- Frank Agter
set @datum = '2023-10-17';

-- uitslagen / ronden op dezelfde datum
select u.teamCode, u.rondeNummer, u.competitie, u.partij, r.uithuis
  from uitslag u 
  join ronde r on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer  
where u.clubCode = @club and  u.seizoen = @seizoen and u.knsbNummer = @knsbNummer and u.datum = @datum 
order by u.teamCode, u.rondeNummer;

-- alle externe wedstrijden van het seizoen
select r.*, bond, poule, omschrijving, borden, naam from ronde r
join team t on r.clubCode = t.clubCode and r.seizoen = t.seizoen and r.teamCode = t.teamCode
join persoon on teamleider = knsbNummer
where r.clubCode = @club and r.seizoen = @seizoen and r.teamCode not in ('int', 'ira')
order by r.datum, r.teamCode;

set @club = 0;
set @seizoen = '2223';
set @teamCode = 'int';
set @datum = '2022-03-01';

-- wie gaat extern spelen per datum
select u.*, naam from uitslag u join persoon p on u.knsbNummer = p.knsbNummer   
where clubCode = @club and seizoen = @seizoen and partij in ('t', 'u') and datum = @datum;

update uitslag set partij = 'u' where knsbNummer = 7879520 and seizoen = @seizoen and partij in ('t', 'u') and datum = @datum;

-- interne ronden per seizoen van verschillende competities
select * from ronde where clubCode = @club and seizoen = @seizoen and substring(teamCode, 1, 1) = 'i' order by datum;

-- ronden per seizoen en competitie met aantal uitslagen
with u as 
  (select clubCode, seizoen, teamCode, rondeNummer, count(resultaat) aantalResultaten 
   from uitslag where clubCode = @club and seizoen = @seizoen and teamCode = @teamCode and resultaat in ('1', '0', '½') group by rondeNummer)   
select r.*, ifnull(aantalResultaten, 0) resultaten from ronde r
left join u on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
where r.clubCode = @club and r.seizoen = @seizoen and r.teamCode = @teamCode
order by r.rondeNummer;

-- zoek in naam
select p.*, g.* from persoon p left join gebruiker g on g.knsbNummer = p.knsbNUmmer
where p.naam regexp 'jan';

-- aantal uitslagen per seizoen per partij
select clubCode, seizoen, partij, count(partij) aantal from uitslag 
group by clubCode, seizoen, partij
order by aantal desc;  --  seizoen, partij;

-- aantal mutaties per gebruiker
select naam, m.knsbNummer, count(*) mutaties
from mutatie m join persoon p on m.knsbNummer = p.knsbNummer where invloed > 0
group by m.knsbNummer
order by mutaties desc;

-- wijzig mutatieRechten
set @knsbNummer = 7101193; -- Jacob Bleijendaal
set @knsbNummer = 6572511; -- Bert Buitink

select * from gebruiker g join persoon p on p.knsbNummer = g.knsbNummer 
where g.knsbNummer = @knsbNummer;

update gebruiker set mutatieRechten = 4 where knsbNummer = @knsbNummer; -- systeembeheerder

-- laatste mutaties
select * from mutatie order by tijdstip desc;

select * from team where seizoen = @seizoen;

set @club = 0;
set @seizoen = '2223';
set @knsbNummer = 7504310;
set @datum = '2022-10-25';

-- de teamleiders
select t.*, naam from team t join persoon p on p.knsbNummer = t.teamleider where seizoen = @seizoen;

-- voor teamleiders
with u as 
  (select * from uitslag where clubCode = @club and seizoen = @seizoen and not teamCode = competitie and datum = @datum)
select s.nhsbTeam, s.knsbTeam, s.knsbNummer, s.knsbRating, naam, u.teamCode, u.partij
from speler s
  join persoon p on s.knsbNummer = p.knsbNummer
  left join u on s.clubCode = @club and s.seizoen = @seizoen and s.knsbNummer = u.knsbNummer
where s.seizoen = @seizoen 
order by s.knsbRating desc, u.teamCode;

-- wijzig naam
select * from persoon where knsbNummer = 106;

update persoon set naam = 'Abdulrashid Ayobi' where knsbNummer = 106;