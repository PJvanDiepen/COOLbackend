-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: waagtoren
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping routines for database 'waagtoren'
--
/*!50003 DROP FUNCTION IF EXISTS `afzeggingenAftrek` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `afzeggingenAftrek`(versie int, afzeggingen int) RETURNS int
    DETERMINISTIC
begin
    if afzeggingen > 10 and versie = 2 then -- reglement artikel 12
        return (afzeggingen - 10) * 8;
	else
        return 0;
    end if;
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `komendeDinsdag` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `komendeDinsdag`() RETURNS date
    DETERMINISTIC
begin declare dinsdagVerschil int; set dinsdagVerschil = dayofweek(curdate()) - 3; if dinsdagverschil < 0 then return adddate(curdate(), (0 - dinsdagVerschil)); else return adddate(curdate(), (7 - dinsdagVerschil)); end if; end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `punten` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `punten`(seizoen char(4), teamCode char(3), versie int, knsbNummer int, eigenWaardeCijfer int, partij char(1), tegenstander int, resultaat char(1)) RETURNS int
    DETERMINISTIC
begin
    if versie = 4 then
        return rapidPunten(partij, resultaat);
	elseif versie = 5 then
        return zwitsersPunten(partij, resultaat);
    elseif partij = 'i' and resultaat = '1' then
        return waardeCijfer(versie, rating(seizoen, tegenstander)) + 12;
    elseif partij = 'i' and resultaat = '½' then
        return waardeCijfer(versie, rating(seizoen, tegenstander));
    elseif partij = 'i' and resultaat = '0' then
        return waardeCijfer(versie, rating(seizoen, tegenstander)) - 12;
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
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `rapidPunten` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `rapidPunten`(partij char(1), resultaat char(1)) RETURNS int
    DETERMINISTIC
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
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `rating` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `rating`(seizoen char(4), knsbNummer int) RETURNS int
    DETERMINISTIC
begin
    declare interneRating int;
    select s.interneRating
    into interneRating
    from speler s
    where s.seizoen = seizoen and s.knsbNummer = knsbNummer;
    return interneRating;
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `subgroep` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `subgroep`(seizoen char(4), versie int, knsbNummer int) RETURNS char(1) CHARSET utf8mb4
    DETERMINISTIC
begin
    declare interneRating int;
    set interneRating = rating(seizoen, knsbNummer);
    if versie = 4 or versie = 5 then -- geen subgroep bij rapid competitie of Zwitsers systeem
        return ' ';
	elseif interneRating < 1400 then
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
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `totalen` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `totalen`(seizoen char(4), competitie char(3), ronde int, datum date, versie int, knsbNummer int) RETURNS varchar(600) CHARSET utf8mb4
    DETERMINISTIC
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
   	declare rondenVerschil int default 0; -- 19
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
        select u.teamCode, u.rondeNummer, u.partij, u.tegenstanderNummer, u.witZwart, u.resultaat
        from uitslag u
        where u.seizoen = seizoen
            and u.knsbNummer = knsbNummer
            -- uitslagen van interne competitie tot en met deze ronde of uitslagen van externe competitie tot deze datum
            and ((u.teamCode = competitie and u.rondeNummer <= ronde) or (u.teamCode <> competitie and u.datum < datum))
            and u.anderTeam = competitie;
    declare continue handler for not found set found = false;
    if versie = 4 or versie = 5 then -- rapid competitie en Zwitsers systeem
        set rondenVerschil = 99; -- niet opnieuw tegen elkaar
    else -- interne competitie
        set startPunten = 300; -- reglement artikel 11
		set minimumInternePartijen = 20; -- reglement artikel 2
		set rondenVerschil = 7; -- reglement artikel 3
	end if;
    set interneRating = rating(seizoen, knsbNummer);
    set eigenWaardeCijfer = waardeCijfer(versie, interneRating);
    open uitslagen;
    fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
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
            set totaal = totaal + punten(seizoen, teamCode, versie, knsbNummer, eigenWaardeCijfer, partij, tegenstander, resultaat);
            fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
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
        rondenverschil, -- 19
        tegenstanders); -- 20
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `waardeCijfer` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `waardeCijfer`(versie int, interneRating int) RETURNS int
    DETERMINISTIC
begin
    if versie = 4 or versie = 5 then -- geen waardeCijfer bij rapid competitie of Zwitsers systeem
        return 0;
    elseif interneRating < 1400 then
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
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `zwitsersPunten` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `zwitsersPunten`(partij char(1), resultaat char(1)) RETURNS int
    DETERMINISTIC
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
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-08 15:24:02
