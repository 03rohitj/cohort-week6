//const { default: axios } = requires("axios");


let todos = [];
const TASK_ID = "id";
const TASK_TITLE = "title";
const TASK_STATUS = "status";
const STATUS_PENDING = "pending";
const STATUS_COMPLETE = "complete";

//Adds the todo task whenever clicked add button
async function addTodo() {
    //send the updated data to server
    const token = localStorage.getItem("token");
    
    if( !token ){
        alert("Unauthorized....Redirecting to login page");
        window.location.href = "./login.html";
        return;
    }
    else{
        console.log("Token is verified.....");
    }
    
    const strNewTask = ""+document.querySelector("#txt_new_task").value;
    document.querySelector("#txt_new_task").value = "";
    if(strNewTask.trim().length == 0){
      alert("task cannot be empty!!");
    }
    else{
        const newTaskId = (todos.length === 0) ? 1 : (Number(todos[todos.length-1].id)+1);
        const newTaskStatus = STATUS_PENDING;
        const title = strNewTask.trim();
        const todo_entry = {[TASK_ID] : newTaskId, [TASK_TITLE] : title, [TASK_STATUS] : newTaskStatus};
        console.log("Todo entry : ", todo_entry);
        todos.push(todo_entry);

        //Update the data to server
        try{
            console.log("Sending data to server...");
            console.log("Token : ", token);
            console.log("Todos : ", todos);
            const response = await axios.post("http://localhost:3000/updateTodo",
                { todos : todos },
                { headers : {token : token} }
            );

            console.log("Response data : ", response.data);
            if(response.data.success){
                console.log("Update Todo Server Success, Response todo : ", response.data);
            }
            else{
                console.error("Update Todo Server failed, Response todo : ", response.data);
            }
        }
        catch( err ){
            console.error("Error updating todos : "+err);
            alert("Error while updating todos");  
        }
        render();
    }
  }

  //Creates a new todo component
  function createToDoComponent(todo){
      
      const todoDiv = document.createElement("div");
      todoDiv.setAttribute("class","todoItem");
      todoDiv.setAttribute("id", todo.id);
      
      const chkMark = document.createElement("input");
      chkMark.setAttribute("type","checkbox");
      chkMark.setAttribute("class","chk_mark");
      if(todo.status == STATUS_COMPLETE)
        chkMark.checked = true;
      else
        chkMark.checked = false;
      todoDiv.appendChild(chkMark);

      const taskTitle = document.createElement("span");
      taskTitle.innerHTML = todo.title;
      taskTitle.setAttribute("class","task_name");
      todoDiv.appendChild(taskTitle);

      const buttonEdit = document.createElement("button");
      buttonEdit.innerHTML = "Edit";
      buttonEdit.setAttribute("class","edit_task");
    //   buttonEdit.setAttribute("onclick","editTodo('"+todo.title+"')");
      todoDiv.appendChild(buttonEdit);

      const buttonDelete = document.createElement("button");
      buttonDelete.innerHTML = "Delete";
      buttonDelete.setAttribute("class","delete_task");
    //   buttonDelete.setAttribute("onclick","deleteTodo('"+todo.title+"')");
      todoDiv.appendChild(buttonDelete);
      
      return todoDiv;
  }

  async function deleteTodo(taskId) {
    const token = localStorage.getItem("token");
    
    if( !token ){
        alert("Unauthorized....Redirecting to login page");
        window.location.href = "./login.html";
        return;
    }
    else{
        console.log("Token is verified.....");
    }
    const elmIdx = todos.findIndex(todo => todo.id == taskId);
    if(elmIdx == -1){
        console.error("Delete task, Taskid lookup failed, taskid not found : ");
    }
    todos.splice(elmIdx,1);
    //Update the data to server
    try{
        console.log("Sending data to server...");
        console.log("Token : ", token);
        console.log("Todos : ", todos);
        const response = await axios.post("http://localhost:3000/updateTodo",
            { todos : todos },
            { headers : {token : token} }
        );

        console.log("Response data : ", response.data);
        if(response.data.success){
            console.log("Update Todo Server Success, Response todo : ", response.data);
        }
        else{
            console.error("Update Todo Server failed, Response todo : ", response.data);
        }
    }
    catch( err ){
        console.error("Error updating todos : "+err);
        alert("Error while updating todos");  
    }
    render();
  }

  function render() {
    
    document.querySelector("#todos").innerHTML = "";  
    todos.forEach(element => {
        const todoElm = createToDoComponent(element)
        document.querySelector("#todos").appendChild(todoElm);
    });
  
  }

