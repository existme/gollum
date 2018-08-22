const Editor = require('tui-editor');
const $ = require('jquery');
const common = require('./common');
const extensionName = 'extendedPaste';

const PasteEx = {
  vals: {
    editor: null,
    popUp: null,
    txtText: null,
    txtUrl: null,
    txtAbb: null,
    chkRef: null,
  },

  createPopup: function (editor) {
    const toolbar = editor.getUI()._toolbar;

    const buttonIndex = toolbar.indexOfItem('templatePicker');
    const {$el: $button} = toolbar.getItem(buttonIndex);

    const $templateContainer = $('<div id="paste-dialog-container">\n' +
      '<label for="linkText">Link text:</label>\n' +
      '<input type="text" id="pe-link-text" class="te-link-text-input" tabindex="1" spellcheck="false"/>\n' +
      '<label for="url">URL:</label>\n' +
      '<input type="text" id="pe-link-url" class="te-url-text-input" tabindex="2" spellcheck="false"/>\n' +
      '<label for="pe-ref-check">Reference:</label>' +
      '<input type="checkbox" id="pe-ref-check" checked title="User reference style?" tabindex="3"/>\n' +
      '<input type="text" id="pe-link-abb" class="te-url-text-input" tabindex="4" spellcheck="false"/>\n' +
      '<div class="te-button-section">' +
      '<button type="button" id="pe-btn-ok" class="te-ok-button" tabindex="5">OK</button>\n' +
      '<button type="button" id="pe-btn-cancel" class="te-close-button" tabindex="6">Cancel</button>\n' +
      '</div>' +
      '</div>');


    let popup = editor.getUI().createPopup({
      header: true,
      title: "Extended URL paste",
      content: $templateContainer,
      className: 'tui-popup-paste tui-editor-popup',
      $target: editor.getUI().$el,
      $button: $button,
      css: {
        'width': 'auto',
        'position': 'absolute'
      }
    });
    PasteEx.vals.popUp = popup;
    PasteEx.vals.button = $button;
    PasteEx.vals.txtText = popup.$el.find('#pe-link-text');
    PasteEx.vals.txtUrl = popup.$el.find('#pe-link-url');
    PasteEx.vals.txtAbb = popup.$el.find('#pe-link-abb');
    PasteEx.vals.chkRef = popup.$el.find('#pe-ref-check');
    popup.$el.find('#pe-btn-ok').click(PasteEx.onOk);
    popup.$el.find('#pe-btn-cancel').click(PasteEx.onCancel);

    const evtMgr = editor._ui._toolbar._eventManager;
    evtMgr.listen('focus', () => popup.hide());
    evtMgr.listen('closeAllPopup', () => popup.hide());
    $("#paste-dialog-container").get(0).addEventListener('keydown', PasteEx.onKeydown, true)
  },

  initUI: function (editor) {

    PasteEx.vals.editor = editor;
    PasteEx.createPopup(editor);
    document.addEventListener('paste', PasteEx.onPaste, true);
  },

  onKeydown: function (e) {
    if (e.key === 'Enter') {
      PasteEx.onOk();
      e.preventDefault();
      return false;
    }
    else if (e.key === 'Escape') {
      PasteEx.onCancel();
      e.preventDefault();
      return false;
    }
  },
  onOk: function (event) {
    const editor = PasteEx.vals.editor;
    const mde = editor.getCurrentModeEditor();
    const doc = mde.getEditor().getDoc();

    const title = PasteEx.vals.txtText.val();
    let url = PasteEx.vals.txtUrl.val();
    const abb = PasteEx.vals.txtAbb.val();
    const chkRef = PasteEx.vals.chkRef.get(0).checked;

    let text = null;
    let reftext = null;
    if(url.startsWith(window.origin)) {
      url = url.replace(window.origin, "");
    }
    if (!chkRef) {
      text = `[${title}](${url})`;
    }
    else {
      text = `[${title}][${abb}]`;
      reftext = `[${abb}]: ${url}`;
    }
    common.editorReplace(editor, text, 0, 0, 0);

    if (reftext) {
      const lines = editor.getMarkdown().split(/\r\n|\r|\n/);
      let to = {line: lines.length, ch: lines[lines.length - 1].length};
      doc.replaceRange(`\n${reftext}`, to, to);
    }

    localStorage.setItem('useReferencedLinks',chkRef);
    PasteEx.vals.editor.eventManager.emit('closeAllPopup');
    PasteEx.vals.popUp.hide();
    PasteEx.vals.editor.focus();
  },
  onCancel: function (event) {
    PasteEx.vals.editor.eventManager.emit('closeAllPopup');
    PasteEx.vals.popUp.hide();
    PasteEx.vals.editor.focus();
  },
  onPaste: function (event) {
    var clipText = event.clipboardData.getData('Text');
    if (clipText.startsWith('http')) {
      if (PasteEx.vals.editor.isWysiwygMode()) {
        console.log("Wysiwyg url paste is not implemented yet!");
        return true;
      }

      event.clipboardData.setData('', 'Text');
      event.preventDefault();
      $.ajax({
        type: 'POST',
        url: '/rcc/query-page?url=' + clipText,
        processData: false,
        contentType: false
      }).done(function (data) {
        data.url = clipText;
        PasteEx.showPopup(data);
        // console.log(data);
      });
      return false;
    }
  },

  showPopup: function (data) {
    const {editor, popUp, button} = PasteEx.vals;

    const {offsetTop, offsetLeft} = button.get(0);
    popUp.$el.css({top: offsetTop + button.outerHeight(), left: offsetLeft + 600});
    editor.eventManager.emit('closeAllPopup');
    popUp.show();
    PasteEx.vals.txtText.val(data.title);
    PasteEx.vals.txtText.select();
    PasteEx.vals.txtText.focus();
    PasteEx.vals.txtUrl.val(data.url);
    PasteEx.vals.txtAbb.val(data.abbrev);
    let isRefChecked = localStorage.getItem('useReferencedLinks');
    PasteEx.vals.chkRef.prop('checked', isRefChecked ? true : false);

  }
};

module.exports = PasteEx;