const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "mischiefmanaged";

const users = [];

function generateToken() {
    let options = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let token = "";
    for (let i = 0; i < 32; i++) {
        // use a simple function here
        token += options[Math.floor(Math.random() * options.length)];
    }
    return token;
}

app.use(express.json());
app.post("/signup", (req, res) => {
    const newUsername = req.body.username;
    const newPassword = req.body.password;
    if(newUsername.trim().length < 5){
        res.json({
            message : "Invalid username, username should be greater than 4"
        })
    }

    //const newUserToken = generateToken();
    users.push({
        username : newUsername, password : newPassword
    });

    res.json({
        message : "Signed up with new user : "+newUsername
    })
    console.log(users);

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

        // const token = generateToken();           //To generate manual token
        // foundUser.token = token;
        res.json({
            message : "Logged in Successfully : "+username+", token : "+token
        })

        console.log(users);
    }
    else{
        res.status(403).json({
            message : "Invalid user credentials"
        })
    }
});

app.get("/me", (req,res) => {
    const inpToken = req.headers.token;
    const decodedInformation = jwt.verify(inpToken, JWT_SECRET);       //Verify and decode the token
    const reqUsername = decodedInformation.username;                //Fetch username from the token

    const requestedUser = users.find(user => user.username == reqUsername);     //Check for the username in db
    if( requestedUser ){
        res.status(200).send({
            username : requestedUser.username,
            password : requestedUser.password
        });
    }
    else{
        res.status(403).send({
            message : "Invalid token, User not found"
        });
    }
})

app.listen(3000, () => {
    console.log("http server listening to port 3000");
});