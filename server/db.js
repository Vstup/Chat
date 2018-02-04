'use strict';
const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost/mydb"; 
const url = "mongodb://admin:admin@172.30.78.118/chat";
let chatdb;


const dbConnect = () => {
    MongoClient.connect(url, function (err, database) {
        chatdb = database.db('chat');
        console.log('data base connected!');
        module.exports.chatdb = chatdb;
    });
}


module.exports.dbConnect = dbConnect;

