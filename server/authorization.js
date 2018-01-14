'use strict';

const fs = require ('fs');
const token = require('./tokenGenerate');
const cookie = require('../node-cookie/index');
const funcs = require('./funcs');

const users = JSON.parse(fs.readFileSync('Data Base/users.json'));
const sessions = JSON.parse(fs.readFileSync('Data Base/sessions.json'));

const getSessID = (uname) => {
    for (let key in sessions) if (sessions[key].uname === uname) return key;
};

const getUser = (req) => {
    const user = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
    return user;
};

const addUser = (uname, passwd, res) => {
    if (!users[uname]) users[uname] = passwd;
    else res.end('There is an user with such a name');
    fs.writeFileSync('Data Base/users.json', JSON.stringify(users) );
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
    fs.writeFileSync('Data Base/sessions.json', JSON.stringify(sessions) );
};

const newUserSession = (uname) => {
    sessions[token.generateSessId] = {active: false, uname: uname, token : ''};
    fs.writeFileSync('Data Base/sessions.json', JSON.stringify(sessions) );
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


module.exports = {
    checkSess,
    newUserSession,
    userSessionCreate,
    userSessionDelete,
    checkPass,
    addUser,
    users,
    sessions
    };