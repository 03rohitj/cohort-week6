const fs = require("fs");
const fsp = require("fs").promises;
const express = require("express");
const path = require("path");
const app = express();
const jwt = require("jsonwebtoken");
const { title } = require("process");
const cors = require("cors");
app.use(cors());
const JWT_SECRET = "mischiefmanaged";
const TODO_DATA_FILE = "./todo_list.json";
const TODO_USERS_FILE = "./todo_users.json";

let users = [];
var loggedIn = false;

// Serve static files from the "public" folder (index.html, mystyle.css)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

function loadUsers(){
    const rawUserData = fs.readFileSync(TODO_USERS_FILE, "utf-8");
    users = rawUserData ? JSON.parse(rawUserData) : [];
    console.log("Usres : ", users);
}

//load all user details
loadUsers();

function generateToken() {
    let options = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let token = "";
    for (let i = 0; i < 32; i++) {
        // use a simple function here
        token += options[Math.floor(Math.random() * options.length)];
    }
    return token;
}

function auth(req, res, next){
    const inpToken = req.headers.token;
    console.log("AuthMiddleware, token : ", inpToken);
    if(inpToken){
        const decodedInformation = jwt.verify(inpToken, JWT_SECRET, (err, decoded) => {
            if(err){
                console.error("Authentication failed : ", err);
                res.status(401).send({
                    message : "Unauthorized!",
                    error : err
                });
            }
            else{
                console.log("Authentication Passed, decoded token : ", decoded); 
                req.user = decoded;
                next();
            }
        });  
            
    }
    else{
        res.status(401).send({
            message : "Unauthorized!"
        });
    }
}

async function updateTodoFile(todos, username) {
    try {
        //Read the file
        const todos_raw_data = fs.readFileSync(TODO_DATA_FILE, "utf-8");
        var todos_json_data = todos_raw_data ? JSON.parse(todos_raw_data) : [];

        if( !todos_json_data || todos_json_data.length == 0){
            todos_json_data = [ { "user" : username, "todos" : todos}]; 
        }
        else{
            var userFound = false;
            todos_json_data.forEach(element => {
                if(element.user == username){
                    element.todos = todos;
                    userFound = true;
                }
            });

            if(!userFound){
                todos_json_data.push({ "user" : username, "todos" : todos});
            }
        }

        console.log("Updated todos json : ", todos_json_data);
    
        //Update the file with new data
        await fsp.writeFile(TODO_DATA_FILE, JSON.stringify(todos_json_data, null, 4));
        console.log("Todo file updated successfully!");
        return true; 
    } catch (err) {
        console.error("Error updating todo file:", err);
        return false;
    }
}

app.get("/", (req, res) => {
    console.log("Redirecting to login.html");
    res.sendFile( path.join(__dirname,"public","login.html"));
});


//Update todo_users data file
async function updateUserDataFile(newUsername, res){

    try{
        await fsp.writeFile(TODO_USERS_FILE, JSON.stringify(users, null, 4));
        console.log("New user added : ", newUsername);

        res.status(201).json({
            message : "Signed up with new user: "+newUsername,
            success : true
        });
    }
    catch( err ){
        console.error("Failed to update user data file: ", err);
        res.status(500).json({
            message: "Error saving user data",
            success: false
        });
    } 
}


app.post("/signup", async (req, res) => {
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    if(newUsername.trim().length < 5){
        res.json({
            message : "Invalid username, username should be greater than 4"
        })
        return;
    }
    const foundUser = users.find(user => user.username == newUsername);
    if(foundUser){
        console.log(`Error :  ${newUsername} already exists`);
        //User already exists, failure
        res.status(401).json({
            message : `Error :  ${newUsername} already exists`
        })
        return;
    }

    console.log("Signup with new user : "+ newUsername+" success!");

    users.push({
        username : newUsername, password : newPassword
    });

    await updateUserDataFile(newUsername, res);

});

app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let foundUser = users.find((user) => {
        if(user.username == username && user.password == password){
            return user;
        }
        
    });

    if(foundUser){

        const token = jwt.sign({
            username : username
        }, JWT_SECRET);

        console.log("Token : "+token);
        res.setHeader("token", token);

        res.status(200).send({
            username : username,
            message : "Logged in Successfully : "+username+", token : "+token,
            success : "true"
        });

        console.log("Logging in with user : ")
        console.log(foundUser);
    }
    else{
        console.log("Server : Invalid credentials");
        res.status(403).send({
            message : "Invalid user credentials",
            success : false
        })
        return;
    }
});

app.get("/me", auth, (req,res) => {
    //const inpToken = req.headers.token;
    //const decodedInformation = jwt.verify(inpToken, JWT_SECRET);       //Verify and decode the token
    //const reqUsername = decodedInformation.username;                //Fetch username from the token
    //const requestedUser = users.find(user => user.username == reqUsername);     //Check for the username in db

    const requestedUser = req.user;
    if( requestedUser ){
        res.status(200).send({
            username : requestedUser.username
        });
    }
    else{
        res.status(403).send({
            message : "Invalid token, User not found"
        });
    }
})

// Protect the /home.html route
app.get("/home", auth, (req, res) => {
    
    const rawData = fs.readFileSync(TODO_DATA_FILE, "utf-8");
    const todos_all_data = rawData ? JSON.parse(rawData) : [];
    console.log("todos all data : ", todos_all_data);

    //Fetch logged in user's data
    const username = req.user.username;
    console.log("reading, Loggedin user: ", username);
    
    var todos = [];
    if(todos_all_data.length > 0){
        var userFound = false;
        todos_all_data.forEach(element => {
            if(element.user == username){
                todos = element.todos;
                userFound = true;
            }
        });
    }

    console.log("Sending todos from server to client..");
    res.status(200).send({
        success : true,
        todos : todos
    });

    //res.sendFile(__dirname + "/public/home.html"); // Serve home.html only to authenticated users
});

//Whenever a todo is being update
app.post("/updateTodo", auth, async (req, res) => {
    const todos = req.body.todos;
    const user = req.user;
    console.log("Endpoint : /updateTodo.....");
    console.log("Logged in user : ", user.username);
    console.log("Fetched todos : ", todos);

    try
    {
        const updateStatus = await updateTodoFile(todos, user.username);
        console.log("File update success? ", updateStatus);

        const resStatus = (updateStatus == true) ? 200 : 501;
        res.status(resStatus).send({
            success : updateStatus
        });
    }
    catch( err ){
        console.error("Error updating file:", err);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
});


app.listen(3000, () => {
    console.log("http server listening to port 3000");
});