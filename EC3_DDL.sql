### SQL Database Setup

## Setup for All Database Tables:

# Drop Existing Tables:

DROP TABLE IF EXISTS `subtasks`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `Projects`;
DROP TABLE IF EXISTS `users`;

# Users Table Setup:

CREATE TABLE `users` (
`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
`name` varchar(255) DEFAULT NULL,
`email` varchar(255) DEFAULT NULL,
`password` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

# Projects Table Setup:

CREATE TABLE `Projects` (
  `Project_ID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `Project_Owner` int(11) NOT NULL,
  `Project_Name` varchar(255) NOT NULL,
  `Due_Date` date,
  `Status` varchar(255),
   FOREIGN KEY (Project_Owner) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Tasks Table Setup:

CREATE TABLE tasks(
    id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id int(11) DEFAULT NULL,
    name varchar(255) DEFAULT NULL,
    assignee_id int(11) DEFAULT NULL,
    due_date date NOT NULL,
    status varchar(255) NOT NULL,
    description varchar(500) DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES Projects(Project_ID),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

# Subtasks Table Setup:

CREATE TABLE subtasks(
    id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id int(11) DEFAULT NULL,
    task_id int(11) DEFAULT NULL,
    name varchar(255) DEFAULT NULL,
    assignee_id int(11) DEFAULT NULL,
    due_date date NOT NULL,
    status varchar(255) NOT NULL,
    description varchar(500) DEFAULT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (project_id) REFERENCES Projects(Project_ID),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

## Insertion Statements for Sample DB Data (Optional):

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Shelly Armstrong',  'shell38@gmail.com',   'U2FsdGVkX18IawwV/GgjafEReWofS6nXsYDZ9rI5Sw4='), #password
(2, 'Richard Collins',   'rich92@gmail.com',    'U2FsdGVkX194Yys4Y9SU/w/VgBRotbukKWOuGKvpLiw='); #password

INSERT INTO `Projects` (`Project_ID`, `Project_Name`, `Project_Owner`, `Due_Date`, `Status`) VALUES
(1, 'Tax Manager', 2,          '2020-09-22',   'On Hold'),
(2, 'Inventory Manager', 1,   '2020-12-23',   'In Progress'),
(3, 'Music Manager',  1,      '2021-03-19',   'Completed');

INSERT INTO `tasks` (`project_id`, `name`, `assignee_id`, `due_date`, `status`, `description`) VALUES
(2, 'Create template files.', 2, '2020-07-10', 'To Do', 'Use stagehand.');

INSERT INTO `subtasks` (`project_id`, `task_id`, `name`, `assignee_id`, `due_date`, `status`, `description`) VALUES
(2, 1, 'sample subtask', 1, '2020-07-15', 'To Do', 'sample subtask description');
