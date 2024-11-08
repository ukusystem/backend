-- MySQL dump 10.13  Distrib 9.0.1, for Win64 (x86_64)
--
-- Host: localhost    Database: nodo1
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
-- Table structure for table `pinesentrada`
--

DROP TABLE IF EXISTS `pinesentrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinesentrada` (
  `pe_id` int NOT NULL AUTO_INCREMENT,
  `pin` tinyint unsigned NOT NULL,
  `ee_id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`pe_id`),
  KEY `fk_pinesentrada_equipoentrada_ee_id_idx` (`ee_id`),
  CONSTRAINT `fk_pinesentrada_equipoentrada_ee_id` FOREIGN KEY (`ee_id`) REFERENCES `general`.`equipoentrada` (`ee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinesentrada`
--

LOCK TABLES `pinesentrada` WRITE;
/*!40000 ALTER TABLE `pinesentrada` DISABLE KEYS */;
INSERT INTO `pinesentrada` VALUES (1,1,2,'Detector de movimiento pared',0,1),(2,2,2,'Detector de movimiento techo',1,1),(3,3,1,'Detector de humo',0,1),(4,4,1,'Entrada 4',1,1),(5,5,1,'Entrada 5',1,1),(6,6,7,'Entrada 6',0,1),(7,7,11,'Botón',0,1),(8,8,1,'Entrada 8',0,1),(9,9,1,'Entrada 9',0,1),(10,10,1,'-',0,0),(11,11,10,'Contacto magnético puerta',1,1),(12,12,12,'Interruptor de luz',0,1),(13,13,1,'-',0,0),(14,14,1,'-',0,0),(15,15,1,'-',0,0),(16,16,1,'-',0,0),(17,17,1,'Entrada 17',0,0),(18,18,1,'Entrada 18',0,0),(19,19,1,'Entrada 19',0,0),(20,20,1,'Entrada 20',0,0),(21,21,1,'Entrada 21',0,0),(22,22,1,'Entrada 22',0,0),(23,23,1,'Entrada 23',0,0),(24,24,1,'Entrada 24',0,0),(25,25,1,'Entrada 25',0,0),(26,26,1,'Entrada 26',0,0),(27,27,1,'Entrada 27',0,0),(28,28,1,'Entrada 28',0,0),(29,29,1,'Entrada 29',0,0),(30,30,1,'Entrada 30',0,0),(31,31,1,'Entrada 31',0,0),(32,32,1,'Entrada 32',0,0),(33,33,1,'Entrada 33',0,0),(34,34,1,'Entrada 34',0,0),(35,35,1,'Entrada 35',0,0),(36,36,1,'Entrada 36',0,0),(37,37,1,'Entrada 37',0,0),(38,38,1,'Entrada 38',0,0);
/*!40000 ALTER TABLE `pinesentrada` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-08 11:49:59
