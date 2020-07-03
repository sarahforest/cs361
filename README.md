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

DROP TABLE IF EXISTS `Projects`;
CREATE TABLE `Projects` (
  `Project_ID` int(11) NOT NULL,
  `Project_Name` varchar(255) NOT NULL,
  `Due_Date` date,
  `Status` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `Projects`
  ADD PRIMARY KEY (`Project_ID`);

ALTER TABLE `Projects`
  MODIFY `Project_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- Insertion statements for sample DB data
INSERT INTO `Projects` (`Project_ID`, `Project_Name`, `Due_Date`, `Status`) VALUES
(1, 'Tax Manager',          '2020-09-22',   'On Hold'),
(2, 'Inventory Manager',    '2020-12-23',   'In Progress'),
(3, 'Music Manager',        '2021-03-19',   'Complete');

Access user credential: req.session.userId