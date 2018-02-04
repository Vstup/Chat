'use strict';
const fs = require ('fs');
const auth = require('./authorization');
const token = require('./tokenGenerate');
const cookie = require('../node-cookie/index');
const db = require ('./db');

const getSessID = (res,uname, callback) => {
  // console.log(uname);
  db.chatdb.collection('sessions').findOne({uname:uname},function(err, result) {
    if (err) throw err;
    // console.log(result);
    callback(result._id);
  });
};

const getUser = (req) => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
  return user;
};

const messageLog = (user,chatId,text,time)=> {
  getSessID('', user, (sessId) => {
    db.chatdb.collection('messages').insertOne({
      messId: token.generateSessId,
      chatId: chatId,
      userSent: user,
      userSentId: sessId,
      timeString: time,
      time:returnTime(time),
      messText: text
    }, function (err, result) {
      if (err) throw err;
      // callback();
    });
  });
};


const createChat = (res,user1, user2,callback) => {
  // console.log('user1: ' + user1);
  // console.log('user2: ' + user2);
  getSessID(res,user1,(id1)=>{
    // console.log('id1: ' + id1);
    getSessID(res,user2,(id2)=>{
      // console.log('id2: ' + id2);
      db.chatdb.collection('chats').insertOne({
        chatId : '' + id1 + id2,
        users : [user1,user2],
        usersId : [id1,id2]
      },function (err,result) {
        if (err) throw err;
        callback();
      });
    });
  });
};

const clearMessages = () => {
  fs.writeFileSync('Data Base/messages.json','[]');
};

const getChatList = (user,callback) => {
  db.chatdb.collection('chats').find({users:user}).toArray(function (err, result) {
    if (err) throw err;
    const res = [];
    result.forEach(item => {
      if (item.users[0] === user ||item.users[1] === user){
        res.push(item.chatId);
      }
    });
    callback(res);
  });
};

const getChatUser = (user,callback) => {
  db.chatdb.collection('chats').find({users:user}).toArray(function (err, result) {
    if (err) throw err;
    const res = [];
    result.forEach(item => {
      if (item.users[0] === user ){
        res.push(item.users[1]);
      }else if (item.users[1] === user){
        res.push(item.users[0]);
      }
    });
    callback(res);
  });
};

const chatCheck = (res,user,callback) => {
  let flag = false;
  const result = [];

  getUserList((users)=>{
    getChatUser(user,(chats)=>{
      for (let i = 0; i < users.length; i++){
        for (let j = 0;j < chats.length; j++){
          if (users[i]===chats[j]) {
            flag = true;
          }
        }
        if (flag === false) {
          result.push(users[i]);
        }
        flag = false;
      }
      callback(result);
    });
  });

};

const generatePage= (res,req,callback) => {
  let page = fs.readFileSync('public/views/index.html').toString();

  generateChatLi(req,(chatLi)=>{
    page = page.replace('***USER CHATS HERE***', chatLi);
    callback(page);
  });

};

const getLastMess = (user, chats,callback) => {
  let flag = false;
  const result = {};
  db.chatdb.collection('chats').find().toArray(function (err,chats) {
    if (err) throw err;

    db.chatdb.collection('messages').find().toArray(function (err,messages) {
      if(err) throw err;

      if (messages.length === 0){
        chats.forEach(item => {result[item] = '';});
        callback(result);
        return;
      }


      for (let i = 0; i < chats.length; i++){
        for (let j = messages.length-1; j > 0;j--){
          if (messages[j].chatId === chats[i].chatId){
            result[chats[i].chatId] = messages[j].messText ;
            flag = true;
            break;
          }}
        if (flag===false) result[chats[i].chatId] = '';
        flag = false;
      }
      callback(result);
    });
  });
};

const generateChatLi = (req,callback) => {
  const user = getUser(req);
  getChatList(user,(list)=>{
    const chats = list.reverse();
    getLastMess(user,chats,(lastMessages)=>{
      getChatUser(user,(chatUserList)=>{
        const chatUser = chatUserList.reverse();
        let chatLi = '';
        let i = 0;

        for (let key in lastMessages){
          chatLi += '<div class="user-chat-container" id="'+ key +
              '" onclick="goToChat(\'' + key + '\')"><div class="row row-flex">'+
              '<div class="col-xs-4 col-sm-4 col-md-4 padding"><div class="circul text-center">'+
              '</div></div><div class="col-xs-8 col-sm-8 col-md-8 padding user-info"><div class="user-name">' +
               chatUser[i] + '</div><div class="user-last-mesasge" id="lastMessage">'+ '<span id="last-msg-cut">' +
              lastMessages[key] + '</span>' +'</div><span class="last-msg-dot" id="' + key + 1 + '">...</span></div>'+
              '</div></div>' ;
          i++;
        }
        callback(chatLi);
      });
    });
  });
};

const getChatLi = (req,callback) => {
  const user = getUser(req);
  getChatList(user,(chatsList)=>{
    const chats = chatsList.reverse();
    getLastMess(user,chats,(lastMessages)=>{
      getChatUser(user,(chatUserList)=>{
        const chatUser = chatUserList.reverse();
        const res =[];
        res.push(lastMessages);
        res.push(chatUser);
        callback(res);
      });
    });
  });
};

const getMessagesFromChat = (res,chatId,callback) => {
  db.chatdb.collection('messages').find({chatId:chatId}).toArray(function (err,result) {
   // console.log(result);
    callback(result);
  });
};

const getChatId = (user1, user2, callback) => {
  let res;
  db.chatdb.collection('chats').find().toArray(function (err,chats) {
    if (err) throw err;
    chats.forEach(item => {
      if (item.users[0] === user1 && item.users[1] === user2 ){
        res = item.chatId;
        callback (res);
      }
    });
  });
};

const getUserList = (callback) =>{
  db.chatdb.collection('users').find().toArray(function (err,result) {
    const res =[];
    result.forEach((item)=>{
      res.push(item.username);
    });
    callback(res);
  });
};


const returnTime = (timeString) => {
    function adZero(time) {
       return time<10 ? '0'+time:time;
        }

    const h = adZero(new Date(timeString).getHours());
    const m = adZero(new Date(timeString).getMinutes());

    const result = h + ':' + m;
    // console.log(result)
    return result;
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
  getChatId,
  getChatLi,
  returnTime
};


