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
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `seizoen` char(4) NOT NULL,
  `teamCode` char(3) NOT NULL,
  `bond` char(1) DEFAULT NULL COMMENT 'k = knsb, n = nhsb',
  `poule` char(2) DEFAULT NULL,
  `omschrijving` varchar(45) DEFAULT NULL,
  `borden` int NOT NULL,
  `teamleider` int NOT NULL,
  PRIMARY KEY (`seizoen`,`teamCode`),
  KEY `fk_team_persoon` (`teamleider`),
  CONSTRAINT `fk_team_persoon` FOREIGN KEY (`teamleider`) REFERENCES `persoon` (`knsbNummer`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES ('1819','','','','geen',0,0),('1819','1','k','2b','KNSB 2b',8,0),('1819','2','k','4d','KNSB 4d',8,0),('1819','3','k','4e','KNSB 4e',8,0),('1819','4','k','6b','KNSB 6b',8,0),('1819','int','i','nt','interne competitie',0,0),('1819','kbe','k','be','KNSB beker',4,0),('1819','n1','n','1a','NHSB 1a',8,0),('1819','n2','n','2b','NHSB 2b',8,0),('1819','n3','n','2c','NHSB 2c',8,0),('1819','n4j','n','3c','NHSB 3c',6,0),('1819','n5','n','3d','NHSB 3d',6,0),('1819','n6j','n','3a','NHSB 3a',6,0),('1819','nbe','n','be','NHSB beker',4,0),('1819','nv1','n','vd','NHSB vd',4,0),('1920','','','','geen',0,0),('1920','1','k','2b','KNSB 2b',8,0),('1920','2','k','3d','KNSB 3d',8,0),('1920','3','k','4e','KNSB 4e',8,0),('1920','4','k','6c','KNSB 6c',8,0),('1920','int','i','nt','interne competitie',0,0),('1920','kbe','k','be','KNSB beker',4,0),('1920','n1','n','t','NHSB t',8,0),('1920','n2','n','2b','NHSB 2b',8,0),('1920','n3','n','2c','NHSB 2c',8,0),('1920','n4j','n','2c','NHSB 2c',8,0),('1920','n5','n','3b','NHSB 3b',6,0),('1920','n6j','n','3c','NHSB 3c',6,0),('1920','nbe','n','be','NHSB beker',4,0),('1920','nv1','n','vc','NHSB vc',4,0),('2021','','','','geen',0,0),('2021','1','k','2','KNSB 2 promotie',8,0),('2021','int','i','nt','interne competitie',0,0),('2122','','','','geen',0,0),('2122','1','k','1a','KNSB 1a',10,0),('2122','2','k','3d','KNSB 3d',8,0),('2122','3','k','4e','KNSB 4e',8,0),('2122','4','k','6c','KNSB 6c',8,0),('2122','int','i','nt','interne competitie',0,0),('2122','ira','i','ra','rapid competitie',0,0),('2122','izs','i','zs','einde seizoen snelschaken',0,0),('2122','izt','i','zt','Zwitsers test',0,0),('2122','kbe','k','be','KNSB beker',4,0),('2122','n1','n','t','NHSB t',8,0),('2122','n2','n','1a','NHSB 1a',8,0),('2122','n3','n','2a','NHSB 2a',8,0),('2122','n4','n','3b','NHSB 3b',6,0),('2223','','','','geen',0,0),('2223','1','k','1a','KNSB 1a',10,0),('2223','2','k','3d','KNSB 3d',8,0),('2223','3','k','4d','KNSB 4d',8,0),('2223','4','k','6c','KNSB 6c',8,0),('2223','int','i','nt','interne competitie',0,0),('2223','ira','i','ra','rapid competitie',0,0),('2223','kbe','k','be','KNSB beker',4,0),('2223','n1','n','t','NHSB t',8,0),('2223','n2','n','1a','NHSB 1a',8,0),('2223','n3','n','2b','NHSB 2b',6,0),('2223','nbe','n','be','NHSB beker',4,0),('2223','nv1','n','vf','NHSB vf',4,0),('2223','nv2','n','vb','NHSB vb',4,0),('2324','','','','geen',0,0),('2324','1','k','','KNSB ',10,0),('2324','2','k','3c','KNSB 3c',10,0),('2324','3','k','4c','KNSB 4c',10,0),('2324','4','k','6e','KNSB 6e',10,0),('2324','5','k','6e','KNSB 6e',10,0),('2324','int','i','nt','interne competitie',0,0),('2324','ira','i','ra','rapid competitie',0,0),('2324','kbe','k','be','KNSB beker',4,0),('2324','n1','n','t','NHSB t',8,0),('2324','n2','n','1a','NHSB 1a',8,0),('2324','n3','n','2a','NHSB 2a',6,0),('2324','n4','n','3a','NHSB 3a',8,0),('2324','nbe','n','be','NHSB beker',4,0),('2324','nv1','n','vc','NHSB vc',4,0),('2324','nv2','n','vb','NHSB vb',4,0);
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-08 15:24:02
