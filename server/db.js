'use strict';
const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost/mydb";
const url = "mongodb://admin:admin@172.31.22.176/chatdb";
let chatdb;


const dbConnect = () => {
    MongoClient.connect(url, function (err, database) {
        chatdb = database.db('chatdb');
//         chatdb = database.db('mydb');
        console.log('data base connected!');
        module.exports.chatdb = chatdb;
    });
};


module.exports.dbConnect = dbConnect;

