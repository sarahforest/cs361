# cs361

Task management system for streamlining workflows with projects, tasks, and subtasks shared amongst users.

## High-Level Software Architecture

![Three-Tiered Software Architecture](https://github.com/sarahforest/cs361/blob/master/architecture.png)

## SQL Database Setup

# User Table Setup:

```
CREATE TABLE `users` (
`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
`name` varchar(255) DEFAULT NULL,
`email` varchar(255) DEFAULT NULL,
`password` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
```

# Projects Table Setup:

```
DROP TABLE IF EXISTS `Projects`;
CREATE TABLE `Projects` (
  `Project_ID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `Project_Owner` int(11) NOT NULL,
  `Project_Name` varchar(255) NOT NULL,
  `Due_Date` date,
  `Status` varchar(255),
   FOREIGN KEY (Project_Owner) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


<<<<<<< HEAD
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
    task_id int(11) DEFAULT NULL,
    name varchar(255) DEFAULT NULL,
    assignee_id int(11) DEFAULT NULL,
    due_date date NOT NULL,
    status varchar(255) NOT NULL,
    description varchar(500) DEFAULT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


=======
ALTER TABLE `Projects`
  MODIFY `Project_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
```

# User_Projects Table Setup:

```
CREATE TABLE `user_projects` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (project_id) REFERENCES Projects(Project_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
>>>>>>> e6ac589d17a196b1d94064d54960cb46efee7691

# Insertion Statements for Sample DB Data (Optional):

```
INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Shelly Armstrong',  'shell38@gmail.com',   'U2FsdGVkX18IawwV/GgjafEReWofS6nXsYDZ9rI5Sw4='), #password
(2, 'Richard Collins',   'rich92@gmail.com',    'U2FsdGVkX194Yys4Y9SU/w/VgBRotbukKWOuGKvpLiw='); #password

<<<<<<< HEAD
INSERT INTO `Projects` (`Project_ID`, `Project_Name`, `Project_Owner`, `Due_Date`, `Status`) VALUES
(1, 'Tax Manager', 2,          '2020-09-22',   'On Hold'),
(2, 'Inventory Manager', 3,   '2020-12-23',   'In Progress'),
(3, 'Music Manager',  3,      '2021-03-19',   'Complete');


=======
INSERT INTO `Projects` (`Project_ID`, `Project_Name`, `Due_Date`, `Status`) VALUES
(1, 'Tax Manager',          '2020-09-22',   'On Hold'),
(2, 'Inventory Manager',    '2020-12-23',   'In Progress'),
(3, 'Music Manager',        '2021-03-19',   'Complete');

INSERT INTO `user_projects` (`id`, `user_id`, `project_id`) VALUES
(1, '1', '1'),
(2, '1', '2'),
(3, '2', '3');
```
>>>>>>> e6ac589d17a196b1d94064d54960cb46efee7691

## Authentication

- When successfully registered or logged in, creates an auth token (JWT) containing user id and stores it in session. (Session will preserve across multiple pages.)

- For protected endpoints that require authentication, use middleware ```requireAuth``` that verifies the auth token in session.

  - If the auth token is verified, the user data (id, name, email) will be stored in ```req.user```.

  - Otherwise redirects to homepage.

- Example:

  ```
  const { requireAuth } = require('./middleware.js');

  app.get('/projects', requireAuth, function(req, res) {
    console.log(req.user);
    /* more code here */
  });
  ```

  Output:
  ```
  {
    id: 1,
    name: 'Test',
    email: 'test1@test.com'
  }
  ```
