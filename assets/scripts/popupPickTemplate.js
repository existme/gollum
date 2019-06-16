const Editor = require('tui-editor');
const $ = require('jquery');
const common = require('./common');
const extensionName = 'templatePicker';

function templatePickerExtension(editor) {
  initUI(editor);
}

function initUI(editor) {
  const toolbar = editor.getUI().getToolbar();
  editor.eventManager.addEventType('templatePicked');
  editor.eventManager.addEventType('evtTemplate');

  toolbar.addButton({
    name: extensionName,
    className: 'fas fa-feather-alt font-button',
    event: 'evtTemplate',
    tooltip: '<b>Insert a template</b><br><kbd>Ctrl</kbd>+<kbd>.</kbd>',
    $el: $('<div class="editor-button"><i class="fas fa-feather-alt font-button"></i></div>')
  }, 3);
  const buttonIndex = toolbar.indexOfItem(extensionName);
  const {$el: $button} = toolbar.getItem(buttonIndex);

  const $templateContainer = $('<div id="template-selector-container"><select id="template-selector" size="10" tabindex="1">\n' +
    '  <option value="codeblock" selected>Code Block</option>\n' +
    '  <option value="uml">UML Block</option>\n' +
    '  <option value="sh">Bash Block</option>\n' +
    '  <option value="java">Java Block</option>\n' +
    '  <option value="js">JavaScript Block</option>\n' +
    '  <option value="json">json Block</option>\n' +
    '  <option value="python">Python Block</option>\n' +
    '  <option value="picture">Picture Template</option>\n' +
    '  <option value="titlefont1">Title Font 1: \'Grudge BRK\'</option>\n' +
    '  <option value="titlefont2">Title Font 2: \'Hillock BRK\'</option>\n' +
    '  <option value="titlefont3">Title Font 3: \'DirtyBakersDozen\'</option>\n' +
    '  <option value="link">Link Template</option>\n' +
    '  <option value="ref">Reference Template</option>\n' +
    '  <option value="date">Date</option>\n' +
    '  <option value="author">Author Signiture</option>\n' +
    '</select></div>');

  const popup = editor.getUI().createPopup({
    header: false,
    title: true,
    content: $templateContainer,
    className: 'tui-popup-color',
    $target: editor.getUI().getToolbar().$el,
    css: {
      'width': 'auto',
      'position': 'absolute'
    }
  });

  editor.eventManager.listen('focus', () => {
    popup.hide();
  });

  editor.eventManager.listen('closeAllPopup', () => {
    popup.hide();
  });

  let listBox = popup.$el.find('#template-selector');

  editor.eventManager.listen('evtTemplate', () => {
    // set the x,y offset of the popup
    const {offsetTop, offsetLeft} = $button.get(0);
    popup.$el.css({top: offsetTop + $button.outerHeight(), left: offsetLeft});
    editor.eventManager.emit('closeAllPopup');
    popup.show();
    listBox.focus();
  });

  function handleSelect() {
    let text;
    let lMove = 0, cStart = 0, cEnd = 0;
    let val = listBox.val();
    let cursor = common.editorGetCursor(editor);

    switch (val) {
      case "author":
        text = `Written by: _${author}_ `;
        break;
      case "date":
        let date = common.getDate(new Date());
        text = `${date}`;
        cStart = -text.length;
        break;
      case "codeblock":
        val = "";
      case "uml":
      case "sh":
      case "json":
      case "js":
      case "python":
      case "java":
        let selection = common.editorGetSelection(editor);
        text = "``` " + val + "\n" +
          selection +
          " ".repeat(cursor.ch) + "```\n";
        lMove = -2;
        break;
      case "titlefont1":
      case "titlefont2":
      case "titlefont3":
      case "titlefont_all":
        let num = val.charAt(val.length - 1);
        let textToChangeFont = common.editorGetSelection(editor, true).trim();
        text = `_${textToChangeFont}_{.f${num}}`;
        cStart = -textToChangeFont.length - 6;
        cEnd = -6;
        break;
      case "picture":
        text = "![Title](/img/pic.png#3dt)";
        cStart = -12;
        cEnd = -5;
        break;
      case "link":
        text = "[Title](/cat/page)";
        cStart = -10;
        cEnd = -1;
        break;
      default:
        text = `<< ${val} - not implemented >>`;
    }
    common.editorReplace(editor, text, lMove, cStart, cEnd);
    popup.hide();
  }

  popup.$el.keydown(function (e) {
    if (e.which === 13) {
      e.preventDefault();
      handleSelect();
    } else if (e.which === 27) {
      e.preventDefault();
      popup.hide();
      editor.focus();
    }
  });

  listBox.on('click', () => {
    handleSelect();
  });
}

Editor.defineExtension(extensionName, templatePickerExtension);
export default templatePickerExtension;