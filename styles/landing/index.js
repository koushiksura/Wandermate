window.onscroll = function () {
  var navbar = document.getElementById("nav");
  var wander = document.getElementById("wander");
  var mate = document.getElementById("mate");
  var items = document.getElementsByClassName("items");
  var count = document.getElementById("count");

  if (window.pageYOffset < 50) {
    navbar.style.background = "rgba(0, 0, 0, 0)";
    navbar.style.borderBottom = "1px solid #f2f2f2";
    wander.style.color = "#ffffff";
    mate.style.color = "#06b995";
    for (var i = 0; i < items.length; i++) {
      items[i].style.color = "#ffffff";
      items[i].onmouseover = function () {
        items[i].style.color = "#06b995";
      };
    }
  } else {
    navbar.style.backgroundColor = "#fff";
    navbar.style.boxShadow = "0 4px 4px -2px #495057";
    navbar.style.borderBottom = "none";
    wander.style.color = "grey";
    mate.style.color = "#06b995";
    for (var i = 0; i < items.length; i++) {
      items[i].style.color = "grey";
      items[i].onmouseover = function () {
        items[i].style.color = "black";
      };
    }
  }
};

$("#carouselExample").on("slide.bs.carousel", function (e) {
  var $e = $(e.relatedTarget);
  var idx = $e.index();
  var itemsPerSlide = 3;
  var totalItems = $(".carousel-item").length;

  if (idx >= totalItems - (itemsPerSlide - 1)) {
    var it = itemsPerSlide - (totalItems - idx);
    for (var i = 0; i < it; i++) {
      // append slides to end
      if (e.direction == "left") {
        $(".carousel-item").eq(i).appendTo(".carousel-inner");
      } else {
        $(".carousel-item").eq(0).appendTo(".carousel-inner");
      }
    }
  }
});

$(document).ready(function () {
  $("a.thumb").click(function (event) {
    event.preventDefault();
    var content = $(".modal-body");
    content.empty();
    var title = $(this).attr("title");
    $(".modal-title").html(title);
    content.html($(this).html());
    $(".modal-profile").modal({ show: true });
  });
});

window.console = window.console || function (t) {};
if (document.location.search.match(/type=embed/gi)) {
  window.parent.postMessage("resize", "*");
}
