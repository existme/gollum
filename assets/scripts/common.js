const service = {
  post: function (path, params, type = null) {

    var method = "post";
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    if (type != null) {
      form.setAttribute("enctype", type);
    }

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        if (key === 'file') {
          hiddenField.setAttribute("type", "file");
        } else {
          hiddenField.setAttribute("type", "hidden");
        }
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  },
  /***
   * Remove first and last path component from the url
   * this is mainly used for translating current editing page url to a destination in image folder
   *
   * - a/b/my-new-page -> /b
   *
   * @param url
   * @returns {string}
   */
  removeFirstLastPathComponent: function (url){
    var arr = url.split('/');
    arr.splice(1,1);  // Remove first component
    arr.pop();        // Remove last component
    return (arr.join('/'));
  },
  /***
   * Combines root path and the subPath together the result will always start with slash ex:
   * - ('','a/b') -> '/a/b'
   * - ('a','a/b') -> '/a/a/b'
   * - ('/a','a/b') -> '/a/a/b'
   * - ('/a/','a/b') -> '/a/a/b'
   * - ('/a/b','/c/d') -> '/c/d'
   * @param rootPath
   * @param subPath
   * @returns {string}
   */
  combineRootPath: function (rootPath, subPath) {
    var name_encoded = [];
    if (rootPath.startsWith('/')) {
      rootPath = rootPath.substr(1);
    }
    if (rootPath.endsWith('/')) {
      rootPath = rootPath.slice(0, -1);
    }
    var name_parts = abspath(rootPath, subPath).join('/').split('/');
    // Split and encode each component individually.
    for (var i = 0; i < name_parts.length; i++) {
      name_encoded.push(encodeURIComponent(name_parts[i]));
    }
    return name_encoded.join('/');
  },

  /***
   * Return parent path in a form that it starts and ends with slash
   * - [/]
   * - [/img/]
   * - [/a/b/c/]
   * @param node        A fancy tree node
   * @returns {string}
   */
  getParentPath: function (node) {
    var dest = "/";
    if (node.parent.data.href != undefined) {
      dest += node.parent.data.href + "/";
    }
    return dest;
  },
}
module.exports = service;
