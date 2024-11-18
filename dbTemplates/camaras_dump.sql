-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: nodo1
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `camara`
--

DROP TABLE IF EXISTS `camara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camara` (
  `cmr_id` int NOT NULL AUTO_INCREMENT,
  `serie` varchar(100) NOT NULL,
  `tc_id` int NOT NULL,
  `m_id` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `ip` varchar(15) NOT NULL,
  `puerto` smallint unsigned NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `puertows` smallint unsigned NOT NULL,
  `mascara` varchar(15) NOT NULL,
  `puertaenlace` varchar(15) NOT NULL,
  `conectado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`cmr_id`),
  KEY `fk_camara_tipocamara_tc_id_idx` (`tc_id`),
  KEY `fk_camara_marca_m_id_idx` (`m_id`),
  CONSTRAINT `fk_camara_marca_m_id` FOREIGN KEY (`m_id`) REFERENCES `general`.`marca` (`m_id`),
  CONSTRAINT `fk_camara_tipocamara_tc_id` FOREIGN KEY (`tc_id`) REFERENCES `general`.`tipocamara` (`tc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camara`
--

LOCK TABLES `camara` WRITE;
/*!40000 ALTER TABLE `camara` DISABLE KEYS */;
INSERT INTO `camara` VALUES (1,'CAM1',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.100',55443,'Cámara 1',55430,'255.255.0.0','172.16.0.1',0,0),(2,'CAM2',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.101',55443,'Exterior',55431,'255.255.0.0','172.16.0.1',1,1),(3,'CAM3',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.102',55443,'Puerta',55432,'255.255.0.0','172.16.0.1',1,1),(4,'CAM4',3,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.103',55443,'Garaje',55433,'255.255.0.0','172.16.0.1',1,1),(5,'CAM5',3,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.104',55443,'Kitchen',55434,'255.255.0.0','172.16.0.1',1,1),(6,'CAM6',3,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.105',55443,'Desarrollo',55435,'255.255.0.0','172.16.0.1',1,1),(7,'CAM7',3,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.106',55443,'Comedor',55436,'255.255.0.0','172.16.0.1',1,1),(8,'CAM8',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.107',55443,'Primer piso - Reuniones',55437,'255.255.0.0','172.16.0.1',1,1),(9,'CAM9',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.108',55443,'Cámara 9',55438,'255.255.0.0','172.16.0.1',0,0),(10,'CAM10',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.109',55443,'Primer piso - interior',55439,'255.255.0.0','172.16.0.1',1,1),(11,'CAM11',1,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.110',55443,'Cámara 11',55440,'255.255.0.0','172.16.0.1',0,0),(12,'CAM12',3,1,'admin','+fHL53d9GKUS842X7U+hlA==','172.16.4.113',55443,'Cámara exterior PTZ',55440,'255.255.0.0','172.16.0.1',1,1),(13,'Cam176',2,1,'admin','hQGr0tZg83kUEIZsr+lPwg==','172.16.3.176',3333,'Cámara en panel',1234,'255.255.0.0','172.16.0.1',0,1);
/*!40000 ALTER TABLE `camara` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-18 17:00:36
