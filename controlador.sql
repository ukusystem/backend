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
-- Table structure for table `controlador`
--

DROP TABLE IF EXISTS `controlador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `controlador` (
  `ctrl_id` int NOT NULL AUTO_INCREMENT,
  `nodo` varchar(100) NOT NULL,
  `rgn_id` int NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `serie` varchar(100) NOT NULL,
  `ip` varchar(15) NOT NULL,
  `mascara` varchar(15) NOT NULL,
  `puertaenlace` varchar(15) NOT NULL,
  `puerto` smallint unsigned NOT NULL,
  `personalgestion` varchar(100) NOT NULL,
  `personalimplementador` varchar(100) NOT NULL,
  `seguridad` tinyint NOT NULL,
  `conectado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  `modo` tinyint NOT NULL DEFAULT '0',
  `motionrecordseconds` int NOT NULL DEFAULT '30',
  `res_id_motionrecord` int NOT NULL DEFAULT '3',
  `motionrecordfps` int NOT NULL DEFAULT '30',
  `motionsnapshotseconds` int NOT NULL DEFAULT '30',
  `res_id_motionsnapshot` int NOT NULL DEFAULT '3',
  `motionsnapshotinterval` int NOT NULL DEFAULT '5',
  `res_id_streamprimary` int NOT NULL DEFAULT '3',
  `streamprimaryfps` int NOT NULL DEFAULT '30',
  `res_id_streamsecondary` int NOT NULL DEFAULT '2',
  `streamsecondaryfps` int NOT NULL DEFAULT '30',
  `res_id_streamauxiliary` int NOT NULL DEFAULT '1',
  `streamauxiliaryfps` int NOT NULL DEFAULT '30',
  PRIMARY KEY (`ctrl_id`),
  KEY `fk_controlador_region_rgn_id_idx` (`rgn_id`) USING BTREE,
  KEY `fk_controlador_resolucion_res_id_1_idx` (`res_id_motionrecord`),
  KEY `fk_controlador_resolucion_res_id_2_idx` (`res_id_motionsnapshot`),
  KEY `fk_controlador_resolucion_res_id_3_idx` (`res_id_streamprimary`),
  KEY `fk_controlador_resolucion_res_id_4_idx` (`res_id_streamsecondary`),
  KEY `fk_controlador_resolucion_res_id_5_idx` (`res_id_streamauxiliary`),
  CONSTRAINT `fk_controlador_region_rgn_id` FOREIGN KEY (`rgn_id`) REFERENCES `region` (`rgn_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_1` FOREIGN KEY (`res_id_motionrecord`) REFERENCES `resolucion` (`res_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_controlador_resolucion_res_id_2` FOREIGN KEY (`res_id_motionsnapshot`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_3` FOREIGN KEY (`res_id_streamprimary`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_4` FOREIGN KEY (`res_id_streamsecondary`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_5` FOREIGN KEY (`res_id_streamauxiliary`) REFERENCES `resolucion` (`res_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `controlador`
--

LOCK TABLES `controlador` WRITE;
/*!40000 ALTER TABLE `controlador` DISABLE KEYS */;
INSERT INTO `controlador` VALUES (1,'Placa 1',1,'Manuel Fuentes 833, San Isidro','Primera placa impresa',-12.1011250,-77.0298000,'admin','U7SYCC+FT4OJvIs/LZApbk1SBjKxzJ8gzr2ykjEOxqc=','SERIE1','172.16.3.191','255.255.0.0','172.16.0.1',3333,'Juan','Juan',0,1,1,1,600,1,60,500,1,499,1,60,1,60,1,60),(2,'1',2,'1','1',1.0000000,1.0000000,'admin','a4Nh1DAMwGI6scKyNr9V4bphUpe0/0Ngs5+8DnZSKXw=','1','172.16.3.193','255.255.0.0','172.16.0.1',3333,'1','1',0,0,1,0,30,1,30,30,1,5,1,30,1,30,1,30),(3,'2',1,'2','2',2.0000000,2.0000000,'admin','lvke1nkR9CCRqGqLohzGSgu4ulNuJOSenyyqfD+/FrA=','2','2.2.2.2','2.2.2.2','2.2.2.2',123,'2','2',0,0,1,0,20,1,20,20,1,10,1,20,1,20,1,20);
/*!40000 ALTER TABLE `controlador` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-03 15:12:32
