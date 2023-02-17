
const logincontainer = document.querySelector(".login-container");
const signupcontainer = document.querySelector(".signup-container");
document.getElementById('signup').addEventListener('click',signup);
document.getElementById('showlogin').addEventListener('click',showloginpage);
document.getElementById('login').addEventListener('click',login);
document.getElementById('showsignup').addEventListener('click',showsignuppage);
const errorcontainer = document.querySelector('.errorcontainer');

function signup(){

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(name, phone, email, password);

    axios.post('http://localhost:4000/user/signup',{name: name, phone: phone, email:email, password:password})
    .then((response)=>{
        if(response.status==201){
        message = response.data.message;
        notifyUser(message);
        showloginpage();
        } else {
            notifyUser(err);
        }
    }).catch(err => {
        if(err.response.status == 400){
            notifyUser(err.response.data.message);
            showloginpage();
        }
})
};


function notifyUser(message) {
    const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
            notification.innerHTML=`
            <h4>${message} </h4>
            `;
            container.appendChild(notification);
            container.style = 'display: block;'
            setTimeout(()=>{
                notification.remove();
                container.style = 'display: none;'
            },2000)
}

function showloginpage(){
    signupcontainer.style = 'display: none';
    logincontainer.style = 'display: flex';
    
}

function showsignuppage(){
    signupcontainer.style = 'display: flex';
    logincontainer.style = 'display: none';
    
}

async function login(){
    try{
    const email = document.getElementById('useremail').value;
    const password = document.getElementById('userpassword').value;
    console.log(email, password);
    const loginresponse = await axios.post('http://localhost:4000/user/login',{email:email, password:password})
    console.log(loginresponse);
    const message = loginresponse.data.message;
    const success = loginresponse.data.success;
    const token = loginresponse.data.token;
        console.log(token);
        
         if(success==true){
            notifyUser(message);
            localStorage.setItem('token', token);
            window.location.assign('/chat.html');           

        } 
    } catch (err) {
        console.log(err);
        errorcontainer.innerHTML='';
        const error = document.createElement('h2');
        error.innerHTML=`${err.response.data.message}`;
        errorcontainer.appendChild(error);
        }
    
}
document.querySelector('.forgot-btn').addEventListener('click', forgotpasswordpage => {
    document.querySelector('.login-container').style = 'display: none;';
    document.querySelector('.forgetpassword-container').style = 'display: block;'
} )

function sendEmail(){
    const emailID = document.getElementById('forgotemail').value;
    console.log(emailID)
    axios.post('http://52.196.64.49/password/forgotpassword', {emailID})
    .then(response=>{
        console.log(response);
        if(response.data.success){
            notifyUser(response.data.message);
        }
    })
}