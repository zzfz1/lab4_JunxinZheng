# Welcome to the OA System!

## Instruction

### Identify/Login ("/identify")

When users access root path ("/"), they will be redirected to "/identify" for identification.

After identification, they will be immediately redirect to their personal profile.("/user/:userId)

If the user name doesn't exist in the database, the user will be redirect to registration page.("/register")

### Registration ("/register")

If user entered an existing user name, they will see the error message saying "There's already a user with this username!".

After the user successfully registered, they will be redirected to login page.("/identify")

### Administration ("/admin")

This page contains all the imformation stored in the database, only user with admin role can access this page.

### student1 / student 2

Except for admins and teachers, only the students themselves can accesss their personal page.

### Teacher

Only admins and teachers can access teacher's page.
