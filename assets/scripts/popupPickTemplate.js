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
    className: 'tui-template',
    event: 'evtTemplate',
    tooltip: '     Insert a template',
    $el: $('<div class="editor-button" style="color:#00c132"><i class="fas fa-stamp"></i></div>')
  }, 3);
  const buttonIndex = toolbar.indexOfItem(extensionName);
  const {$el: $button} = toolbar.getItem(buttonIndex);

  const $templateContainer = $('<div id="template-selector-container"><select id="template-selector" size="10" tabindex="1">\n' +
    '  <option value="codeblock" selected>Code Block</option>\n' +
    '  <option value="uml">UML Block</option>\n' +
    '  <option value="sh">Bash Block</option>\n' +
    '  <option value="java">Java Block</option>\n' +
    '  <option value="json">json Block</option>\n' +
    '  <option value="picture">Picture Template</option>\n' +
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

  function handleSelect(){
    let text;
    let lMove = 0, cStart = 0, cEnd = 0;
    switch (listBox.val()) {
      case "author":
        text = ` _Not Implemented yet_ `;
        break;
      case "uml":
      case "sh":
      case "json":
      case "java":
        text = "``` " + listBox.val() + "\n" +
          "\n" +
          "```\n";
        lMove = -2;
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
        text = `<< ${listBox.val()} - not implemented >>`;
    }
    common.editorReplace(editor, text, lMove, cStart, cEnd);
    popup.hide();
    // alert(listBox.val());
  };

  listBox.keypress(function (e) {
    if(e.which===13){
      e.preventDefault();
      handleSelect();
      // alert("reza");
    }
  });

  listBox.on('click', () => {
    handleSelect();
  });
}

Editor.defineExtension(extensionName, templatePickerExtension);
export default templatePickerExtension;