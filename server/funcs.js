'use strict';
const fs = require ('fs');
const auth = require('./authorization');
const sessions = auth.sessions;
const users = auth.users;
const token = require('./tokenGenerate');
const cookie = require('../node-cookie/index');

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
  const messages = JSON.parse(fs.readFileSync('Data Base/messages.json'));
  messages.push(obj);
  fs.writeFileSync('Data Base/messages.json',JSON.stringify(messages));
};

const createChat = (user1, user2) => {
  const obj = {};
  const id1 = getSessID(user1);
  const id2 = getSessID(user2);
  obj.chatId = '' + id1 + id2;
  obj.users = [user1,user2];
  obj.usersId = [id1,id2];
  const chats = JSON.parse(fs.readFileSync('Data Base/chats.json'));
  chats.push(obj);
  fs.writeFileSync('Data Base/chats.json',JSON.stringify(chats));
};

const clearMessages = () => {
  fs.writeFileSync('Data Base/messages.json','[]');
};

const getChatList = (user) => {
  const res = [];
  const chats = JSON.parse(fs.readFileSync('Data Base/chats.json'));

  chats.forEach(item => {
    if (item.users[0] === user ||item.users[1] === user){
      res.push(item.chatId);
    }
  });

  return res;
};

const getChatUser = (user) => {
  const res = [];
  const chats = JSON.parse(fs.readFileSync('Data Base/chats.json'));

  chats.forEach(item => {
    if (item.users[0] === user ){
      res.push(item.users[1]);
    }else if (item.users[1] === user){
      res.push(item.users[0]);
    }
  });
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
  let page = fs.readFileSync('public/views/index.html').toString();

  const chatLi = generateChatLi(req);
  page = page.replace('***USER CHATS HERE***', chatLi);

  return page;
};

const getLastMess = (user, chats) => {
  let flag = false;
  const result = {};
  const messages = JSON.parse(fs.readFileSync('Data Base/messages.json'));
  console.log(messages);
  if (messages.length === 0){
    chats.forEach(item => {result[item] = '';});
    return result;
  }

  for (let i = 0; i < chats.length; i++){
    for (let j = messages.length-1; j > 0;j--){
      if (messages[j].chatId === chats[i]){
        result[chats[i]] = messages[j].messText ;
        flag = true;
        break;

      }}
      if (flag===false) result[chats[i]] = '';
      console.log('flag: ' + flag)
      flag = false;

    }
  return result;

};

const generateChatLi = (req) => {
  const user = getUser(req);
  let chats = getChatList(user).reverse();
  // console.log(chats);
  // console.log(user);
  const lastMessages = getLastMess(user,chats);
  const chatUser = getChatUser(user).reverse();
  let chatLi = '';
  let i = 0;
  for (let key in lastMessages){
    chatLi += '<div class="user-chat-container" id="'+ key +

        '" onclick="goToChat(\'' + key + '\')"><div class="row row-flex"><div class="col-xs-4 col-sm-4 col-md-4 padding"><div class="circul text-center"></div></div><div class="col-xs-8 col-sm-8 col-md-8 padding user-info"><div class="user-name">' +

        chatUser[i] + '</div><div class="user-last-mesasge" id="lastMessage">'+ '<span id="last-msg-cut">' + lastMessages[key] + '</span>' +'</div><span class="last-msg-dot" id="' + key + 1 + '">...</span></div></div></div>' ;
    i++;
  }
  return chatLi;
};

const getMessagesFromChat = (chatId) => {
  const result = [];
  const messages = JSON.parse(fs.readFileSync('Data Base/messages.json'));
  messages.forEach(item => {if (item.chatId === chatId) result.push(item); });

  return result;
};

const getChatId = (user1, user2) => {
  let res;
  const chats = JSON.parse(fs.readFileSync('Data Base/chats.json'));

  chats.forEach(item => {
    if (item.users[0] === user1 && item.users[1] === user2 ){
      res = item.chatId;
    }
  });

  return res;
};

const getUserList = () =>{
  const users = JSON.parse(fs.readFileSync('Data Base/users.json'));
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


