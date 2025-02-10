
var reqType = "login";       //Login or signup request, by default it will redirect for login

document.getElementById("login_btn").addEventListener( "click" , (event) => {
    reqType = "login";
});

document.getElementById("signup_btn").addEventListener( "click" , (event) => {
    reqType = "signup";
});

document.getElementById("login_form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Always prevent default form submission

    const uname = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;

    if( !uname || !password ){
        alert("username/password field cannot be empty");
        event.preventDefault();
    }
    else{
        
        try{

            var redirectURL = (reqType == "login") ? "http://localhost:3000/signin" : "http://localhost:3000/signup";
            const response = await axios.post(redirectURL, {
                username : uname,
                password : password
            });

            // alert("res : "+response.data);
            if(response.data.success){
                console.log("Valid Credentials");
                if(reqType == "signup"){        //request type signup
                    console.log("Signed up with new user successfully.....Please login with the credentials");
                    window.location.href = "/login.html";
                }
                else{       //Request type login
                    if(response.headers["token"]){
                        localStorage.setItem("token", response.headers["token"]);
                        localStorage.setItem("username", response.data.username);
                        // alert(response.data.username);
                        window.location.href = "/home.html";
                    }
                    else{
                        alert("Invalid Credentials");
                    }
                }
            }
            else{
                alert("Authentication Failed : "+ response.data.message);
                console.log(" Response success? False : Invalid Credentials");
            }
        }
        catch( err ){
            console.log("Login error : "+err);
            alert("User Authentication failed, please try again");
        }
    }
    
});