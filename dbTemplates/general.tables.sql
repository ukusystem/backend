/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `notificacion`;
CREATE TABLE `notificacion` (
  `n_id` int NOT NULL AUTO_INCREMENT,
  `n_uuid` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `evento` varchar(250) NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `mensaje` varchar(250) NOT NULL,
  `data` json DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`n_id`),
  UNIQUE KEY `n_uuid` (`n_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `notificacion_usuario`;
CREATE TABLE `notificacion_usuario` (
  `nu_id` int NOT NULL AUTO_INCREMENT,
  `u_id` int NOT NULL,
  `n_uuid` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_entrega` timestamp NOT NULL,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `leido` tinyint(1) NOT NULL,
  PRIMARY KEY (`nu_id`),
  KEY `n_uuid` (`n_uuid`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `notificacion_usuario_ibfk_1` FOREIGN KEY (`n_uuid`) REFERENCES `notificacion` (`n_uuid`),
  CONSTRAINT `notificacion_usuario_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuario` (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `registro_actividad`;
CREATE TABLE `registro_actividad` (
  `id_actividad` int NOT NULL AUTO_INCREMENT,
  `nombre_tabla` varchar(255) NOT NULL,
  `id_registro` int NOT NULL,
  `tipo_operacion` enum('INSERCION','ACTUALIZACION','ELIMINACION') NOT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `realizado_por` varchar(255) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_actividad`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb3;



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;