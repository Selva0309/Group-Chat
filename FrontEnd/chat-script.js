const chatwindow = document.querySelector('.chatwindow');
chatwindow.scrollIntoView({block: "end"});
var user = localStorage.getItem('currentuser');
clearInterval();
setInterval(() =>{
    chatwindow.innerHTML='';
        getmessages() }, 1000)

// window.addEventListener('DOMContentLoaded',()=>{
// getmessages();    
// })

async function sendmessage() {
    const token = localStorage.getItem('token');
    const message = document.getElementById('messagecontent').value;
    const messageresponse = await axios.post('http://localhost:4000/message/send', {message: message}, {headers: {"Authorization": token}})
    console.log(messageresponse);
    notifyUser(messageresponse.data.message);
    window.location.reload();

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


async function getmessages(){
    try{
        const messages = await axios.get('http://localhost:4000/message/getmessage')
        console.log(messages.data.messages);
        const allmessages = messages.data.messages;
        allmessages.forEach(message =>{
            // const time = message.time;
            const newTIME = new Date(message.createdAt);
            const time = newTIME.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const name = (message.user.id == user) ? 'You' : message.user.name;
            const text = message.messagetext;
            const classname = (name == 'You') ? 'You' : 'Otheruser'
            const messagecontainer = document.createElement('section');
            messagecontainer.classList.add(classname);
            messagecontainer.innerHTML = `
            <div id='name'>${name}</div>
            <div id='text'>${text}</div>
            <div id='time'>${time}</div>
            `
            chatwindow.appendChild(messagecontainer)
        
        })

    } catch(err) {
        console.log(err)
    }
}