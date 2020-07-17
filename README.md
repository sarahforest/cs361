# cs361

Task management system for streamlining workflows with projects, tasks, and subtasks shared amongst users.

## How to Install:

1. Clone this repo.

2. Copy "config~template.js" to a file named "config.js".

3. Customize the settings in "config.js" to match the settings in your database (and choose unique encryption secrets).

4. Log in to your database and run the SQL queries in "EC3_DDL.sql".

5. Run "npm install".

6. Run "node index.js 12345" (replacing "12345" with the port you wish to use).

7. Open a web browser and point it to the correct URL (e.g. "http://flip1.engr.oregonstate.edu:12345/").

8. To see sample data, log in as "shell38@gmail.com" using the password "password".

## High-Level Software Architecture

![Three-Tiered Software Architecture](https://github.com/sarahforest/cs361/blob/master/architecture.png)

## SQL Database Setup

See "EC3_DDL.sql".

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
