window.addEventListener('DOMContentLoaded',()=>{
    getID();
})
const resetcontainer = document.querySelector('.reset-container');
var uid;
function getID() {
    var query = location.href.split("/");
    console.log(query[5]);
    uid = query[5];
    document.getElementsByName('id').value = uid;
}

async function passwordreset(){
    const newpassword = document.getElementById('newpassword').value;
    const response = await axios.post('http://localhost:4000/password/updatepassword',{newpassword: newpassword, id: uid})
    alert(`${response.data.message}`)    
    window.location.assign('/Loginsignup.html');
}


