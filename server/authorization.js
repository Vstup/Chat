'use strict';

const fs = require ('fs');
const token = require('./tokenGenerate');
const cookie = require('../node-cookie/index');
const funcs = require('./funcs');
const db = require ('./db');


const getSessID = (res,uname, callback) => {

  db.chatdb.collection('sessions').findOne({uname:uname},function(err, result) {
    if (err) throw err;
    callback(result._id,res);
  });
};

const getUser = (req) => {
  const user = cookie.get(req, 'user');
  return user;
};



const addUser = (res,uname, passwd,email,callback) => {
  db.chatdb.collection('users').findOne({username:uname},function(err, result) {
    if (err) throw err;
    if (result){
      res.end('There is an user with such a name');
    }else {
      db.chatdb.collection('users').insertOne({
        username:uname,
        pass:passwd,
        email:email
      },function(err, result) {
        if (err) throw err;
        callback();
      });
    }
  });
};


const checkPass = (uname, passwd,callback) => {
  db.chatdb.collection('users').findOne({
    username: uname,
    pass:passwd
  },function (err, result) {
    if (err) throw err;
    const chek = (result !== null);
    callback(chek);
  });
};

const userSessionCreate = (res,uname,token,callback) => {

  db.chatdb.collection('sessions').updateOne({'uname':uname}, {$set:{'active':true,'token':token}}, function(err, res) {
    if (err) throw err;
    callback();
  });
};

const userSessionDelete = (res,uname,callback) => {
  cookie.clear(res, 'user');
  cookie.clear(res, 'token');
  db.chatdb.collection('sessions').updateOne({uname:uname}, {$set:{active:false,token:''}}, function(err, res) {
    if (err) throw err;
    callback();
  });

};

const newUserSession = (uname,callback) => {
  db.chatdb.collection('sessions').insertOne({
    active:false,
    uname:uname,
    token:''
  },function(err, result) {
    if (err) throw err;
    callback();
  });
};


const checkSess = (req,callback) => {
  const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');

  if (user) {
    db.chatdb.collection('sessions').findOne({uname: user}, function (err, result) {
      if (err) throw err;
      if(result !== null){
        const sysTok = result.token;
        const userTok = cookie.get(req, 'token', 'Hd1eR7v12SdfSGc1');
        const chek = (result.active === true && sysTok === userTok);
        callback(chek);
      }else callback(false);
    });
  }else callback(false);
};


module.exports = {
  checkSess,
  newUserSession,
  userSessionCreate,
  userSessionDelete,
  checkPass,
  addUser,
};