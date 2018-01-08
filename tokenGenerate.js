'use strict';


const random = (max) => {
    let res = Math.floor(Math.random()*100);
    res >= max ? res = res%max : res;
    return res
};

const tokenString = '1234567890qwertyuiopasdfghjklxcvbnm0987654321ASDFGHJKLPOIUYTREWQZXCVBNM';
const sessIdString = '1234567890';


const generateToken = () =>{

    let key = '';

    for (let i = 0; i<16;i++){
        key = key + tokenString[random(71)]
    }
    return key;
};

const generateSessId = () => {
    let key = '';

    for (let i = 0; i<11;i++){
        key = key + sessIdString[random(10)]
    }
    return key;
};



const token = generateToken();
const sessId = generateSessId();


module.exports.generateToken = token;
module.exports.generateSessId = sessId;