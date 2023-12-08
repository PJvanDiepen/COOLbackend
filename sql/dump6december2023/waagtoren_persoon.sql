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
-- Table structure for table `persoon`
--

DROP TABLE IF EXISTS `persoon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persoon` (
  `knsbNummer` int NOT NULL,
  `naam` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`knsbNummer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persoon`
--

LOCK TABLES `persoon` WRITE;
/*!40000 ALTER TABLE `persoon` DISABLE KEYS */;
INSERT INTO `persoon` VALUES (0,'onbekend'),(1,'niemand'),(2,'niemand'),(3,'niemand'),(4,'niemand'),(5,'niemand'),(6,'niemand'),(7,'niemand'),(8,'niemand'),(9,'niemand'),(10,'niemand'),(97,'P.J. van Diepen'),(99,'Peter Glashouwer'),(103,'Charles Stoorvogel'),(104,'Sietske de Greeuw'),(107,'Joris Beerda'),(108,'Aad Schuit'),(109,'Ron van den Bogert'),(110,'Tansu Madencioglu'),(111,'Jorn Visser'),(113,'Michiel Doodeman'),(114,'Bram Vink'),(115,'Harm Grouwstra'),(116,'Ruard Born'),(117,'Kees van Kuipers'),(119,'Randy Roest'),(121,'Nol den Bekker'),(122,'Olia Lutsiv'),(123,'Kees van Montfoort'),(124,'Michel Hollenberg'),(125,'Willemijn Jilink'),(126,'Alberto Alvarez Alonso'),(127,'Daniel Younk'),(130,'Kas de Jong'),(131,'Christian Breßler'),(132,'Daan van Boxtel'),(134,'Bas de Jong'),(135,'Miquel van Wijk'),(136,'Boris de Bie'),(138,'Thijs Velseboer'),(139,'Igor Tudor'),(141,'Hijrat Abey'),(142,'Lydia Buter'),(144,'Guido Bruin'),(145,'Jasper Breurkens'),(146,'Tigo Bakker'),(147,'Fabio Pasti'),(148,'Jelle Oving'),(149,'Dragos Dimulescu'),(5968611,'Nico Hauwert'),(6187885,'Bob de Mon'),(6192098,'Nico Brugman'),(6207520,'Henk van der Hauw'),(6212404,'Peter van Diepen'),(6214153,'Jan Poland'),(6225934,'Ruud Adema'),(6229652,'Jan Timman'),(6335670,'Hebert Perez Garcia'),(6483455,'Jeroen Smorenberg'),(6565801,'Ernst Hoogenes'),(6572511,'Bert Buitink'),(6661721,'Herman Nijhuis'),(6930957,'Leo van Steenoven'),(6951362,'Johan Plooijer'),(7063881,'Wim van Dijk'),(7079743,'Juan de Roda Husman'),(7084022,'John Kramer'),(7099620,'Peter Hoekstra'),(7099950,'Jos Vlaming'),(7101193,'Jacob Bleijendaal'),(7129991,'Gerard de Geus'),(7210137,'Arjen Dibbets'),(7227264,'Kiek Schouten'),(7269834,'Arie Boots'),(7269900,'Jan Ens'),(7282033,'Gerrit Lemmen'),(7292043,'Rob Freer'),(7321534,'Ronald Kamps'),(7359913,'Dimitri Reinderman'),(7386060,'Jan Meringa'),(7399469,'Nico Mak'),(7419621,'Frits Leenart'),(7428960,'Frank Agter'),(7468362,'Paul Toepoel'),(7468417,'Daan Geerke'),(7502143,'Rob Heijink'),(7504310,'Leonard Haakman'),(7509920,'Dirk van der Meiden'),(7518203,'Theo de Bruijn'),(7519930,'John Norder'),(7529522,'Willem Meyles'),(7535385,'Marten Coerts'),(7535396,'John Leek'),(7544438,'Fred Driesse'),(7546242,'Ronald Brink'),(7546506,'Edward Schenkel'),(7561653,'Mariska de Mie'),(7566031,'Corné van der Horst'),(7579154,'Robbert Waas'),(7582102,'Onno Vellinga'),(7584566,'Yong Hoon de Rover'),(7613166,'Peter Kalisvaart'),(7640798,'Johan Wester'),(7649213,'Dick Bouma'),(7657342,'Frank van Tellingen'),(7665834,'David Baanstra'),(7691728,'Karel Beentjes'),(7699010,'Ruud Niewenhuis'),(7701122,'Jan Drewes'),(7707084,'Ralph Versluis'),(7707832,'Ronald Groot'),(7731812,'Alexander Versluis'),(7739314,'Piet Pover'),(7757409,'Gerrit Valk'),(7758014,'Alex Albrecht'),(7771665,'Yvonne Schol'),(7809285,'Albert van der Meiden'),(7824674,'Guido Florijn'),(7828183,'Rob Konijn'),(7838963,'Kevin Tan'),(7879520,'Vincent Pandelaar'),(7904589,'Wim Nieland'),(7970094,'Danny de Ruiter'),(8073978,'Gerrit Peereboom'),(8096242,'Michaël van Liempt'),(8112654,'Ton Fasel'),(8144191,'Gerard Brouwers'),(8180810,'Midas Ratsma'),(8182416,'Andre Bremmers'),(8193548,'Daan de Vries'),(8224502,'Jan van Gijsen'),(8243312,'Harry Sluiter'),(8271560,'Bernard Mohl'),(8276752,'Theo Bakker'),(8285574,'Maaike Keetman'),(8291877,'Jawdat Adib'),(8305473,'Klaas Silver'),(8314834,'Henk Kleijn'),(8323029,'Runa de Vries'),(8335415,'Koos de Graaf'),(8350738,'Ramon Witte'),(8358966,'Ad van der Steur'),(8363982,'Afshin Mehnavian'),(8372881,'Egbert van Oene'),(8388105,'Marijn Wester'),(8400183,'Daan de Vetten'),(8461354,'Luuk van Steenoven'),(8472409,'Klaas Jan Koedijk'),(8472530,'Rosa Leek'),(8484443,'Chaim Bookelman'),(8485059,'Peter Duijs'),(8505585,'Max Bookelman'),(8521480,'Julian de Boer'),(8536319,'Jonathan Venema'),(8544646,'José van der Donk'),(8547110,'Milan de Boer'),(8547946,'Sander Meijer'),(8552038,'Kevin Brands'),(8571453,'Marit de Boer'),(8580374,'Jos Bakker'),(8580385,'Han Rauws'),(8580473,'Arman Sagian'),(8587337,'Max Hooijmans'),(8587348,'Merijn Hooijmans'),(8611922,'Tycho Bakker'),(8617367,'Arend Noordam'),(8716972,'Gijs Schaveling'),(8744494,'Joris Hartog'),(8750093,'Martin Rep'),(8773633,'Gerard Kortooms'),(8795941,'Guido van Hesselingen'),(8827588,'Roel Boesenkool'),(8865549,'Erno Brouwer'),(8886625,'Richard Meijer'),(8931098,'Sander Jagersma'),(8950876,'Jos Albers'),(8956805,'Vjekoslav Nemec'),(8978717,'Ellen van der Hoeven'),(8987176,'Bas Mazereeuw'),(8999771,'Simon Durivou'),(8999782,'Michel Durivou'),(9001586,'Abdul Rashid Ayobi'),(9023179,'Michael Sieval'),(9023234,'Albert Boekema'),(9050954,'Emiel Heinis');
/*!40000 ALTER TABLE `persoon` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-08 15:24:00
