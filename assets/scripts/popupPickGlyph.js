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
  let selectedCell = null;
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
  let options = filterTable('');
  const $templateContainer = $(`</script><div id="glyph-form"><table id="glyph-selector" tabindex="1">${options}</table></div><table id="glyph-footer"><tbody><tr><td id="glyph-search"></td><td id="glyph-q"></td></tr></tbody></table>`);

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

  selectedCell = findSelectedCell();
  bindTableOnClick();

  function findSelectedCell(){
    return popup.$el.find('.selected').get()[0];
  }
  function dotheneedful(sibling) {
    if (sibling != null) {
      selectedCell.focus();
      selectedCell.classList.remove('selected');
      selectedCell.style.color = '';
      sibling.focus();
      sibling.classList.add('selected');
      selectedCell = sibling;
      selectedCell.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});

      hintq.html(selectedCell.getAttribute('title'));
    }
  }

  function rowUp() {
    if (selectedCell === undefined)
      return;
    let idx = selectedCell.cellIndex;
    let nextrow = selectedCell.parentElement.previousElementSibling;
    if (nextrow != null) {
      let sibling = nextrow.cells[idx];
      dotheneedful(sibling);
    }
  }

  function rowDown() {
    if (selectedCell === undefined)
      return;
    let idx = selectedCell.cellIndex;
    let nextrow = selectedCell.parentElement.nextElementSibling;
    if (nextrow != null) {
      let sibling = nextrow.cells[idx];
      dotheneedful(sibling);
    }

  }

  function filterTable(str) {
    let options = "<tr>";
    let row = 0;
    let col = 0;
    const maxCol = 20;
    const startX = 0;
    const startY = 0;
    let _style = "";
    let index = 0;

    for (let key in glyphArr) {
      index++;
      let obj = glyphArr[key];
      if (!obj.q.includes(str))
        continue;
      if (col === startX && row === startY) {
        _style = " class='selected'";
      } else {
        _style = "";
      }
      options += `<td${_style} title="${obj.q}" data=${index}><span>${obj.ch}</span><p>${index}</p></td>`;
      col++;
      if (col >= maxCol) {
        col = 0;
        row++;
        options += "</tr><tr>"
      }
    }
    if (options === "<tr>") {
      options += "<td> </td>";
    }
    return (`<tbody>${options}</tr></tbody>`);
  }

  function focusByIndex(index) {
    if (index == null)
      return;


    let res = popup.$el.find(`td[data=${index}]`);
    if (res.length === 0)
      return;
    selectedCell.classList.remove('selected');
    res.addClass('selected');
    res[0].scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});
    selectedCell = res[0];
  }

  function handleSearch(which) {
    let srch = search.text();

    switch (which) {
      case 46:  //  delete
        srch = "";
        break;
      case 8:   //  backspace
        srch = srch.slice(0, -1);
        break;
      default:
        srch += String.fromCharCode(which).toLowerCase();
        break;
    }


    let currentSelectedCell = popup.$el.find('.selected p');
    let currentIndex = currentSelectedCell.length !== 0 ? Number(currentSelectedCell.text()) : null;

    table.empty();
    table.html(filterTable(srch));
    search.text(srch,);
    table.focus();
    selectedCell = popup.$el.find('.selected').get()[0];
    if (selectedCell !== undefined) {
      selectedCell.focus();
      focusByIndex(currentIndex);
      hintq.html(selectedCell.getAttribute('title'));
    }
  }

  popup.$el.keydown(function (e) {
    let idx;
    let nextrow;
    let sibling;
    e = e || window.event;
    let code = e.keyCode;
    switch (true) {
      case (code === 33):
        // pageup
        rowUp();
        rowUp();
        rowUp();
        rowUp();
        rowUp();
        break;
      case code === 38:
        // up arrow
        rowUp();
        break;
      case code === 34:
        // page down
        rowDown();
        rowDown();
        rowDown();
        rowDown();
        rowDown();
        break;
      case code === 40:
        // down arrow
        rowDown();
        break;
      case code === 37:
        // left arrow
        if (selectedCell !== undefined) {
          sibling = selectedCell.previousElementSibling;
          dotheneedful(sibling);
        }
        break;
      case code === 39:
        // right arrow
        if (selectedCell !== undefined) {
          sibling = selectedCell.nextElementSibling;
          dotheneedful(sibling);
        }
        break;
      case code === 13:
        handleSelected();
        break;
      case code === 35: // do nothing for end
      case code === 36: // do nothing for home
        break;
      case code === 27:
        popup.hide();
        editor.focus();
        break;
      case (code >= 65 && code <= 90) || (code === 8 || code === 46):
        handleSearch(e.which);
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
  let hintq = popup.$el.find('#glyph-q');
  let search = popup.$el.find('#glyph-search');

  editor.eventManager.listen(showEvent, () => {
    // set the x,y offset of the popup
    const {offsetTop, offsetLeft} = $button.get(0);
    popup.$el.css({top: offsetTop + $button.outerHeight(), left: offsetLeft});
    editor.eventManager.emit('closeAllPopup');
    popup.show();
    table.focus();
  });

  function handleSelect(selectedCellChar) {
    if (selectedCellChar !== undefined) {
      common.editorReplace(editor, selectedCellChar.innerHTML, 0, 0, 0);
    }
    popup.hide();
    editor.focus();
  }

  function handleSelected() {
    let selectedChar = popup.$el.find('.selected span').get()[0];
    handleSelect(selectedChar);
  }

  function bindTableOnClick() {
    $('#glyph-selector').on('click', 'td', function (e) {
      selectedCell = findSelectedCell();
      if (selectedCell !== undefined) {
        selectedCell.classList.remove('selected');
      }
      e.currentTarget.classList.add('selected');
      handleSelected();
    });
  }

}

Editor.defineExtension(extensionName, glyphPickerExtension);
export default glyphPickerExtension;