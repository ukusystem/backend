-- MySQL dump 10.13  Distrib 9.0.1, for Win64 (x86_64)
--
-- Host: localhost    Database: general
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `equipoentrada`
--

DROP TABLE IF EXISTS `equipoentrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipoentrada` (
  `ee_id` int NOT NULL AUTO_INCREMENT,
  `detector` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`ee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipoentrada`
--

LOCK TABLES `equipoentrada` WRITE;
/*!40000 ALTER TABLE `equipoentrada` DISABLE KEYS */;
INSERT INTO `equipoentrada` VALUES (1,'General','D1',1),(2,'Detector de movimiento','D2',1),(3,'Detector de calor','D3',1),(4,'Detector de gas','D4',1),(5,'Detector de intrusión','D5',1),(6,'Detector de vibración','D6',1),(7,'Detector de agua','D7',1),(8,'Detector de luz','D8',1),(9,'Detector de sonido','D9',1),(10,'Detector de proximidad','D10',1),(11,'Boton','D11',1),(12,'Interruptor','D12',1),(13,'Contacto magnético','D13',1),(14,'Detector de rotura de vidrio','D14',1),(15,'Detector de humo','D15',1),(16,'Pulsador de incendio','D16',1);
/*!40000 ALTER TABLE `equipoentrada` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-03 14:09:01
