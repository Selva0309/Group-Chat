async function sendmessage() {
    const token = localStorage.getItem('token');
    const message = document.getElementById('messagecontent').value;
    const messageresponse = await axios.post('http://localhost:4000/message/send', {message: message}, {headers: {"Authorization": token}})
    console.log(messageresponse);
    notifyUser(messageresponse.data.message);
}

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
