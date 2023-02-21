const chatwindow = document.querySelector('.chatwindow');
const createcard = document.querySelector('.creategroup');
const usercard = document.querySelector('.userslist');
const header = document.querySelector('.headerbar');
const usercontainer = document.querySelector('.usercontainer');
const activeusercontainer = document.querySelector('.activeusers');

var user = localStorage.getItem('currentuser');
var token = localStorage.getItem('token');


window.addEventListener('DOMContentLoaded',()=>{
getgroups();    
})

function showgroup(groupname, groupID){
    setInterval(() =>{
        getmessages() }, 1000)
    localStorage.setItem('Activegrp', groupID)
    getmessages();
    const groupusers = localStorage.getItem('Activegrpuser')    
    header.innerHTML='';
    chatwindow.innerHTML='';
    header.innerHTML=`
    <img src="./Group icon.png" alt="Groupicon">
    <div class='header-center'>
    <span class='groupname'>${groupname}</span>
    </div>
    <button alt='Adduser' id='adduser' onclick='adduser()'><i class='fas fa-user-plus'></i></button>
    `
    
}

async function sendmessage() {
    const groupid = localStorage.getItem('Activegrp');
    const message = document.getElementById('messagecontent').value;
    const messageresponse = await axios.post('http://localhost:4000/message/send', {message: message, type:'message', groupid: groupid}, {headers: {"Authorization": token}})
    console.log(messageresponse);
    notifyUser(messageresponse.data.message);
    // window.location.reload();
    getmessages();
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
        
        const groupid = localStorage.getItem('Activegrp');
        let lastmessageID = +localStorage.getItem(`${groupid}lastmsgid`) || 0;
        const messages = await axios.get(`http://localhost:4000/message/getmessage?messageid=${lastmessageID}&groupid=${groupid}`)
        console.log(messages.data.messages);
        const localmsgs = JSON.parse(localStorage.getItem(`${groupid}localmsgs`)) || [];
        const newmessages = messages.data.messages;
        const allmessages = [...localmsgs, ...newmessages];
        chatwindow.innerHTML='';
        console.log(allmessages);
          allmessages.forEach(message =>{
            // const time = message.time;
            const newTIME = new Date(message.createdAt);
            const time = newTIME.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            const name = (message.user.id == user) ? 'You' : message.user.name;
            const text = message.messagetext;
            const classname = (name == 'You') ? 'You' : 'Otheruser'
            if(message.type == 'notification'){
                const notification = document.createElement('div');
                notification.classList.add('notification');
                notification.innerHTML=`
                <span>${name} ${message.messagetext}</span>
                `
                chatwindow.appendChild(notification);
                lastmessageID = message.id;
            }else{
            
            const messagecontainer = document.createElement('section');
            messagecontainer.classList.add(classname);
            messagecontainer.innerHTML = `
            <div id='name'>${name}</div>
            <div id='text'>${text}</div>
            <div id='time'>${time}</div>
            `
            chatwindow.appendChild(messagecontainer);
            lastmessageID = message.id;
            }
            
        })
        lastmsgs = allmessages.slice(-10)
        localStorage.setItem(`${groupid}lastmsgid`, lastmessageID);
        localStorage.setItem(`${groupid}localmsgs`, JSON.stringify(lastmsgs));
        chatwindow.scrollTop = chatwindow.scrollHeight;

    } catch(err) {
        console.log(err)
    }
}

function showcard(card){
    card.style='display: flex;'
}
function closecard(card){
    card.style='display: none;'
}

async function creategroup(){
    try{
      
     const groupname = document.getElementById('groupname').value;
     const addgroup = await axios.post('http://localhost:4000/group/create', {name: groupname}, {headers: {"Authorization": token}})
     console.log(addgroup.data);
     notifyUser(addgroup.data.message)
     let message = 'created the group';
     const id = addgroup.data.id; 
     sendnotification(message, id);   
     createcard.style = 'display:none;'
     window.location.reload()   
}catch(err){
    console.log(err);
}
}

async function sendnotification(msg, id) {
    const messageresponse = await axios.post('http://localhost:4000/message/send', {message: msg, groupid: id, type: 'notification' }, {headers: {"Authorization": token}})
    notifyUser(messageresponse.data.message);
    window.location.reload();

}

async function getgroups(){
    try{
        const groupsresponse = await axios.get('http://localhost:4000/group/getgroups',{headers: {"Authorization": token}})
        console.log(groupsresponse.data.group);
        if(groupsresponse.data.group){
            const groups = groupsresponse.data.group;
            const chats = document.querySelector('.chats');
            chats.innerHTML='';
            groups.forEach(group=>{
                const groupItem = document.createElement('div');
                groupItem.classList.add('groupitem');
                groupItem.innerHTML= `
                <img src="./Group icon.png" alt="Groupicon">
                <button class='groupname' id='group-btn' onclick="showgroup('${group.groupname}',${group.id})">${group.groupname}</button>
                `
                chats.appendChild(groupItem);
            })


        }
    }catch(err) {
        console.log(err);
    }
}

async function adduser(){
    try{
        showcard(usercard);
        const groupid = localStorage.getItem('Activegrp')
        console.log(typeof groupid);
        const Groupusersresponse = await axios.get(`http://localhost:4000/group/getgroupusers?groupid=${groupid}`);
        console.log(Groupusersresponse.data);
        const activeusers = Groupusersresponse.data.groupusers;
        const activeusersid = [];
        activeusercontainer.innerHTML='';

        activeusers.forEach(user=>{
            activeusersid.push(user.id);
            const groupuseritem = document.createElement('div');
            groupuseritem.classList.add('user');
            groupuseritem.innerHTML=`
            <span>${user.name}</span> 
            `;
            activeusercontainer.appendChild(groupuseritem);
        })
        console.log(activeusersid);
        const addusers = Groupusersresponse.data.allusers;        
        usercontainer.innerHTML=''
        addusers.forEach(user=>{
            if(!(activeusersid.includes(user.id))){
                const useritem = document.createElement('div');
                useritem.classList.add('user');
                useritem.innerHTML=`
                    <label id="username">${user.name}</label>
                    <input type="hidden"id='userid' value=${user.id}>
                    <button class="addtogrp" onclick='addtogroup(${user.id})'>Add user</button>
                `
                usercontainer.appendChild(useritem);
            }    
        })
    
        // localStorage.setItem(`${groupid}Groupusers`, groupusers);
    }catch(err){
        console.log(err)
    }
}
async function addtogroup(id){
    try{
    const groupId = localStorage.getItem('Activegrp');
    const addtogrpresponse = await axios.post('http://localhost:4000/group/adduser', {groupid: groupId, userId: id})
    console.log(addtogrpresponse.data);
    const message = addtogrpresponse.data.message;
    const notification = addtogrpresponse.data.notification;
    notifyUser(message);
    sendnotification(notification, groupId);   
    window.location.reload()    

}catch(err){
    console.log(err);
}
}