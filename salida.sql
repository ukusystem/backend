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
-- Table structure for table `equiposalida`
--

DROP TABLE IF EXISTS `equiposalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equiposalida` (
  `es_id` int NOT NULL AUTO_INCREMENT,
  `actuador` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`es_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equiposalida`
--

LOCK TABLES `equiposalida` WRITE;
/*!40000 ALTER TABLE `equiposalida` DISABLE KEYS */;
INSERT INTO `equiposalida` VALUES (1,'General','A1',1),(2,'Iluminación (Control de luz)','A2',1),(3,'Ventilación (Aire acondicionado)','A3',1),(4,'Calefacción (Control de temperatura)','A4',1),(5,'Persianas (Control de apertura/cierre)','A5',1),(6,'Alarma (Activación/desactivación)','A6',1),(7,'Riego automático','A7',1),(8,'Audio (Control de altavoces)','A8',1),(9,'Video (Control de cámaras)','A9',1),(10,'Control de humedad','A10',1),(11,'Control de gas','A11',1),(12,'Control de agua','A12',1),(13,'Control de energía','A13',1),(14,'Control de movimiento','A14',1),(15,'Control de acceso','A15',1),(16,'Control de seguridad','A16',1),(17,'Control de emergencia','A17',1),(18,'Control de tráfico','A18',1),(19,'Control de elevadores','A19',1),(20,'Control de ascensores','A20',1),(21,'Alarma contra incendio','A21',1),(22,'Acceso (Apertura de puerta)','A22',1);
/*!40000 ALTER TABLE `equiposalida` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-03 14:09:12
