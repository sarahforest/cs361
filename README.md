# cs361

Task management system for streamlining workflows with projects, tasks, and subtasks shared amongst users.

## High-Level Software Architecture

![Three-Tiered Software Architecture](https://github.com/sarahforest/cs361/blob/master/architecture.png)

## SQL Database Setup

User Table Setup:

```
CREATE TABLE `users` (
`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
`name` varchar(255) DEFAULT NULL,
`email` varchar(255) DEFAULT NULL,
`password` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

Projects Table Setup:

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
```

Insertion Statements for Sample DB Data (Optional):

```
INSERT INTO `Projects` (`Project_ID`, `Project_Name`, `Due_Date`, `Status`) VALUES
(1, 'Tax Manager',          '2020-09-22',   'On Hold'),
(2, 'Inventory Manager',    '2020-12-23',   'In Progress'),
(3, 'Music Manager',        '2021-03-19',   'Complete');
```

User_Projects Table Setup:

```
CREATE TABLE `user_projects` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (project_id) REFERENCES Projects(Project_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## Access User Credential

Access user credential: req.session.userId
