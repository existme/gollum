// import 'split.js/split.min.js'
Splitor = require("split.js");

var sizes = localStorage.getItem('split-sizes');

if (sizes) {
  sizes = JSON.parse(sizes);
} else {
  sizes = [25, 75]  // default sizes
}

function setInnerTree(width){
  $("#sidebar-content").width("calc(" + width + "% - 25px");
}
function splitWidthConfig() {
  let sizes = split.getSizes();
  if (sizes[0] < 5) {
    console.log("Size less than 5!", sizes[0]);
    $("#wiki-sidebar").hide();
    $("#cc1").width("calc(100% - 10px)");
  } else {
    $("#wiki-sidebar").show();
    setInnerTree(sizes[0])
  }
}

var split = Splitor(['#wiki-sidebar', '#cc1'], {
  direction: 'horizontal',
  sizes: sizes,
  minSize: [0, 500],
  gutterSize: 10,
  cursor: 'col-resize',
  onDragEnd: function () {
    localStorage.setItem('split-sizes', JSON.stringify(split.getSizes()));
    splitWidthConfig();
  },
  onDragStart: function () {
    $("#wiki-sidebar").show();
  },
  onDrag: function () {
    setInnerTree(split.getSizes()[0]);
  }
});
splitWidthConfig();

$('body').removeClass('fade-out');