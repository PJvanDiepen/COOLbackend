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
-- Table structure for table `gebruiker`
--

DROP TABLE IF EXISTS `gebruiker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gebruiker` (
  `knsbNummer` int NOT NULL,
  `mutatieRechten` int NOT NULL,
  `uuidToken` char(36) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `datumEmail` date DEFAULT NULL,
  PRIMARY KEY (`uuidToken`),
  KEY `fk_gebruiker_persoon` (`knsbNummer`),
  CONSTRAINT `fk_gebruiker_persoon` FOREIGN KEY (`knsbNummer`) REFERENCES `persoon` (`knsbNummer`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gebruiker`
--

LOCK TABLES `gebruiker` WRITE;
/*!40000 ALTER TABLE `gebruiker` DISABLE KEYS */;
INSERT INTO `gebruiker` VALUES (7970094,1,'13d8f2ce-346d-11ed-872a-7c0507c81823','dannyderuiter@hotmail.com','2023-08-24'),(7665834,1,'8a1e43ac-e4fd-11eb-a3de-7c0507c81823','david.baanstra.ext@gmail.com',NULL),(7210137,1,'8c99dc24-2cac-11ed-872a-7c0507c81823','arjen.dibbets@gmail.com',NULL),(6212404,9,'9259cebd-aa7a-11eb-947d-7c0507c81823','pvdiepen@googlemail.com','2023-11-22'),(7269834,1,'d94400be-adb3-11eb-947d-7c0507c81823','geen','2021-05-05'),(6187885,1,'f0329c07-df7a-11eb-8864-7c0507c81823','pvdiepen@gmail.com',NULL);
/*!40000 ALTER TABLE `gebruiker` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-08 15:24:01
