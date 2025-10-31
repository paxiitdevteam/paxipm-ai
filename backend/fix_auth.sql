-- MariaDB Authentication Fix Script
-- Run this in MariaDB (mysql command line or GUI tool)

USE mysql;

-- Fix authentication plugin for root user
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

FLUSH PRIVILEGES;

-- Verify the change
SELECT user, host, plugin FROM mysql.user WHERE user='root' AND host='localhost';

-- Exit
EXIT;
