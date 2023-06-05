// const socket = io();
// const textfield = document.getElementById('text');
//
// socket.on("message", function(message){
//   console.log(message);
// });
//
// document.querySelector("#message-form").addEventListener('submit', function(e){
//   e.preventDefault();
//
//   const message = e.target.elements.message.value;
//   socket.emit('sendmessage', message);
//   textfield.value="";
//   textfield.focus();
// });

function scroll() {
  var div = document.getElementById("card");
  div.scrollTop = div.scrollHeight;
}

window.onload = function () {
  scroll();
};

var messages = document.getElementsByClassName("card-body")[0];
var name = document.getElementById("name");
var usertype = document.getElementById("usertype").innerHTML;
var textarea = document.getElementById("textarea");
var user = document.getElementById("user").innerHTML;
var guide = document.getElementById("guide").innerHTML;
var links = document.getElementsByClassName("list-group-item");
var mbs = document.getElementsByClassName("neno");

var statusDefault = status.textContent;

var setStatus = function (s) {
  status.textContent = s;
  if (s !== statusDefault) {
    var delay = setTimeout(function () {
      setStatus(statusDefault);
    }, 4000);
  }
};

var socket = io.connect("http://127.0.0.1:8000");

if (socket != undefined) {
  console.log("Connected to socket...");

  socket.on("output", function (data) {
    if (data.messages.length) {
      for (var x = 0; x < data.messages.length; x++) {
        var div1 = document.createElement("div");
        var div2 = document.createElement("div");
        var div3 = document.createElement("div");
        var div4 = document.createElement("div");
        var div5 = document.createElement("div");
        var p = document.createElement("p");
        var small = document.createElement("small");
        var i = document.createElement("i");
        p.setAttribute("class", "mb-1");
        small.setAttribute("class", "opacity-60");
        i.setAttribute("class", "ni ni-check-bold");

        if (data.messages[x].sentby === usertype) {
          div1.setAttribute("class", "row justify-content-end text-right");
          div2.setAttribute("class", "col-auto");
          div3.setAttribute("class", "card bg-gradient-primary text-white");
          div4.setAttribute("class", "card-body p-2");
        } else {
          div1.setAttribute("class", "row justify-content-start");
          div2.setAttribute("class", "col-auto");
          div3.setAttribute("class", "card");
          div4.setAttribute("class", "card-body p-2");
        }

        var time =
          new Date(data.messages[x].time).getHours() +
          " : " +
          (new Date(data.messages[x].time).getMinutes() < 10 ? "0" : "") +
          new Date(data.messages[x].time).getMinutes();
        small.innerHTML = time;
        p.innerHTML = data.messages[x].text;

        div5.appendChild(small);
        div5.appendChild(i);
        div4.appendChild(p);
        div4.appendChild(div5);
        div3.appendChild(div4);
        div2.appendChild(div3);
        div1.appendChild(div2);

        messages.appendChild(div1);
        scroll();
      }
    }
  });

  socket.on("status", function (data) {
    setStatus(typeof data === "object" ? data.message : data);
    if (data.clear) {
      textarea.value = "";
    }
  });

  textarea.addEventListener("keydown", function (event) {
    if (event.which === 13 && event.shiftKey == false) {
      socket.emit("input", {
        type: usertype,
        msg: textarea.value,
        time: new Date(),
      });
      event.preventDefault();
      textarea.value = "";
      textarea.focus();
    }
  });

  document
    .querySelector("#sendlocation")
    .addEventListener("click", function () {
      if (!navigator.geolocation) {
        return alret("Geolocation not supported by browser.");
      } else {
        navigator.geolocation.getCurrentPosition((position) => {
          socket.emit("sendlocation", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            type: usertype,
            time: new Date(),
          });
          console.log(position.coords);
        });
      }
    });

  var room = user + "-" + guide;
  console.log(room);
  socket.emit("join", room);

  for (var i = 0; i < links.length; i++) {
    links[i].onclick = function (i) {
      var vals = this.href.split("/");
      if (usertype === "user") {
        var uname = user;
        var gname = vals[5];
      } else {
        var uname = vals[4];
        var gname = guide;
      }
      socket.emit("dis", { uname: uname, gname: gname });
    };
  }
} else {
  console.log("Error!");
}
