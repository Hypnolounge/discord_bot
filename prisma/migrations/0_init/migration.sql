-- CreateTable
CREATE TABLE `compliments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `give` BIGINT NOT NULL,
    `receive` BIGINT NOT NULL,
    `comment` TEXT NOT NULL,

    INDEX `give-userid`(`give`),
    INDEX `receive-userid`(`receive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intros` (
    `userID` BIGINT NOT NULL,
    `message` BIGINT NOT NULL,
    `text` TEXT NOT NULL,

    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` BIGINT NOT NULL,
    `medium` VARCHAR(15) NOT NULL,
    `date` DOUBLE NULL,

    INDEX `session-userID`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `strikes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` BIGINT NOT NULL,
    `reason` TEXT NOT NULL,
    `severity` INTEGER NOT NULL,

    INDEX `strikes-userID`(`userID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` BIGINT NOT NULL,
    `channel` BIGINT NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `opened` DOUBLE NOT NULL,
    `closed` DOUBLE NOT NULL,
    `reason` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userID` BIGINT NOT NULL,
    `name` VARCHAR(35) NOT NULL,
    `displayname` VARCHAR(35) NOT NULL,
    `primary` VARCHAR(80) NOT NULL,
    `continent` VARCHAR(80) NOT NULL,

    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

