const commands = require('./editor-commands');

const editorButtonService = {
  editor: null,
  toolbar: null,

  init: function (editor) {
    this.editor = editor;
    this.toolbar = this.editor.getUI().getToolbar();

    this.toolbar.addButton({
      name: 'Help',
      className: 'fab fa-info-circle',
      event: 'evtHelp',
      tooltip: '     Help',
      $el: $('<div class="editor-button" style="color:navy"><i class="fa fa-info-circle"></i></div>')
    }, 1);

    this.toolbar.addButton({
      name: 'Mode',
      className: 'fa fa-modx',
      event: 'evtMode',
      tooltip: '     Toggle Preview Style',
      $el: $('<div class="editor-button" style="color:#ffc132"><i class="fa fa-clone"></i></div>')
    }, 1);


    const cntCodeBlock = [
      'Keyboard shortcuts:',
      '===============================================',
      'CTRL+S ___________________ Quick Save',
      'CTRL+Q ___________________ Quit to view mode',
      'CTRL+. ____________________ Insert template dialog',
      'CTRL+SPACE ______________ Toggle WYSIWYG/Markdown',
      'CTRL+B ___________________ Bold',
      'CTRL+D ___________________ Duplicate line/selection',
      'CTRL+Shift+P ______________ CodeBlock',
      'CTRL+Shift+C ______________ Code',
    ].join('\n');

    this.editor.eventManager.addEventType('evtHelp');
    this.editor.eventManager.addEventType('evtMode');
    this.editor.eventManager.listen('evtHelp', () => {
      alert(cntCodeBlock)
    });
    this.editor.eventManager.listen('evtMode', () => {
      editorButtonService.togglePreviewStyle();
    });

    editorButtonService.setStoredPreviewStyle();
    editor.commandManager.addCommand(commands.insertTemplate);
    editor.commandManager.addCommand(commands.quickSave);
    editor.commandManager.addCommand(commands.duplicate);
    editor.commandManager.addCommand(commands.quit);
    // editor.wwEditor.addKeyEventHandler(['CTRL+D','META+D'],commands.duplicate);
  },
  togglePreviewStyle: function () {
    let mode = this.editor.getCurrentPreviewStyle();
    console.log(mode);
    if (mode === 'vertical') {
      mode = 'tab';
    } else {
      mode = 'vertical';
    }
    localStorage.setItem('previewStyle', mode);
    this.editor.changePreviewStyle(mode)
  },

  setStoredPreviewStyle: function () {
    let mode = localStorage.getItem('previewStyle');
    if (mode === 'vertical' || mode === 'tab') {
      this.editor.changePreviewStyle(mode);
    }
  }

};

module.exports = editorButtonService;