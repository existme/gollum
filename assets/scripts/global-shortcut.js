const $ = require('jquery');
Mousetrap.bind(['e'], function (e) {
  e.preventDefault();
  window.location = "/edit" + window.location.pathname;
  return false;
});

Mousetrap.bind('/', e => {
  e.preventDefault();
  $("input[name=treeFilter]").focus();
  return false;
});

$('#treeFilter').bind('keydown', function (e) {
  let qData = {
    time: Date.now(),
    query: $('#treeFilter').val()
  };
  localStorage.setItem('filter', JSON.stringify(qData));
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
    let tree = $("#tree").fancytree("getTree");

    if (tree.activeNode)
      tree.activeNode.setFocus(true);
    else {
      $(".fancytree-container").focus();
    }
    e.preventDefault();
  }
});


window.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || event.metaKey)) {
    console.log("ctrl key press detected", e);
    if (e.shiftKey) {
      switch (e.key) {
        case 'F':
        case 'f':
          $("#treeFilter").focus();
          break;
      }
    } else {
      if (e.key === 'e') {
        // call your function to do the thing
        e.preventDefault();
        window.location = "/edit" + window.location.pathname;
        return false;
      }
    }
  }
}, false);