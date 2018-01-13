'use strict';
const fs = require ('fs');
const token = require('./tokenGenerate');
const cookie = require('./node-cookie/index');

const users = JSON.parse(fs.readFileSync('users.json'));
const sessions = JSON.parse(fs.readFileSync('sessions.json'));



const addUser = (uname, passwd, res) => {
  if (!users[uname]) users[uname] = passwd;
  else res.end('There is an user with such a name');
  fs.writeFileSync('users.json', JSON.stringify(users) );
};

const checkPass = (uname, passwd) => {
  return users[uname] === passwd;
};

const guestSession =  () => {
  cookie.create(res, 'user', 'guest', 'Hd1eR7v12SdfSGc1');
};

const userSessionCreate = (uname, res) => {
  const sesID = getSessID(uname);
  const tok = token.generateToken;
  cookie.create(res, 'user', uname, 'Hd1eR7v12SdfSGc1');
  cookie.create(res, 'sessID', sesID, 'Hd1eR7v12SdfSGc1');
  cookie.create(res, 'token', tok, 'Hd1eR7v12SdfSGc1');
  sessions[sesID].active = true;
  sessions[sesID].token = tok;
  fs.writeFileSync('sessions.json', JSON.stringify(sessions) );

};

const userSessionDelete = (uname, res) => {
  const sesID = getSessID(uname);
  cookie.clear(res, 'user');
  cookie.clear(res, 'sessID');
  cookie.clear(res, 'token');
  sessions[sesID].active = false;
  sessions[sesID].token = '';
  fs.writeFileSync('sessions.json', JSON.stringify(sessions) );
};

const getSessID = (uname) => {
  for (let key in sessions) if (sessions[key].uname === uname) return key;
};

const newUserSession = (uname) => {
  sessions[token.generateSessId] = {active: false, uname: uname, token : ''};
  fs.writeFileSync('sessions.json', JSON.stringify(sessions) );
};

const getUser = (req) => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
  return user;
};

const checkSess = (req) => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');

  if (user) {
    const sessId = getSessID(user);

    if (!sessions[sessId]) return false;

    const sysTok = sessions[sessId].token;
    const userTok = cookie.get(req, 'token', 'Hd1eR7v12SdfSGc1');

    if (sessions[sessId].active === true && sysTok === userTok)return true;
  }

  return false;
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

const getUserList = () =>{
  const users = JSON.parse(fs.readFileSync('./users.json'));
  return Object.keys(users);
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
  page = page.replace('***USER CHATS HERE***', chatLi);

  return page;
};

const generateUserLi = (req) => {
  const users = chatCheck(cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1'));
  let userLi = '<ul>';

  for (let i = 0; i < users.length;i++){
    userLi += '<li>' + users[i] + '     <button onclick="chat(\'' + users[i] + '\')">Create an chat</button></li>\n';
  }

  userLi += '</ul>';

  return userLi;
};

const generateChatLi = (req) => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
  let chats = getChatList(user).reverse();

  const chatUser = getChatUser(user).reverse();
  let chatLi = '';

  for (let i = 0; i < chats.length;i++){
    chatLi += '<div class="chatContainer" id="'+ chats[i] +'" onclick="goToChat(\'' + chats[i] + '\')"><br>' + chatUser[i] + '</div>' ;
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

module.exports = {
  checkSess,
  getUser,
  newUserSession,
  getSessID,
  userSessionCreate,
  userSessionDelete,
  checkPass,
  addUser,
  messageLog,
  createChat,
  getUserList,
  getChatList,
  clearMessages,
  generatePage,
  generateUserLi,
  generateChatLi,
  getMessagesFromChat,
  chatCheck,
  getChatId
};