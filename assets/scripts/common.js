const service = {
  getDate: function (date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1; //January is 0!

    let yyyy = date.getFullYear();

    if (dd < 10)  dd = '0' + dd;
    if (mm < 10)  mm = '0' + mm;

    return yyyy + '/' + mm + '/' + dd;
  },
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
  removeFirstLastPathComponent: function (url) {
    var arr = url.split('/');
    arr.splice(1, 1);  // Remove first component
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

  editorReplace: function (editor, text, lMove, cStart, cEnd) {
    const mde = editor.getCurrentModeEditor();
    const cm = mde.getEditor();
    if (!editor.isWysiwygMode()) {
      // Markdown mode
      const doc = cm.getDoc();
      const range = mde.getCurrentRange();

      let from = {
        line: range.from.line,
        ch: range.from.ch
      };

      let to = {
        line: range.to.line,
        ch: range.to.ch
      };
      doc.replaceRange(text, from, to);
      const cursor = doc.getCursor();
      doc.setCursor(cursor.line + lMove, cursor.ch + cStart);
      from = {
        line: cursor.line + lMove,
        ch: cursor.ch + cStart
      };
      to = {
        line: cursor.line + lMove,
        ch: cursor.ch + cEnd
      };
      doc.setSelection(from, to);
    }
    else {
      // wysiwyg mode
      const range = cm.getSelection().cloneRange();
      // let attr = `${CODEBLOCK_ATTR_NAME} class = "${CODEBLOCK_CLASS_PREFIX}${codeBlockID}"`;
      // if (type) {
      //   attr += ` data-language="${type}"`;
      // }
      // const codeBlockBody = getCodeBlockBody(range, wwe);
      // const link = cm.createElement('A', {href: url});
      // $(link).text(linkText);
      // cm.insertElement(link);
      // cm.insertHTML(text);
      cm.insertPlainText(text, false);

      // focusToFirstCode(wwe.get$Body().find(`.${CODEBLOCK_CLASS_PREFIX}${codeBlockID}`), wwe);
    }
    cm.focus();
  }
};

module.exports = service;
