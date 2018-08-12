const common = require('./common');
const TuiEditor = require('tui-editor');
const $ = require('jquery');

var timeout;
const customCommands = {
  runQuickSave: function () {
    let form = $("#gollum-editor-form")[0];
    let title = $("#gollum-editor-page-title")[0].value;
    let pagepath = $("#gollum-editor-page-path")[0].value;
    let mdtext = $('#mdContent')[0].value;
    let commitMessage = $("#gollum-editor-message-field")[0].value;

    let fd = new FormData();
    fd.append('path', pagepath);
    fd.append('page', title);
    fd.append('content', mdtext);
    fd.append('message', commitMessage + " (QuickSave)");


    $.ajax({
      type: 'POST',
      url: '/rcc/quicksave',
      data: fd,
      processData: false,
      contentType: false
    }).done(function (data) {
      let status = $("#gollum-editor-status");
      status.css({'display': 'inline'});
      status[0].innerHTML = "<i class=\"fas fa-save mini-icon\"></i> SAVED";
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        status[0].innerText = "";
        status.css({'display': 'none'});
      }, 2000);
    });
  },
  showTemplatePopup: function (editor) {
    editor.eventManager.emit('evtTemplate');
  },
  quit: TuiEditor.CommandManager.command(
    'global', {
      name: 'quit',
      keyMap: ['CTRL+Q', 'META+Q'],
      exec(mde) {
        window.location = $(".action-view-page")[0].href;
      }
    }
  ),
  quickSave: TuiEditor.CommandManager.command(
    'global', {
      name: 'quickSave',
      keyMap: ['CTRL+S', 'META+S'],
      exec(mde) {
        customCommands.runQuickSave();
      }
    }
  ),
  toggleWysiwyg: TuiEditor.CommandManager.command(
    'global', {
      name: 'toggleWysiwyg',
      keyMap: ['CTRL+SPACE', 'META+SPACE'],
      exec(mde) {
        // customCommands.runQuickSave();
        if(mde.isWysiwygMode()){
          mde.changeMode('markdown', false);
        }
        else {
          mde.changeMode('wysiwyg', false);
        }
      }
    }
  ),
  insertTemplate: TuiEditor.CommandManager.command(
    'global', {
      name: 'insertTemplate',
      keyMap: ['CTRL+.', 'META+.'],
      exec(mde) {
        customCommands.showTemplatePopup(mde);
      }
    }
  ),
  duplicate: TuiEditor.CommandManager.command(
    'markdown', { //wysiwyg
      name: 'duplicate',
      keyMap: ['CTRL+D', 'META+D'],
      exec(mde) {
        const cm = mde.getEditor();
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
        let text = cm.getSelection();
        const cursor = doc.getCursor();
        if (text === "") {
          // if nothing is selected, duplicate current line
          let line = doc.getLine(cursor.line);
          doc.setCursor(cursor.line, line.length);
          cm.replaceSelection('\n' + line);
          doc.setCursor(cursor.line + 1, cursor.ch);
        }
        else {
          // otherwise duplicate the selection
          doc.setCursor(cursor.line, cursor.ch);
          cm.replaceSelection(text);
        }
      }
    }
  ),
};

module.exports = customCommands;