const chatwindow = document.querySelector('.chatwindow');
const createcard = document.querySelector('.creategroup');
const usercard = document.querySelector('.userslist');
const header = document.querySelector('.headerbar');
const usercontainer = document.querySelector('.usercontainer');
const activeusercontainer = document.querySelector('.activeusers');

var user = localStorage.getItem('currentuser');
var token = localStorage.getItem('token');

const socket = window.io('http://localhost:4000', {
    query: {
        user : user
    },forceNew: true
});

socket.on('refreshgroup', ()=>{
    getgroups();
})


window.addEventListener('DOMContentLoaded',()=>{
getgroups();    
})

function showgroup(groupname, groupID){
    // setInterval(() =>{
    //     getmessages() }, 1000)
    // console.log(groupname,groupID);
    localStorage.setItem('Activegrp', groupID)
    localStorage.setItem('Activegrpname', groupname);
    getmessages();
    header.innerHTML='';
    chatwindow.innerHTML='';
    header.innerHTML=`
    <img src="../Group icon.png" alt="Groupicon">
    <div class='header-center'>
    <button alt='Adduser' id='headerbtn' onclick='showgrpdetails()'>${groupname}</button>
    </div>    
    `
    
}

async function sendmessage() {
    const groupid = localStorage.getItem('Activegrp');
    const message = document.getElementById('messagecontent').value;
    const messageresponse = await axios.post('http://localhost:4000/message/send', {message: message, type:'message', groupid: groupid}, {headers: {"Authorization": token}})
    console.log(messageresponse);
    // notifyUser(messageresponse.data.message);
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
     const selectedusers = [];
     var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
     checkboxes.forEach(box=>{
        selectedusers.push(box.value)
     })
     console.log(selectedusers); 
     
     const groupname = document.getElementById('groupname').value;
     const addgroup = await axios.post('http://localhost:4000/group/create', {name: groupname, users:selectedusers}, {headers: {"Authorization": token}})
     console.log(addgroup.data);
     const groupusers = [...selectedusers, ...user]
     socket.emit('createroom', groupusers, addgroup.id);
     
    // notifyUser(addgroup.data.message);
    createcard.style = 'display: none';
    getgroups();
    showgroup(addgroup.data.name, addgroup.data.id); 
    //  window.location.reload();   
}catch(err){
    console.log(err);
}
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
                <img src="../Group icon.png" alt="Groupicon">
                <button class='groupname' id='group-btn' onclick="showgroup('${group.groupname}',${group.id})">${group.groupname}</button>
                `
                chats.appendChild(groupItem);
            })


        }
    }catch(err) {
        console.log(err);
    }
}

async function showgrpdetails(){
    try{
        showcard(usercard);
        const groupid = localStorage.getItem('Activegrp')
        const groupname = localStorage.getItem('Activegrpname');
        const grouplabel = document.getElementById('groupName');
        // console.log(typeof groupid);
        grouplabel.innerHTML=`${groupname}`
        const Groupusersresponse = await axios.get(`http://localhost:4000/group/getgroupusers?groupid=${groupid}`, {headers: {"Authorization": token}});
        console.log(Groupusersresponse.data);
        const activeusers = Groupusersresponse.data.groupusers;
        const currentuserAdmin = Groupusersresponse.data.admin;
        const addusercontainer = document.querySelector('.addusercontainer');
        const groupusersid = []; 
        activeusercontainer.innerHTML='';
        if(currentuserAdmin){
            addusercontainer.innerHTML=`<button id='addusers' onclick='showselectusers()'>Add user +</button>`
        }
        activeusers.forEach(groupuser=>{
            groupusersid.push(groupuser.id);
            const groupuseritem = document.createElement('div');
            groupuseritem.classList.add('user');
            if(groupuser.id==user && currentuserAdmin){
                    groupuseritem.innerHTML=`
                    <span id='userName'>(You)${groupuser.name}</span>
                    <span id=admin>Admin</span> 
                    `;
            }else if(groupuser.id==user && !currentuserAdmin){
                    groupuseritem.innerHTML=`<span id='userName'>(You)${groupuser.name}</span>`;
            }else if(groupuser.id!=user && currentuserAdmin && groupuser.usergroup.isGroupAdmin){
                groupuseritem.innerHTML=`
                            <span id='userName'>${groupuser.name}</span>
                            <span id=admin>Admin</span>
                            <div id="nav">
                                <button id="adminbtn" onclick='changeadminaccess(${groupuser.id})'>Remove Admin</button>
                                <button id='userbtn' onclick='removeuser(${groupuser.id})'>Remove user</button>                                     
                            </div> 
                            `;
                
            }else if(groupuser.id!=user && currentuserAdmin && !groupuser.usergroup.isGroupAdmin){
                groupuseritem.innerHTML=`
                <span id='userName'>${groupuser.name}</span>
                <div id="nav"> 
                <button id="adminbtn" onclick='changeadminaccess(${groupuser.id})'>Make as Admin</button>
                <button id='userbtn' onclick='removeuser(${groupuser.id})'>Remove user</button>
                </div> 
                `;
                                

            }else if(groupuser.id!=user && !currentuserAdmin && groupuser.usergroup.isGroupAdmin){
                groupuseritem.innerHTML=`
                <span id='userName'>${groupuser.name}</span>
                            <span id=admin>Admin</span> 
                            `;
            }else if(groupuser.id!=user && !currentuserAdmin && !groupuser.usergroup.isGroupAdmin){
                groupuseritem.innerHTML=`<span id='userName'>${groupuser.name}</span>`;                              

            }
                activeusercontainer.appendChild(groupuseritem);    
            })
            const allusersresponse = await axios.get('http://localhost:4000/user/getusers');
            const allusers = allusersresponse.data.message;
            const selectusers = document.querySelector('.selectuserscontainer');
            selectusers.innerHTML='';
            allusers.forEach(user=>{
                   if(!(groupusersid.includes(user.id))){
                       const useritem = document.createElement('div');
                       useritem.classList.add('user');
                       useritem.innerHTML=`
                           <label id="username">${user.name}</label>
                           <input type="checkbox" name='selectuserid' value=${user.id}>
                       `
                       selectusers.appendChild(useritem);
                   }    
               })
            

        }catch(error){
            console.log(error)
        }
        }
