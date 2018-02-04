'use strict';
let nameCheck = getCookie();
let userLi;

function getBlock(id) {
  return document.getElementById(id);
}

window.onload = () => {
  const block = getBlock('messages');
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
    getBlock('search-res').innerHTML = '<p>No users found</p>';
    getBlock('users').style.display = 'block';
    getBlock('search-res').style.display = 'none';
  } else {

    userLi.forEach(item => {
      if (item.indexOf(value) === 0) {
      res += '<div class="searchedItemContainer" ' +
        'onclick="chat(\'' + item + '\')">' + item + '</div>\n';
    }
  });
    getBlock('search-res').innerHTML = res;
    getBlock('users').style.display = 'none';
    getBlock('search-res').style.display = 'block';
  }
}

function search(value) {
  if (!userLi){
    getUserLi(value, serchRes);
  } else serchRes(value);

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

      getBlock('users').innerHTML = data[1];
      getBlock('searchField').value = '';
      getBlock('search-res').innerHTML = '<p>No users found</p>';
      getBlock('users').style.display = 'block';
      getBlock('search-res').style.display = 'none';



      let chatLi = '';
      let i = 0;
      for (let key in data[1]){
        chatLi += '<div class="user-chat-container" id="'+ key +

          '" onclick="goToChat(\'' + key + '\')"><div class="row row-flex"><div class="col-xs-4 col-sm-4 col-md-4 padding"><div class="circul text-center"></div></div><div class="col-xs-8 col-sm-8 col-md-8 padding user-info"><div class="user-name">' +

          data[2][i] + '</div><div class="user-last-mesasge" id="lastMessage">'+ '<span id="last-msg-cut">' + data[1][key] + '</span>' +'</div><span class="last-msg-dot" id="' + key + 1 + '">...</span></div></div></div>' ;
        i++;
      }


      getBlock('users').innerHTML = chatLi;
      goToChat(data[0]);
    }
  };
  xhr.open('POST', '/index.js?uname='+user2, true);
  xhr.setRequestHeader('cause', 'chatCreate');
  xhr.send();

};

const goToChat = (chatId) => {

  const userWith = getBlock(chatId).innerHTML;

  if (currentChat !== ''){
    getBlock(currentChat).style =
      document.getElementsByClassName('chatContainer').style;
  }
  getBlock(chatId).style.backgroundColor = '#656870';

  currentChat = chatId;

  if(!displayFlag){
    getBlock('messages').style.display = 'block';
    getBlock('right-footer').style.display = 'block';
    displayFlag = true;
  }
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
      let res = '';
      for (let i = 0; i<data.length;i++){

        if (data[i].userSent == nameCheck) {
          res += '<div id="right-message">' + '<div class="right-container">' + data[i].messText + '</div>' + '<div class="clear"></div>' + '<div class="messTime">'+'</div></div>';
        } else {
          res += '<div id="left-message">' + '<div class="left-container">' + data[i].messText + '</div>' + '<div class="clear"></div>' + '<div class="messTime">'+'</div></div>';
        }
      }
      getBlock('messages').innerHTML = res;

      scrollDown();
      hideMenu();

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
});

socket.on('clear1', function () {
  getBlock('messages').innerHTML = '<div></div>';
});

function sendMessage(nickname, message) {

  if (message === 'clear') {
    socket.emit('clear');

  }

  else if(nickname && message) {
    socket.emit('message', {nickname: nickname, message: message, chatId: currentChat});
  }

}
const block = getBlock('messages');
function  scrollDown() {
  block.scrollTop = block.scrollHeight;
}

function render(data) {
  if (data.chatId === currentChat) {
    if (data.nickname == nameCheck) {
      getBlock('messages').innerHTML += '<div id="right-message">' + '<div class="right-container">' + data.message + '</div>' + '<div class="clear"></div>' + '</div>';
    } else {
      getBlock('messages').innerHTML += '<div id="left-message">' + '<div class="left-container">' + data.message + '</div>' + '<div class="clear"></div>' + '</div>';
    }
    console.log(data.chatId);
    scrollDown();
  }
  getBlock(data.chatId).getElementsByTagName('DIV')[5].innerHTML = '<span id="last-msg-cut">' + data.message + '</span>';

  getBlock('last-message-cut-check').innerHTML = '<span id="last-msg-cut-check">' + data.message + '</span>';
  let lastMsgCutCheck = getBlock('last-msg-cut-check').offsetWidth;
  if (lastMsgCutCheck > 100) {
    getBlock(data.chatId + 1).style.display = 'inline';
    console.log(lastMsgCutCheck);
  } else {
    getBlock(data.chatId + 1).style.display = 'none';
  }
 
};

function getBlock(id) {
  return document.getElementById(id);
};

let height = window.innerHeight;
getBlock('left').style.height = height + 'px';
getBlock('right').style.height = height + 'px';
getBlock('messages').style.height = height - 200 + 'px';

$(window).resize(function() {
  getBlock('left').style.height = $(window).height() + 'px';
  getBlock('right').style.height = $(window).height() + 'px';
  getBlock('messages').style.height = $(window).height() - 200 + 'px';

});

const textarea = getBlock('input-area');

textarea.onkeydown = function(event) {
  const reBegin = /^(\n)/;
  const reEnd = /(\n)$/;
  //let asf = re.test(this.value + '');
  //console.log(asf);
  if (event.keyCode == 13 && !event.shiftKey) {
    event.preventDefault();
    if (reBegin.test(this.value + '')) {
        this.value = this.value.replace(/(\n)*/, '');
      };
    if (reEnd.test(this.value + '')) {
      this.value = this.value.replace(/(\n)*$/, '');
    };
    console.log(this.value);
    this.value = this.value.replace(/\n/g, '<br />');
    sendMessage(getCookie(), this.value);
    this.value = '';
}};


function drawMenu () {
  document.getElementById('left').className = 'col-sm-4 col-md-4 left drawmenu';
};

function hideMenu() {
  document.getElementById('left').className = 'hidden-xs col-sm-4 col-md-4 left';
};