async function updateTaskStatus(taskId, taskStatus){
    const elmIdx = todos.findIndex(todo => todo.id == taskId);
    if(elmIdx == -1){
        console.error("Update task, Taskid lookup failed, taskid : '", taskId ,"' not found index : ", elmIdx);
        return;
    }
    todos[elmIdx].status = taskStatus;
    const token = localStorage.getItem("token");
    
    try{
        const response = await axios.post("http://localhost:3000/updateTodo",
            { todos : todos },
            { headers : {token : token} }
        );

        console.log("Response data : ", response.data);
        if(response.data.success){
            console.log("Update Todo Server Success, Response todo : ", response.data);
        }
        else{
            console.error("Update Todo Server failed, Response todo : ", response.data);
        }
    }
    catch( err ){
        console.error("Error updating todos : "+err);
        alert("Error while updating todos");  
    }

    render();
}
async function editTodo(taskId){
    const elmIdx = todos.findIndex(todo => todo.id == taskId);
    if(elmIdx == -1){
    console.error("Edit task, Taskid lookup failed, taskid : '", taskId ,"' not found index : ", elmIdx);
    }
    let updatedTaskVal = prompt("Edit todo task : ", todos[elmIdx].title);
    if(updatedTaskVal != null && updatedTaskVal.trim().length > 0){
        todos[elmIdx].title = updatedTaskVal;
    }
    else{
        alert("Invalid task value");
        return;
    }
    
    const token = localStorage.getItem("token");
    
    try{
        const response = await axios.post("http://localhost:3000/updateTodo",
            { todos : todos },
            { headers : {token : token} }
        );

        console.log("Response data : ", response.data);
        if(response.data.success){
            console.log("Update Todo Server Success, Response todo : ", response.data);
        }
        else{
            console.error("Update Todo Server failed, Response todo : ", response.data);
        }
    }
    catch( err ){
        console.error("Error updating todos : "+err);
        alert("Error while updating todos");  
    }

    render();
  }

  //Fetch the todos when page is loaded for first time
async function fetchTodos(){
    const token = localStorage.getItem("token");

    if(!token){
        alert("Unauthorized....Redirecting to login page");
        window.location.href = "./login.html";
        return;
    }

    try{

        const response = await axios.get("http://localhost:3000/home", {        //call ./home route in index.js
            headers : { token : token }     //send the token in header
        });

        if(response.data.success){
            console.log("Full response", response);
            console.log("response data", response.data);
            todos = response.data.todos;
            console.log("Is todo empty? : "+todos.length);
            render();           //Renders the current state of todo list
        }
        else{
            alert("failed to fetch the todos");
        }
    }
    catch( err ){
        console.error("Error fetching todos : "+err);
        alert("Session expired, please login again");
        localStorage.removeItem("token");
        window.location.href = "./login.html";
    }
}

window.onload = fetchTodos;

document.getElementById("btn_addTodo").addEventListener("click", async () => {
    console.log("addTodo event riggered..........");
    await addTodo();
});

document.addEventListener("click", async (event) => {
    
    if(event.target.classList.contains("delete_task")){
        console.log("deleteTodo event triggered..........");
        const taskElm = event.target.closest("div");
        const taskId = taskElm.id;
        console.log("Task ID : ", taskId);
        await deleteTodo(taskId);
    }
    else if(event.target.classList.contains("edit_task")){
        console.log("edit todo event triggered..........");
        const taskElm = event.target.closest("div");
        const taskId = taskElm.id;
        console.log("Task ID : ", taskId);
        await editTodo(taskId);
    }
});

document.addEventListener("change", async (event) => {
    if(event.target.type === "checkbox"){
        console.log("Checkbox state change event triggered..........");
        const taskElm = event.target.closest("div");
        const taskId = taskElm.id;
        console.log("Task ID : ", taskId);
        const taskStatus = event.target.checked ? STATUS_COMPLETE : STATUS_PENDING;
        await updateTaskStatus(taskId, taskStatus);
        event.target.chec
    }
});