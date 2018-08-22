const commands = require('./editor-commands');

const editorButtonService = {
  editor: null,
  toolbar: null,

  init: function (editor) {
    this.editor = editor;
    this.toolbar = this.editor.getUI().getToolbar();

    function makeTooltip(title, shortcut) {
      return `<b>${title}</b><br>${shortcut}`;
    }

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
      command: 'togglePreviewStyle',
      tooltip: makeTooltip('Toggle Preview Style','<kbd>Alt</kbd>+<kbd>`</kbd>'),
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
      'ALT+` _____________________ Toggle preview style',
      'CTRL+Shift+P ______________ CodeBlock',
      'CTRL+Shift+C ______________ Code',
    ].join('\n');

    this.editor.eventManager.addEventType('evtHelp');
    this.editor.eventManager.listen('evtHelp', () => {
      alert(cntCodeBlock)
    });

    editorButtonService.setStoredPreviewStyle();

    this.toolbar._items.find(b => b._name === 'bold')._tooltip = makeTooltip('Bold','<kbd>Ctrl</kbd>+<kbd>b</kbd>');
    this.toolbar._items.find(b => b._name === 'italic')._tooltip = makeTooltip('Italic','<kbd>Ctrl</kbd>+<kbd>i</kbd>');
    this.toolbar._items.find(b => b._name === 'hr')._tooltip = makeTooltip('Line','<kbd>Ctrl</kbd>+<kbd>l</kbd>');
    this.toolbar._items.find(b => b._name === 'ul')._tooltip = makeTooltip('Unordered list','<kbd>Ctrl</kbd>+<kbd>u</kbd>');
    this.toolbar._items.find(b => b._name === 'ol')._tooltip = makeTooltip('Ordered list','<kbd>Ctrl</kbd>+<kbd>o</kbd>');
    this.toolbar._items.find(b => b._name === 'codeblock')._tooltip = makeTooltip('Insert codeBlock','<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>p</kbd>');
    this.toolbar._items.find(b => b._name === 'code')._tooltip = makeTooltip('Inline code','<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>c</kbd>');

    editor.commandManager.addCommand(commands.insertTemplate);
    editor.commandManager.addCommand(commands.quickSave);
    editor.commandManager.addCommand(commands.duplicate);
    editor.commandManager.addCommand(commands.togglePreviewStyle);
    editor.commandManager.addCommand(commands.quit);
    // editor.wwEditor.addKeyEventHandler(['CTRL+D','META+D'],commands.duplicate);
  },

  setStoredPreviewStyle: function () {
    let mode = localStorage.getItem('previewStyle');
    if (mode === 'vertical' || mode === 'tab') {
      this.editor.changePreviewStyle(mode);
    }
  }
};

module.exports = editorButtonService;