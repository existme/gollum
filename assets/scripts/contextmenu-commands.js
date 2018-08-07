const common = require('./common');
var previouseCut;

const commands = {
  renameFolder: function (node, action, options) {
    var dest = common.getParentPath(node);
    destSpan = dest.replace(/\//g, "<span class='s-sep'>\/</span>");
    var title = node.title;
    jq172.GollumDialog.init({
      title: 'Rename Folder',
      fields: [
        {
          id: 'name',
          name: 'Current Name',
          type: 'text',
          defaultValue: title,
          context: 'Parent folder location: <br> <code class="page-address">' + destSpan + '</code>',
        }
      ],
      OK: function (res) {
        // var name = 'New Page';
        if (res['name']) {
          name = res['name'];
        }
        let renameFrom = dest + title;
        let renameTo = common.combineRootPath(dest, name);
        var currentUrl = window.location.href;
        common.post('/rcc/renameFolder?from=' + renameFrom + '&to=' + renameTo + '&current=' + currentUrl, {
          rename: renameTo,
          message: "Renaming " + renameFrom + " to " + renameTo
        });
      }
    });
  },
  renameFile: function (node, action, options) {
    if (node.isFolder())
      return commands.renameFolder(node, action, options);

    var dest = common.getParentPath(node);
    destSpan = dest.replace(/\//g, "<span class='s-sep'>\/</span>");

    var title = node.title; // node.title.split('.').slice(0, -1).join('.') for getting it without extention
    jq172.GollumDialog.init({
      title: 'Rename page',
      fields: [
        {
          id: 'name',
          name: 'Current Name',
          type: 'text',
          defaultValue: title,
          context: 'Folder location: <br> <code class="page-address">' + destSpan + '</code>',
        }
      ],
      OK: function (res) {
        var name = 'New Page';
        if (res['name']) {
          name = res['name'];
        }
        let renameFrom = dest + title;
        let renameTo = common.combineRootPath(dest, name);
        var currentUrl = window.location.href;
        common.post('/rcc/rename-file?from=' + renameFrom + '&to=' + renameTo + '&current=' + currentUrl, {});
      }
    });
  },

  new_page: function (node, action, options) {
    var dest = "/" + node.data.href;
    destSpan = dest.replace(/\//g, "<span class='s-sep'>\/</span>");
    var path = dest;
    jq172.GollumDialog.init({
      title: 'New page',
      fields: [
        {
          id: 'name',
          name: 'Page Name',
          type: 'text',
          defaultValue: 'my-new-page',
          context: 'Create a new page at: <br> <code class="page-address">' + path + '</code>',
          action: baseUrl + node.data.href
        }
      ],
      OK: function (res) {
        var name = 'New Page';
        if (res['name']) {
          name = res['name'];
        }
        var name_encoded = [];
        var name_parts = abspath(node.data.href, name).join('/').split('/');
        // Split and encode each component individually.
        for (var i = 0; i < name_parts.length; i++) {
          name_encoded.push(encodeURIComponent(name_parts[i]));
        }

        window.location = baseUrl + name_encoded.join('/');
      }
    });
  },

  delete_page: function (node, action, options) {
    var dest = common.getParentPath(node);
    destSpan = dest.replace(/\//g, "<span class='s-sep'>\/</span>");

    var title = node.title;
    var path = window.location.origin + destSpan + title;
    jq172.GollumDialog.init({
      title: '<i class="fas fa-trash-alt"></i>&nbsp;-&nbsp;Delete page</h4>Are you sure you want to delete this page? <br><br> <code class="page-address">' + path + '</code>',
      OK: function (res) {
        // var loc = baseUrl + '/delete/' + pageFullPath;
        // window.location = loc;
        let fileToDelete = dest + title;
        common.post('/rcc/delete-file?file=' + fileToDelete + '&current=' + window.location.origin, {});
      }
    });
  },

  delete_folder: function (node, action, options) {
    var dest = common.getParentPath(node);
    destSpan = dest.replace(/\//g, "<span class='s-sep'>\/</span>");
    var path = window.location.origin + destSpan + node.title;
    jq172.GollumDialog.init({
      title: '<i class="fas fa-trash-alt"></i>&nbsp;-&nbsp;Delete Folder!!&nbsp;&nbsp;&nbsp;<i class="fas fa-folder-open" style="color:red;"></i></h4>Are you sure you want to delete this folder? <br><br> <code class="page-address">' + path + '</code>',
      OK: function (res) {
        var folderToDelete = node.data.href;
        common.post('/rcc/delete?folder=' + folderToDelete + '&current=' + window.location.origin, {});
      }
    });
  },

  cut: function (node, action, options) {
    console.log(node.span.classList);
    node.span.children[2].classList.toggle("fancytree-cut")
    console.log("cut");
    if (previouseCut != null) {
      previouseCut.span.children[2].classList.remove("fancytree-cut")
    }
    previouseCut = node;
  },
};
module.exports = commands;