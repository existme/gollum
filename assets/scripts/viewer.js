import 'jquery.fancytree/dist/skin-win8/ui.fancytree.min.css'

let prevJ = window.jQuery;
const $ = require('jquery');
var currentJ = $.noConflict(true);
window.jQuery = currentJ;
window.$ = currentJ;

const fancytree = require('jquery.fancytree');

currentJ.getScript("//cdn.jsdelivr.net/npm/jquery-contextmenu@2.6.4/dist/jquery.contextMenu.min.js");
var tree_cm = require('./tree-contextmenu.js');
tree_cm.setJQuery(currentJ);
var commands = require('./contextmenu-commands.js');
console.log("fancytree.version", fancytree.version);
// (function (currentJ, document) {
//   "use strict";

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

// }(jQuery, document));

/**
 * Requires variable 'activeNode' to be set and contain the node which should be activated on load
 */
$("#tree").fancytree({
  extensions: ["contextMenu"],
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
    let t = $("#tree").fancytree("getTree");
    t.options.scrollParent = $('#wiki-sidebar');
    let n = t.getNodeByKey(activeNode);
    if (n != null) {
      n.setActive();
      n.selected = true;
      n.scrollIntoView(false);
    }
  },
  init: function () {

    // console.log("current node: ", n);
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

$(".fancytree-container").addClass("fancytree-connectors");

if (UML_SRV === "http://www.plantuml.com/plantuml/png" && sessionStorage.Alert !== 'Confirmed') {
  alert("Warning using: " + UML_SRV + "\nConsider changing it or remove this alert from viewer.js");
  sessionStorage.Alert = "Confirmed";
}
// window.jQuery = prevJ;
// window.$ = prevJ;
