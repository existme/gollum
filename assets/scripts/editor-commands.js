const common = require('./common');
const TuiEditor = require('tui-editor');
const $ = require('jquery');
let _editor = null;
var timeout;
const customCommands = {
  init: function (editor) {
    _editor = editor;

    $(window).keydown(function (e) {
      // Ctrl+enter to switch from markdown to preview
      window.shiftPressed = e.shiftKey;

      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        let active = editor.getUI()._markdownTab._$activeButton.text();
        if (active === "Preview") {
          $(".te-preview").removeAttr('tabindex');
          editor.getUI()._markdownTab.activate('Write');
          editor.eventManager.emit('changePreviewTabWrite');
          editor.focus();
        } else {

          editor.eventManager.emit('previewNeedsRefresh');
          editor.eventManager.emit('changePreviewTabPreview');
          editor.getUI()._markdownTab.activate('Preview');
          editor.eventManager.emit('scroll', {source: "markdown"});

          // tabindex is required for element to get the focus see https://stackoverflow.com/a/17042452/161312 !!!
          let preview = $(".te-preview");
          preview.attr('tabindex', -1);

          // get the visible part of preview
          preview = preview.filter(':visible').get(0);
          preview.focus();

          // do focus again after the queue is processed
          setTimeout(function () {
            preview.focus();
          });
        }
      }
      else if (e.key === "S" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        // for some reason Control+Shift+S is not captured by the command so we handle it here
        customCommands.savequit.exec(editor.getCurrentModeEditor());
        e.preventDefault();
      }
    });

    // Listen to drop event for handling documents other than images such as pdfs, zip files, and etc.
    editor.eventManager.listen('drop', ev => {
      const items = ev.data.dataTransfer && ev.data.dataTransfer.files;

      for (let file of items) {
        if (!common.endsWithAny(['.jpg','.jpeg', '.gif', '.tiff', '.bmp', '.png', '.svg'], file.name)) {
          console.log(file);
          let evData = ev.data;
          evData.preventDefault();
          evData.stopPropagation();
          evData.codemirrorIgnore = true;
          const blob = file.name ? file : file.getAsFile();

          editor.eventManager.emit('addImageBlobHook', blob, (docUrl, linkText) => {
            editor.eventManager.emit('command', 'AddLink', {
              url: docUrl,
              linkText: linkText || blob.name || file.type
            });
          }, file.type);

          return false;
        }
        return true;
      }
    });

  },
  runQuickSave: function (callback) {
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
      if (callback != null) callback();
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
  showGlyphPopup: function (editor) {
    editor.eventManager.emit('evtShowGlyphPicker');
  },
  togglePreviewStyle: TuiEditor.CommandManager.command(
    'markdown', {
      name: 'togglePreviewStyle',
      keyMap: ['ALT+`'],
      exec(mde) {
        const cm = _editor;
        let mode = cm.getCurrentPreviewStyle();
        console.log(mode);
        if (mode === 'vertical') {
          mode = 'tab';
        } else {
          mode = 'vertical';
        }
        localStorage.setItem('previewStyle', mode);
        cm.changePreviewStyle(mode)
      }
    }
  ),
  quit: TuiEditor.CommandManager.command(
    'global', {
      name: 'quit',
      keyMap: ['CTRL+Q', 'META+Q'],
      exec(mde) {
        let createBtn = $(".action-view-page")[0];
        if (createBtn)
          window.location = $(".action-view-page")[0].href;
        else
          window.location = window.location.origin;
      }
    }
  ),
  savequit: TuiEditor.CommandManager.command(
    'global', {
      name: 'savequit',
      keyMap: ['CTRL+SHIFT+S', 'META+SHIFT+S'],
      exec(mde) {
        $("#gollum-editor-submit").trigger("click");
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
  insertTemplate: TuiEditor.CommandManager.command(
    'global', {
      name: 'insertTemplate',
      keyMap: ['CTRL+.', 'META+.'],
      exec(mde) {
        customCommands.showTemplatePopup(mde);
      }
    }
  ),
  insertGlyph: TuiEditor.CommandManager.command(
    'global', {
      name: 'insertGlyph',
      keyMap: ['CTRL+,', 'META+,'],
      exec(mde) {
        customCommands.showGlyphPopup(mde);
      }
    }
  ),
  duplicate: TuiEditor.CommandManager.command(
    'global', { //wysiwyg
      name: 'duplicate',
      keyMap: ['CTRL+D', 'META+D'],
      exec(mde, wwRange) {
        if (mde.currentMode === 'wysiwyg') {
          const cm = mde.getCurrentModeEditor();
          console.log(cm);
        }
        else {
          const cm = mde.getCurrentModeEditor().getEditor();
          const doc = cm.getDoc();
          const range = mde.getRange();

          let from = {
            line: range.start.line,
            ch: range.start.ch
          };

          let to = {
            line: range.end.line,
            ch: range.end.ch
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
    }
  ),
};

module.exports = customCommands;