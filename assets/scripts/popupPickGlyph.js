const Editor = require('tui-editor');
const $ = require('jquery');
const common = require('./common');
const glyphArr = require('./glyphCodes').default;
const extensionName = 'popupPickGlyph';
const showEvent = "evtShowGlyphPicker";

function glyphPickerExtension(editor) {
  initUI(editor);
}



function initUI(editor) {
  let selectedCell=null;
  const toolbar = editor.getUI().getToolbar();
  editor.eventManager.addEventType('glyphPicked');
  editor.eventManager.addEventType(showEvent);

  toolbar.addButton({
    name: extensionName,
    className: 'fas fa-feather-alt font-button',
    event: showEvent,
    tooltip: '<b>Insert a glyph</b><br><kbd>Ctrl</kbd>+<kbd>,</kbd>',
    $el: $('<div class="editor-button"><i class="fas fa-chess font-button"></i></div>')
  }, 3);

  const buttonIndex = toolbar.indexOfItem(extensionName);
  const {$el: $button} = toolbar.getItem(buttonIndex);
  let options = "<tr>";
  let row = 0;
  let col = 0;
  const maxCol = 20;
  const startX = 0;
  const startY = 0;
  let _style = "";
  for (let key in glyphArr) {
    let obj = glyphArr[key];
    if (col === startX && row === startY) {
      _style = " class='selected'";
    } else {
      _style = "";
    }
    options += `<td${_style}>${obj.ch}</td>`;
    col++;

    if (col >= maxCol) {
      col = 0;
      row++;
      options += "</tr><tr>"
    }
  }

  options += "</tr>";
  const $templateContainer = $('</script><div id="glyph-form"><table id="glyph-selector" tabindex="1"><tbody>' +
    options +
    '</tbody></table></div>');

  const popup = editor.getUI().createPopup({
    header: false,
    title: true,
    content: $templateContainer,
    className: 'tui-popup-glyph',
    $target: editor.getUI().getToolbar().$el,
    css: {
      'width': 'auto',
      'position': 'absolute'
    }
  });

  selectedCell = popup.$el.find('.selected').get()[0];

  function dotheneedful(sibling) {
    if (sibling != null) {
      selectedCell.focus();
      selectedCell.classList.remove('selected');
      selectedCell.style.color = '';
      sibling.focus();
      sibling.classList.add('selected');
      selectedCell = sibling;
      selectedCell.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});
    }
  }
  function rowUp(){
    let idx = selectedCell.cellIndex;
    let nextrow = selectedCell.parentElement.previousElementSibling;
    if (nextrow != null) {
      let sibling = nextrow.cells[idx];
      dotheneedful(sibling);
    }
  }
  function rowDown(){
    let idx = selectedCell.cellIndex;
    let nextrow = selectedCell.parentElement.nextElementSibling;
    if (nextrow != null) {
      let sibling = nextrow.cells[idx];
      dotheneedful(sibling);
    }

  }
  popup.$el.keydown(function(e){
    let idx;
    let nextrow;
    let sibling;
    e = e || window.event;
    if (e.keyCode === 33){
      // pageup
      rowUp();
      rowUp();
      rowUp();
      rowUp();
      rowUp();
    } else if (e.keyCode === 38) {
      // up arrow
      rowUp()
    } else if (e.keyCode === 34){
      // page down
      rowDown();
      rowDown();
      rowDown();
      rowDown();
      rowDown();
    } else if (e.keyCode === 40) {
      // down arrow
      rowDown();
    } else if (e.keyCode === 37) {
      // left arrow
      sibling = selectedCell.previousElementSibling;
      dotheneedful(sibling);
    } else if (e.keyCode === 39) {
      // right arrow
      sibling = selectedCell.nextElementSibling;
      dotheneedful(sibling);
    } else if (e.which === 13) {
      handleSelect();
    } else if (e.which === 27) {
      popup.hide();
      editor.focus();
    }
    else{
      return;
    }
    e.preventDefault();
  });

  editor.eventManager.listen('focus', () => {
    popup.hide();
  });

  editor.eventManager.listen('closeAllPopup', () => {
    popup.hide();
  });

  let table = popup.$el.find('#glyph-selector');

  editor.eventManager.listen(showEvent, () => {
    // set the x,y offset of the popup
    const {offsetTop, offsetLeft} = $button.get(0);
    popup.$el.css({top: offsetTop + $button.outerHeight(), left: offsetLeft});
    editor.eventManager.emit('closeAllPopup');
    popup.show();
    table.focus();
  });

  function handleSelect() {
    selectedCell = popup.$el.find('.selected').get()[0];
    common.editorReplace(editor, selectedCell.innerHTML, 0, 0, 0);
    popup.hide();
    editor.focus();
  }

  table.on('click', () => {
    handleSelect();
  });
}

Editor.defineExtension(extensionName, glyphPickerExtension);
export default glyphPickerExtension;