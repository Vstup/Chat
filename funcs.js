'use strict';
const fs = require ('fs');
const token = require('./tokenGenerate');
const cookie = require('node-cookie');

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



module.exports = {
  checkSess,
  getUser,
  newUserSession,
  getSessID,
  userSessionCreate,
  userSessionDelete,
  checkPass,
  addUser};