function showselectusers(){
    const overallcontainer = document.querySelector('.selectusers-overallcontainer');
    overallcontainer.style = 'display: flex';
}                        
    
async function addtogroup(){
    try{
        const selectedusers = [];
        var usercheckboxes = document.querySelectorAll('input[type=checkbox]:checked');
        usercheckboxes.forEach(box=>{
           selectedusers.push(box.value)
        })
        console.log(selectedusers); 
        const groupid = localStorage.getItem('Activegrp');
        const addtogroup = await axios.post('http://localhost:4000/group/adduser', {groupid: groupid, users:selectedusers}, {headers: {"Authorization": token}})
        console.log(addtogroup.data);
       // notifyUser(addgroup.data.message);
    //    window.location.reload();
          

}catch(err){
    console.log(err);
}
}

async function shownewgroup(){
    try {
     createcard.style='display: flex;';
     const currentuser = localStorage.getItem('currentuser')
     const usersresponse = await axios.get('http://localhost:4000/user/getusers');
     const users = usersresponse.data.message;
     usercontainer.innerHTML='';
     users.forEach(user=>{
            if(!(currentuser.includes(user.id))){
                const useritem = document.createElement('div');
                useritem.classList.add('user');
                useritem.innerHTML=`
                    <label id="username">${user.name}</label>
                    <input type="checkbox" name='userid' value=${user.id}>
                `
                usercontainer.appendChild(useritem);
            }    
        })
    

        
    } catch (error) {
        console.log(error);
         }

}

async function removeuser(id){
    try {
        const groupid = localStorage.getItem('Activegrp');
        const deleteuserreponse = await axios.put(`http://localhost:4000/group/removeuser`,{groupid: groupid, userid: id}, {headers: {"Authorization": token}});
        console.log(deleteuserreponse.data.message);
        // window.location.reload();
    } catch (error) {
        console.log(error)
    }
}

async function changeadminaccess(id){
    try {
        const groupid = localStorage.getItem('Activegrp');
        const edituserresponse  = await axios.put('http://localhost:4000/group/changeaccess', {userid: id, groupid: groupid}, {headers: {"Authorization": token}});
        console.log(edituserresponse.data);
        // window.location.reload();
        
    } catch (error) {
        console.log(error);        
    }
}