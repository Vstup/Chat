'use strict';
const fs = require ('fs');
const auth = require('./server/authorization');
const sessions = auth.sessions;
const users = auth.users;
const token = require('./tokenGenerate');
const cookie = require('./node-cookie/index');

const getSessID = (uname) => {
    for (let key in sessions) if (sessions[key].uname === uname) return key;
};

const getUser = (req) => {
    const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
    return user;
};

const messageLog = (user,chatId,text)=>{
  const obj = {};
  obj.messId = token.generateSessId;
  obj.chatId = chatId;
  obj.userSent = user;
  obj.userSentId =getSessID(user);
  obj.timeString = new Date().toISOString();
  obj.messText = text;
  const messages = JSON.parse(fs.readFileSync('./messages.json'));
  messages.push(obj);
  fs.writeFileSync('./messages.json',JSON.stringify(messages));
};

const createChat = (user1, user2) => {
  const obj = {};
  const id1 = getSessID(user1);
  const id2 = getSessID(user2);
  obj.chatId = '' + id1 + id2;
  obj.users = [user1,user2];
  obj.usersId = [id1,id2];
  const chats = JSON.parse(fs.readFileSync('./chats.json'));
  chats.push(obj);
  fs.writeFileSync('./chats.json',JSON.stringify(chats));
};

const clearMessages = () => {
  fs.writeFileSync('./messages.json','[]');
};

const getChatList = (user) => {
  const res = [];
  //const id = getSessID(user);
  const chats = JSON.parse(fs.readFileSync('./chats.json'));

  for (let i = 0;i < chats.length;i++){
    if (chats[i].users[0] === user || chats[i].users[1] === user){
      res.push(chats[i].chatId);
    }
  }

  return res;
};

const getChatUser = (user) => {
  const res = [];
  //const id = getSessID(user);
  const chats = JSON.parse(fs.readFileSync('./chats.json'));

  for (let i = 0;i < chats.length;i++){
    if (chats[i].users[0] === user ){
      res.push(chats[i].users[1]);
    }else if (chats[i].users[1] === user){
      res.push(chats[i].users[0]);
    }
  }

  return res;
};



const chatCheck = (user) => {
  let flag = false;
  const res = [];

  const users = getUserList();
  const chats = getChatUser(user);

  for (let i = 0; i < users.length; i++){
    for (let j = 0;j < chats.length; j++){
      if (users[i]===chats[j]) {
        flag = true;
      }
    }
    if (flag === false) {
      res.push(users[i]);
    }
    flag = false;
  }
  return res;
};

const generatePage= (req) => {
  let page = fs.readFileSync('public/index.html').toString();

  const chatLi = generateChatLi(req);
  console.log(chatLi);
  page = page.replace('***USER CHATS HERE***', chatLi);

  return page;
};

const getLastMess = (user, chats) => {
    let flag = false;
    const result = {};
    const messages = JSON.parse(fs.readFileSync('./messages.json'));

    for (let i = 0; i < chats.length; i++){
        for (let j = messages.length-1; j > 0;j--){

          if (messages[j].chatId === chats[i]){
                result[chats[i]] = messages[j].messText ;
                flag = true;
                break;

        }
        if (flag===false) result[chats[i]] = '';
          flag = false;

    }}
    // console.log(result)
    return result;

};

const generateChatLi = (req) => {
  const user = getUser(req);
  let chats = getChatList(user).reverse();
    const lastMessages = getLastMess(user,chats);
  const chatUser = getChatUser(user).reverse();

  let chatLi = '';
let i = 0;
  for (let key in lastMessages){
    chatLi += '<div class="chatContainer" id="'+ key +

        '" onclick="goToChat(\'' + key + '\')"><div class="chatUser">' +

        chatUser[i] + '</div><div id="lastMessage">'+ lastMessages[key] +'</div></div>' ;
  i++;
  }


  return chatLi;
};

const getMessagesFromChat = (chatId) => {
  const result = [];
  const messages = JSON.parse(fs.readFileSync('./messages.json'));

  for (let i = 0; i < messages.length;i++){
    if (messages[i].chatId === chatId){
      result.push(messages[i]);
    }
  }

  return result;
};

const getChatId = (user1, user2) => {
    let res;
    const chats = JSON.parse(fs.readFileSync('./chats.json'));

    for (let i = 0;i < chats.length;i++){
        if (chats[i].users[0] === user1 && chats[i].users[1] === user2 ){
            res = chats[i].chatId;
        }
    }

    return res;
};

const getUserList = () =>{
    const users = JSON.parse(fs.readFileSync('./users.json'));
    return Object.keys(users);
};

module.exports = {
  getUser,
  getSessID,
  messageLog,
  createChat,
  getChatList,
  clearMessages,
  generatePage,
  generateChatLi,
  getMessagesFromChat,
  chatCheck,
  getChatId
};