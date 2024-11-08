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
-- Table structure for table `pinessalida`
--

DROP TABLE IF EXISTS `pinessalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinessalida` (
  `ps_id` int NOT NULL AUTO_INCREMENT,
  `pin` tinyint unsigned NOT NULL,
  `es_id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`ps_id`),
  KEY `fk_pinessalida_equiposalida_es_id_idx` (`es_id`),
  CONSTRAINT `fk_pinessalida_equiposalida_es_id` FOREIGN KEY (`es_id`) REFERENCES `general`.`equiposalida` (`es_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinessalida`
--

LOCK TABLES `pinessalida` WRITE;
/*!40000 ALTER TABLE `pinessalida` DISABLE KEYS */;
INSERT INTO `pinessalida` VALUES (1,1,6,'Sirena',0,1),(2,2,2,'Luz roja',1,1),(3,3,2,'Luz verde',0,1),(4,4,6,'Estrobo',0,1),(5,5,3,'Ventilador pequeño',0,1),(6,6,3,'Ventilador mediano',0,1),(7,7,3,'Ventalidor grande',0,1),(8,8,1,'Cerradura magnética',0,1),(9,9,1,'-',0,0),(10,10,1,'-',0,0),(11,11,2,'Foco del centro',1,1),(12,12,2,'Foco de la izquierda',0,1),(13,13,13,'Tomacorriente',0,1),(14,14,13,'Tomacorriente',0,1),(15,15,2,'Foco de la derecha',0,1),(16,16,13,'Tomacorriente',0,1),(17,17,1,'Salida 17',0,0),(18,18,1,'Salida 18',0,0),(19,19,1,'Salida 19',0,0),(20,20,1,'Salida 20',0,0),(21,21,1,'Salida 21',0,0),(22,22,1,'Salida 22',0,0),(23,23,1,'Salida 23',0,0),(24,24,1,'Salida 24',0,0),(25,25,1,'Salida 25',0,0),(26,26,1,'Salida 26',0,0),(27,27,1,'Salida 27',0,0),(28,28,1,'Salida 28',0,0),(29,29,1,'Salida 29',0,0),(30,30,1,'Salida 30',0,0),(31,31,1,'Salida 31',0,0),(32,32,1,'Salida 32',0,0),(33,33,1,'Salida 33',0,0),(34,34,1,'Salida 34',0,0),(35,35,1,'Salida 35',0,0),(36,36,1,'Salida 36',0,0),(37,37,1,'Salida 37',0,0),(38,38,1,'Salida 38',0,0),(39,39,1,'Salida 39',0,0),(40,40,1,'Salida 40',0,0),(41,41,1,'Salida 41',0,0),(42,42,1,'Salida 42',0,0),(43,43,1,'Salida 43',0,0),(44,44,1,'Salida 44',0,0),(45,45,1,'Salida 45',0,0),(46,46,1,'Salida 46',0,0),(47,47,1,'Salida 47',0,0),(48,48,1,'Salida 48',0,0),(49,49,1,'Salida 49',0,0),(50,50,1,'Salida 50',0,0),(51,51,1,'Salida 51',0,0),(52,52,1,'Salida 52',0,0),(53,53,1,'Salida 53',0,0),(54,54,1,'Salida 54',0,0),(55,55,1,'Salida 55',0,0),(56,56,1,'Salida 56',0,0);
/*!40000 ALTER TABLE `pinessalida` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-08 11:50:50
