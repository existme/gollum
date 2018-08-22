import 'jquery.fancytree/dist/skin-win8/ui.fancytree.min.css'

let prevJ = window.jQuery;
const $ = require('jquery');
var currentJ = $.noConflict(true);
window.jQuery = currentJ;
window.$ = currentJ;

const fancytree = require('jquery.fancytree');
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter.js'

require('jquery-contextmenu');
require('./splitor.js');


var tree_cm = require('./tree-contextmenu.js');
tree_cm.setJQuery(currentJ);
var commands = require('./contextmenu-commands.js');

$.ui.fancytree.registerExtension({
  name: "contextMenu",
  version: "@VERSION",
  contextMenu: {
    selector: "fancytree-title",
    menu: {},
    actions: {}
  },
  treeInit: function (ctx) {
    this._superApply(arguments);
    tree_cm.initContextMenu(ctx.tree,
      ctx.options.contextMenu.selector || "fancytree-title",
      ctx.options.contextMenu.menu,
      ctx.options.contextMenu.actions);
  }
});
function scrollToNode(activeNode) {
  let t = $("#tree").fancytree("getTree");
  // t.options.scrollParent = $('#wiki-sidebar');
  t.options.scrollParent = $('#sidebar-content');
  let n = t.getNodeByKey(activeNode);
  if (n != null) {
    n.setActive();
    n.selected = true;
    n.scrollIntoView(false);
  }
}

/**
 * Requires variable 'activeNode' to be set and contain the node which should be activated on load
 */
$("#tree").fancytree({
  extensions: ["contextMenu", "filter"],
  icon: true,
  minExpandLevel: 1,
  expandParents: true,
  activeVisible: true,
  autoActivate: true,
  clickFolderMode: 4,
  autoScroll: false,
  scrollParent: $('#sidebar-content'),

  // source: {
  //   url: "/folder.json"
  // },
  filter: {
    autoApply: true,   // Re-apply last filter if lazy data is loaded
    autoExpand: false, // Expand all branches that contain matches while filtered
    counter: true,     // Show a badge with number of matching child nodes near parent icons
    fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
    hideExpandedCounter: true,  // Hide counter badge if parent is expanded
    hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
    highlight: true,   // Highlight matches by wrapping inside <mark> tags
    leavesOnly: false, // Match end nodes only
    nodata: true,      // Display a 'no data' status node if result is empty
    mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
  },
  click: function (event, data) {
    if (data.node.folder != true) {
      window.location.href = "/" + data.node.data.href;
    }
    else {
      if (event.originalEvent.target.classList[0] != "fancytree-expander")
        data.node.toggleExpanded();
    }
  },

  loadChildren: function () {
    scrollToNode(activeNode);
  },
  init: function () {
  },
  keydown: function (event, data) {
    switch (event.which) {
      case 13:
        let href = data.tree.activeNode.data.href;
        window.location = "/" + href;
        return false;
      case 32:
        let flag = data.tree.activeNode.isExpanded();
        data.tree.activeNode.setExpanded(!flag);
        return false;
    }
  },
  contextMenu: {
    menu: {
      "openn": {"name": "Open in new tab", "icon": "fas fa-window-restore"},
      "sep0": "---------",
      "new": {"name": "New Page", "icon": "fas fa-plus-square"},
      "rename": {"name": "Rename", "icon": "fas fa-tag"},
      "edit": {"name": "Edit", "icon": "fas fa-edit"},
      "cut": {"name": "Cut", "icon": "fas fa-cut"},
      "copy": {"name": "Copy", "icon": "fas fa-copy"},
      "paste": {"name": "Paste", "icon": "fas fa-paste"},
      "sep1": "---------",
      "delete": {"name": "Delete", "icon": "fas fa-trash-alt", "disabled": false}
    },
    actions: function (node, action, options) {
      // $("#selected-action").text("Selected action '" + action + "' on node " + node + ".");
      if (node.selected == undefined) {
        node.setActive(false);
      }
      console.log("Selected action '" + action + "' on node " + node.key + ".");
      console.log("Node was selected?: '" + node.selected);
      switch (action) {
        case "openn":
          window.open("/" + node.data.href);
          break;
        case "edit":
          window.location.href = "/edit/" + node.data.href;
          break;
        case "rename":
          commands.renameFile(node, action, options);
          break;
        case "cut":
          commands.cut(node, action, options);
          break;
        case "new":
          commands.new_page(node, action, options);
          break;
        case "delete":
          if (node.isFolder())
            commands.delete_folder(node, action, options);
          else
            commands.delete_page(node, action, options);
          break;
        default:
          console.log("not implemented");
          break;
      }
    }
  },
});
let tree = $.ui.fancytree.getTree();

$(".fancytree-container").addClass("fancytree-connectors");

if (UML_SRV === "http://www.plantuml.com/plantuml/png" && sessionStorage.Alert !== 'Confirmed') {
  alert("Warning using: " + UML_SRV + "\nConsider changing it or remove this alert from viewer.js");
  sessionStorage.Alert = "Confirmed";
}
// window.jQuery = prevJ;
// window.$ = prevJ;

function filterTree(control, e) {
  let n,
    tree = $.ui.fancytree.getTree(),
    opts = {},
    filterFunc = tree.filterNodes,
    match = control.val();

  match = match.replace(/ /g, ".*");
  opts.mode = "hide";
  opts.autoExpand = true;
  opts.hideExpandedCounter = false;
  opts.counter = true;
  opts.fuzzy = false;
  opts.nodata = false;

  if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
    $("button#btnResetSearch").click();
    return;
  }
  // n = filterFunc.call(tree, match, opts);
  n = filterFunc.call(tree, function (node) {
    if (node.data.href.startsWith("img/"))
      return false;
    return new RegExp(match, "i").test(node.data.href);
  }, opts);
  $("button#btnResetSearch").attr("disabled", false);
  $("span#matches").text("(" + n + " matches)");
}

$("input[name=treeFilter]").keyup(function (e) {
  filterTree($(this), e);
}).focus();

$("button#btnResetSearch").click(function (e) {
  $("#treeFilter").val("");
  $("span#matches").text("");
  tree.clearFilter();
}).attr("disabled", true);

function init() {
  tree.options.filter['hideExpandedCounter'] = false;

  // Load filter settings
  let qData = localStorage.getItem('filter');
  if (qData) {
    qData = JSON.parse(qData);
    let diffSec = (Date.now() - qData.time) / 1000;
    if (diffSec < 60) {
      let filterControl = $("#treeFilter");
      filterControl.val(qData.query);
      filterTree(filterControl, null);
      scrollToNode(activeNode);
    }
  }
  $('body').removeClass('fade-out');
}

require('./global-shortcut');
init();
