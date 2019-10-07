The files that has real functionalities"

1. index.js: this is for the server. If you are using different server, please change in here


2. app.js: This contains all application and routes:
   
         apps: morgan, bodyParser, mongoose, express
   
         routes: userPostRoutes, orderRoutes, userRoutes, twoFARoutes


3. api folder contains routes and models

   routes: 
   
        hoosierc.js: This will be profile routes, do not concern this now
        
        order.js: This will be the order of profile, do not concern this now
        
        twoFA.js: This is twoFA, contains:
        
            patch(): that add 2-authentication to user
            
            post(): that can verify user's input 6 number token and return a jwt token (working right now)
            
        users.js: This contains login logon and delete:
        
            post("/signup" ...): this is for sign up, which create user, hash the user's password and save it to mongodb
            
            post('/login' ...): This is the login page, which take user's input password and email and return a url to 2-auth
            

   models contains data structure of user:

         order.js: structure of order, do not concern this now
   
         userPost.js: structure of user profile, do not concern this now. 
   
         user.js: structure of users, contains basic information and 2-auth secrete
   
