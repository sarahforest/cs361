# cs361

Task management system for streamlining workflows with projects, tasks, and subtasks shared amongst users.

## How to Install:

- Clone this repository to your local machine: `git clone REPO-URL NEW-PROJECTS-NAME`

- `cd` into the cloned repository

- Make a fresh start of the git history for this project: `rm -rf .git && git init`

- Install dependencies: `npm install`

- Setup a MySql database for this project

- Prepare environment file: `cp example.env .env`

- Replace values in `.env` with your custom values

## SQL Database Setup

- Log in to your MySql database and run the SQL queries in `EC3_DDL.sql` file

- Or, if you have installed MySql on your local machine, execute with command:
  ```
  $ mysql --host=HOST_NAME --user=USER_NAME --password=PASSWORD --reconnect DATABASE_NAME < MIGRATION_FILE
  ```

- Sample data included in the SQL queries

## Scripts

- Start application: `npm start`

- Start application for development: `npm run dev`

## Deploying on Heroku

- Prerequisites: Install Git and the Heroku CLI

- Creating a Heroku remote: `heroku create`

- Renaming remotes: `git remote rename heroku heroku-staging`

- Deploying code: `git push heroku master`

- [References](https://devcenter.heroku.com/articles/git)

## Configuring MySQL on Heroku

- Prerequisite: Deploy application to Heroku

- Add ClearDB to the application:
  ```
  $ heroku addons:create cleardb:ignite
  ```

- Use `heroku config` to get the `CLEARDB_DATABASE_URL` value

- Copy the `CLEARDB_DATABASE_URL` value and assign it to the db connection variables in `.env`

- Setup database with migration:
  ```
  $ mysql --host=HOST_NAME --user=USER_NAME --password=PASSWORD --reconnect DATABASE_NAME < MIGRATION_FILE
  ```

- [References](https://devcenter.heroku.com/articles/cleardb)

## High-Level Software Architecture

![Three-Tiered Software Architecture](https://github.com/sarahforest/cs361/blob/master/architecture.png)

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

## Documentation

- Navigate to the jsdoc folder. `mkdir jsdoc && cd $_` if it does not exist

- Running the documentation generator on the command line
`../node_modules/jsdoc/jsdoc.js ../index.js` (path to jsdoc.js) (path to yourFile.js)

- This command will create a directory named out/ in the current working directory

- Within that directory, you will find the generated HTML pages (e.g. yourFile.html)

- [JSDOC Documentation](https://jsdoc.app/)
