CREATE DATABASE kingsBurgers_db;
USE kingsBurgers_db;

CREATE TABLE burgers (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500)
);

CREATE TABLE eaters (
	`google_id` VARCHAR(200) NOT NULL PRIMARY KEY,
	`name` VARCHAR(100) NOT NULL
);

CREATE TABLE burgersEaten (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`burger_id` INT NOT NULL, 
	`eater_id` VARCHAR(200) NOT NULL, 
	`rating` INT NOT NULL DEFAULT 1, 
	`date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`burger_id`) REFERENCES burgers(`id`),
	FOREIGN KEY (`eater_id`) REFERENCES eaters(`google_id`)
);

INSERT INTO burgers (`name`, `description`)
VALUES ("The Double Play", "Swiss Cheese, Horseradish");

INSERT INTO burgers (`name`, `description`)
VALUES ("The Dugout", "Hashbrowns & Bacon");

INSERT INTO burgers (`name`, `description`)
VALUES ("The Slider", "Eggs & Hot Sauce");
