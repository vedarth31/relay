# relay

formula electric order management system

## step one: setup database

1. on mac OS, in order to install postgresql, just run in your terminal:
``` brew install postgresql```

    follow instructions online for windows. 

2. then run:
```brew services start postgresql```

3. verify install by running:
```psql --version```

4. access the postgres shell as a default user:
```psql postgres```

    if you get a "command not found" error, you might need to add PostgreSQL to your PATH or use the full path to psql.

5. create a new db user:
```CREATE USER myuser WITH PASSWORD 'mypassword';```

    replace 'myuser' and 'mypassword' with whatever you want.

6. create a new database:
```CREATE DATABASE order_management_db OWNER myuser;```

7. grant needed perms:
```GRANT ALL PRIVILEGES ON DATABASE order_management_db TO myuser;```

    ```ALTER USER myuser CREATEDB;```

8. exit shell:
```\q```

## step two: setup environment variables

1. create a .env file in the root of the project

2. in the .env, add this line:
```DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/order_management_db?schema=public"```

    replace myuser, mypassword, and order_management_db with your actual database username, password, and name.

## step three: init prisma

1. run this from the terminal in the root of the project:
```npm install prisma @prisma/client```
```npm install ts-node typescript @types/node --save-dev```

2. same place:
```npx prisma init```

3. then:
```npx prisma generate```

    ```npx prisma migrate dev --name init```

4. same place, run:
```npm run seed```

    you should see:
```Database has been seeded. 🌱```

5. verify the db:
```npx prisma studio```

    this opens a web interface at http://localhost:5555. navigate through and make sure the data from seed.ts in the prisma folder is there. if so, all is good! if not, contact athul.


