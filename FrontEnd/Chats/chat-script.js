const chatwindow = document.querySelector('.chatwindow');
const createcard = document.querySelector('.creategroup');
const usercard = document.querySelector('.userslist');
const header = document.querySelector('.headerbar');
const usercontainer = document.querySelector('.usercontainer');
const activeusercontainer = document.querySelector('.activeusers');

var user = localStorage.getItem('currentuser');
var token = localStorage.getItem('token');

const socket = window.io('http://18.182.30.227', {
    query: {
        user : user
    },forceNew: true
});

socket.on('refreshgroup', ()=>{
    getgroups();
})

socket.on('refreshmsg', (groupid)=>{
    const activegrp = document.querySelector('.groupitem.active');
    if(activegrp){
    const activegroupid = activegrp.getAttribute('data-button-id');
        if(activegroupid == groupid){
        getmessages(groupid); 
        }else {
            const groups = document.querySelectorAll('.groupitem');
            groups.forEach(group=>{
            if (group.getAttribute('data-button-id') == groupid) {            
                group.querySelector('span').innerHTML='*';
              }
        })
        }
    }else {
        const groups = document.querySelectorAll('.groupitem');
        groups.forEach(group=>{
        if (group.getAttribute('data-button-id') == groupid) {            
            group.querySelector('span').innerHTML='*';
          }
    })
}
})

window.addEventListener('DOMContentLoaded',()=>{
getgroups();    
})

function showgroup(groupname, groupID){
    // setInterval(() =>{
    //     getmessages() }, 1000)
    // console.log(groupname,groupID);
    const welcome = document.querySelector('.welcome');
    welcome.style = 'display: none;'
    document.querySelector('.chatcontainer').style = 'display: flex;'
    const groups = document.querySelectorAll('.groupitem');
    const currentgroupitem = document.querySelectorAll('.groupitem.active');
    groups.forEach(group=>{
        if (group.getAttribute('data-button-id') == groupID) {
            group.classList.add('active');
            group.querySelector('span').innerHTML='';
          } else {
            group.classList.remove('active');
          }
    })
    
    localStorage.setItem('Activegrp', groupID)
    localStorage.setItem('Activegrpname', groupname);
    getmessages(groupID);
    header.innerHTML='';
    chatwindow.innerHTML='';
    header.innerHTML=`
    <button class="closebtn mobile" onclick="closechat()">&#8249;</button>
    <img src="../Group icon.png" alt="Groupicon">
    <div class='header-center'>
    <button alt='Adduser' id='headerbtn' onclick='showgrpdetails()'>${groupname}</button>
    </div>    
    `
    
}

async function sendmessage() {
    const groupid = localStorage.getItem('Activegrp');
    const message = document.getElementById('messagecontent').value;
    const messageresponse = await axios.post('http://18.182.30.227/message/send', {message: message, type:'message', groupid: groupid}, {headers: {"Authorization": token}})
    console.log(messageresponse);
    document.getElementById('messagecontent').value='';
    document.getElementById('messagecontent').focus();
    socket.emit('messagesent', groupid);
    // notifyUser(messageresponse.data.message);
    // window.location.reload();
    
}

