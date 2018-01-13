'use strict';
let nameCheck = getCookie();
let userLi;


window.onload = () => {
  document.getElementById('u-name').innerHTML = getCookie();
  document.getElementById('left').style.height = height - 40 + 'px';
  document.getElementById('right').style.height = height -40 + 'px';
  document.getElementById('rightBefore').style.height = height -40 + 'px';
  document.getElementById('chat').style.height = height - 100 + 'px';
  document.getElementById('left-up').style.height = height - 153 + 'px';
  document.getElementById('searchRes').style.height = height - 166 + 'px';
  document.getElementById('messages').style.height = height - 153 + 'px';
  const block = document.getElementById('messages');

};
function getUserLi(value,callback) {

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      userLi = JSON.parse(this.responseText);
      console.log('touched');
      callback(value);
    }
  };
  xhr.open('GET', '/index.js?uname=', true);
  xhr.setRequestHeader('cause', 'search');
  xhr.send();

}

function serchRes(value) {
  let res = '';
  if (value === '') {
    document.getElementById('searchRes').innerHTML = '<p>No users found</p>';
    document.getElementById('left-up').style.display = 'block';
    document.getElementById('searchRes').style.display = 'none';
  } else {

    for (let i = 0; i < userLi.length; i++) {
      if (userLi[i].indexOf(value) === 0) {
        res += '<div class="searchedItemContainer" ' +
                    'onclick="chat(\'' + userLi[i] + '\')">' + userLi[i] + '</div>\n';
      }
    }
    document.getElementById('searchRes').innerHTML = res;
    document.getElementById('left-up').style.display = 'none';
    document.getElementById('searchRes').style.display = 'block';
  }
}

function search(value) {
  if (!userLi){
    getUserLi(value, serchRes);
  } else serchRes(value);

}

const height = document.documentElement.clientHeight;


function scrolldown() {
  // block.scrollTop = block.scrollHeight;
}

let currentChat = '';

let displayFlag = false;

function getCookie() {
  const   matches = document.cookie.match(new RegExp(
    '(?:^|; )' + 'user'.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const chat = (user2) => {
  userLi = '';
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);

      document.getElementById('left-up').innerHTML = data[1];
      document.getElementById('searchField').value = '';
      document.getElementById('searchRes').innerHTML = '<p>No users found</p>';
      document.getElementById('left-up').style.display = 'block';
      document.getElementById('searchRes').style.display = 'none';
      goToChat(data[0]);

      document.getElementById('left-up').innerHTML = data[0] + data[1];
    }
  };
  xhr.open('POST', '/index.js?uname='+user2, true);
  xhr.setRequestHeader('cause', 'chatCreate');
  xhr.send();

};

const goToChat = (chatId) => {

  const userWith = document.getElementById(chatId).innerHTML;

  document.getElementById('chat-header').innerHTML = userWith.replace('<br>','');

  if (currentChat !== ''){
    document.getElementById(currentChat).style =
            document.getElementsByClassName('chatContainer').style;
  }
  //        document.getElementById(chatId).style.backgroundColor = '#ff5c00';
  document.getElementById(chatId).style.backgroundColor = '#e4eaee';
  document.getElementById(chatId).style.color = 'black';

  currentChat = chatId;

  if(!displayFlag){
    document.getElementById('right').style.display = 'block';
    document.getElementById('rightBefore').style.display = 'none';
    displayFlag = true;
  }
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
      let res = '';
      for (let i = 0; i<data.length;i++){

        // res += '<div>' + data[i].userSent + ': ' + data[i].messText + '</div>\n';

        if (data[i].userSent == nameCheck) {
          res += '<div id="right-message">' + '<span class="message-decor">' + data[i].messText + '</span>' + '</div>\n';
        } else {
          res += '<div id="left-message">' + '<span class="message-decor">' + data[i].messText + '</span>' + '</div>\n';
        }
      }
      document.getElementById('messages').innerHTML = res;
      window.scrollTo(0, document.body.scrollHeight);


    }
  };
  xhr.open('POST', '/index.js?chatId='+chatId, true);
  xhr.setRequestHeader('cause', 'chatOpen');
  xhr.send();
};

const singOut = () => {

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      location.href = '/login';
    }
  };
  xhr.open('POST', '/logout', true);
  xhr.send();
};

const socket = io({transports: ['websocket']});

socket.on('broadcast', function (data) {
  render(data);
  scrolldown();
});

socket.on('clear1', function () {
  document.getElementById('messages').innerHTML = '<div></div>';
});

function sendMessage(nickname, message) {

  if (message === 'clear') {
    socket.emit('clear');

  }

  else if(nickname && message) {
    socket.emit('message', {nickname: nickname, message: message, chatId: currentChat});
  }

}

function render(data) {
    if (data.chatId === currentChat) {
        if (data.nickname == nameCheck) {
            document.getElementById('messages').innerHTML += '<div id="right-message">' + '<span class="message-decor">' + '<span>' + data.message + '<span>' + '</span>' + '</div>';
        } else {
            soundClick();
            document.getElementById('messages').innerHTML += '<div id="left-message">' + '<span class="message-decor">' + data.message + '</span>' + '</div>';
        };
        window.scrollTo(0, document.body.scrollHeight);
    }

};