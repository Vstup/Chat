'use strict';
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost/mydb";
let chatdb;

let result;
    MongoClient.connect(url, function (err, database) {
        chatdb = database.db('mydb');

        chatdb.collection('messages').find().toArray(function(err, result) {
            if (err) throw err;
            console.log(result)

        });
    });