async function sendfile(){
    try {
        const groupid = localStorage.getItem('Activegrp');
        const file = document.getElementById('file').files[0];
        
        
        
        const filename = document.getElementById('file').value.split('\\').pop();
        console.log(file, filename);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', filename);
        formData.append('type', 'file');
        formData.append('groupid', groupid);
             
        const fileupload = await axios.post('http://18.182.30.227/message/fileupload',
         formData,
        {headers: {"Authorization": token, 'Content-Type': 'multipart/form-data'}})
        console.log(fileupload.data.fileURL);
        socket.emit('messagesent', groupid);
        closefileupload();
    } catch (error) {
        console.log(error);
    }
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


async function getmessages(groupid){
    try{
              
        let lastmessageID = +localStorage.getItem(`${groupid}lastmsgid`) || 0;
        const messages = await axios.get(`http://18.182.30.227/message/getmessage?messageid=${lastmessageID}&groupid=${groupid}`)
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
            } else if(message.type == 'file'){
                const notification = document.createElement('div');
                const [filename, URL] = text.split('*'); 
                notification.classList.add(classname);
                notification.innerHTML=`
                <div id='name'>${name}</div>
                <div id='text'><i class='fa fa-file green-color'></i><a href="${URL}">${filename}</a></div>
                <div id='time'>${time}</div>
                `
                chatwindow.appendChild(notification);
                lastmessageID = message.id;
            }
            else{
            
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
function showfileupload(){
    const multimedia = document.querySelector('.multimedia');
    multimedia.style = 'display: flex;'
    document.querySelector('.textmessage').style = 'display: none;'
}
function closefileupload(){
    const multimedia = document.querySelector('.multimedia');
    multimedia.style = 'display: none;'
    document.querySelector('.textmessage').style = 'display: flex;'
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
     const addgroup = await axios.post('http://18.182.30.227/group/create', {name: groupname, users:selectedusers}, {headers: {"Authorization": token}})
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
        const groupsresponse = await axios.get('http://18.182.30.227/group/getgroups',{headers: {"Authorization": token}})
        console.log(groupsresponse.data.group);
        if(groupsresponse.data.group.length>0){
            const groups = groupsresponse.data.group;
            const chats = document.querySelector('.chats');
            chats.innerHTML='';
            groups.forEach(group=>{
                const groupItem = document.createElement('div');
                groupItem.classList.add('groupitem');
                groupItem.setAttribute("data-button-id", `${group.id}`)
                groupItem.innerHTML= `
                <img src="../Group icon.png" alt="Groupicon">
                <button class='groupname' id='group-btn' onclick="showgroup('${group.groupname}',${group.id})">${group.groupname}<span id='new'></span></button>
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
        const Groupusersresponse = await axios.get(`http://18.182.30.227/group/getgroupusers?groupid=${groupid}`, {headers: {"Authorization": token}});
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
                    <span id='userName'>(You) ${groupuser.name}</span>
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
            const allusersresponse = await axios.get('http://18.182.30.227/user/getusers');
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
        const addtogroup = await axios.post('http://18.182.30.227/group/adduser', {groupid: groupid, users:selectedusers}, {headers: {"Authorization": token}})
        console.log(addtogroup.data);
       // notifyUser(addgroup.data.message);
    //    window.location.reload();
        const overallcontainer = document.querySelector('.selectusers-overallcontainer');
        overallcontainer.style = 'display: none';
        closecard(usercard);
        socket.emit('addusers', selectedusers, groupid);
          

}catch(err){
    console.log(err);
}
}

async function shownewgroup(){
    try {
     createcard.style='display: flex;';
     const currentuser = localStorage.getItem('currentuser')
     const usersresponse = await axios.get('http://18.182.30.227/user/getusers');
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
        const deleteuserreponse = await axios.put(`http://18.182.30.227/group/removeuser`,{groupid: groupid, userid: id}, {headers: {"Authorization": token}});
        console.log(deleteuserreponse.data.message);
        // window.location.reload();
        closecard(usercard);
        
        socket.emit('removeuser',id, groupid)
    } catch (error) {
        console.log(error)
    }
}

async function changeadminaccess(id){
    try {
        const groupid = localStorage.getItem('Activegrp');
        const edituserresponse  = await axios.put('http://18.182.30.227/group/changeaccess', {userid: id, groupid: groupid}, {headers: {"Authorization": token}});
        console.log(edituserresponse.data);
        // window.location.reload();
        closecard(usercard);
        socket.emit('adminchange', groupid);
        
    } catch (error) {
        console.log(error);        
    }
}

function closechat() {
    document.querySelector('.chatcontainer').style = "display:none; transform: translateY(0);"
}