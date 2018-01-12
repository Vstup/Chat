'use strict';

let currentChat = '';
const socket = io({transports: ['websocket']});

socket.on('broadcast', function (data) {
    render(data);
    scrolldown();
});

socket.on('clear1', function () {
    document.getElementById('messages').innerHTML = '<div></div>';
});


const height = document.documentElement.clientHeight;
document.getElementById('left').style.height = height - 40 + 'px';
document.getElementById('right').style.height = height -40 + 'px';
document.getElementById('chat').style.height = height - 100 + 'px';
document.getElementById('left-up').style.height = height - 100 + 'px';
document.getElementById('messages').style.height = height - 144 + 'px';
const block = document.getElementById('messages');

function scrolldown() {
  block.scrollTop = block.scrollHeight;
}

function getCookie() {
  const   matches = document.cookie.match(new RegExp(
    '(?:^|; )' + 'user'.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function chat(user2) {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
      document.getElementById('left-up').innerHTML = '<button onclick="singOut()">Sing Out</button>' +
                data[0] + '<hr>' + data[1];
    }
  };
  xhr.open('POST', '/index.js?uname='+user2, true);
  xhr.setRequestHeader('cause', 'chatCreate');
  xhr.send();

};

function goToChat(chatId) {
  currentChat = chatId;
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
      let res = '';
      for (let i = 0; i<data.length;i++){
        res += '<div>' + data[i].userSent + ': ' + data[i].messText + '</div>\n';
      }
      document.getElementById('messages').innerHTML = res;
      window.scrollTo(0, document.body.scrollHeight);


    }
  };
  xhr.open('POST', '/index.js?chatId='+chatId, true);
  xhr.setRequestHeader('cause', 'chatOpen');
  xhr.send();
};

function singOut() {

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      location.href = '/login';
    }
  };
  xhr.open('POST', '/logout', true);
  xhr.send();
};

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
    document.getElementById('messages').innerHTML += '<div>' + data.nickname + ': ' + data.message + '</div>';
    window.scrollTo(0, document.body.scrollHeight);
  }
}