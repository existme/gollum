var currentJ;
const $ = require('jquery');
module.exports = {
  setJQuery: function (jq) {
    currentJ = jq;
  },
  initContextMenu: function (tree, selector, menu, actions) {
    tree.$container.on("mousedown.contextMenu", function (event) {
      var node = currentJ.ui.fancytree.getNode(event);

      if (node) {
        currentJ.contextMenu("destroy", "." + selector);

        node.setFocus(true);
        node.setActive(true);

        currentJ.contextMenu({
          selector: "." + selector,
          events: {
            show: function (options) {
              options.prevKeyboard = tree.options.keyboard;
              tree.options.keyboard = false;
              var node = $.ui.fancytree.getNode(options.$trigger);
              // options.items.delete.disabled = node.isFolder();
              options.items.openn.disabled = node.isFolder();
              // options.items.new.disabled = !node.isFolder();
              // options.items.rename.visible = !node.isFolder();
              options.items.edit.disabled = node.isFolder();
            },
            hide: function (options) {
              tree.options.keyboard = options.prevKeyboard;
              node.setFocus(true);
            }
          },
          build: function ($trigger, e) {
            node = currentJ.ui.fancytree.getNode($trigger);

            var menuItems = {};
            if (currentJ.isFunction(menu)) {
              menuItems = menu(node);
            } else if (currentJ.isPlainObject(menu)) {
              menuItems = menu;
            }

            return {
              callback: function (action, options) {
                if (currentJ.isFunction(actions)) {
                  actions(node, action, options);
                } else if (currentJ.isPlainObject(actions)) {
                  if (actions.hasOwnProperty(action) && currentJ.isFunction(actions[action])) {
                    actions[action](node, options);
                  }
                }
              },
              items: menuItems
            };
          }
        });
      }
    });
  }
};