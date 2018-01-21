'use strict';

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
  const reEnd = /(\n)$/
  //let asf = re.test(this.value + '');
  //console.log(asf);
  if (event.keyCode == 13 && !event.shiftKey) {
    event.preventDefault();
    if (reBegin.test(this.value + '')) {
        this.value = this.value.replace(/(\n)*/, '');
      };
    if (reEnd.test(this.value + '')) {
      this.value = this.value.replace(/(\n)$/, '');
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
