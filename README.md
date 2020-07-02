# cs361

Task management system for streamlining workflows with projects, tasks, and subtasks shared amongst users.

High-Level Software Architecture:

![Three-Tiered Software Architecture](https://github.com/sarahforest/cs361/blob/master/architecture.png)

User Table Setup:

```
CREATE TABLE `users` (
`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
`name` varchar(255) DEFAULT NULL,
`email` varchar(255) DEFAULT NULL,
`password` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
