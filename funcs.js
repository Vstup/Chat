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

const getUser = () => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
  return user;
};

const checkSess = (req) => {
  if (cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1')) {
    const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
    const sessId = getSessID(user);
    // console.log('user: ' + user);
    // console.log('sessId: ' + sessId);
    if (sessions[sessId].active === true){
      const sysTok = sessions[sessId].token;
      const userTok = cookie.get(req, 'token', 'Hd1eR7v12SdfSGc1');
      // console.log('active: ' + sessions[sessId].active);
      // console.log('sysTok: ' + sysTok);
      // console.log('userTok: ' + userTok);
      if (sysTok === userTok){return true;}else return false;
    }else return false;
  } else return false;

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
  const users = JSON.parse(fs.readFileSync('./users.json'))
  return Object.keys(users);
};

const clearMessages = () => {
  fs.writeFileSync('./messages.json','[]');
};

const getChatList = (user) => {
  const res = [];
  const id = getSessID(user);
  const chats = JSON.parse(fs.readFileSync('./chats.json'));
  for (let i = 0;i < chats.length;i++){
    if (chats[i].users[0] === user || chats[i].users[1] === user){
      res.push(chats[i].chatId)
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
  clearMessages
};