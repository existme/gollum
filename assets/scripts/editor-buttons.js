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
      className: 'fab fa-info-circle font-button',
      event: 'evtHelp',
      tooltip: '     Help',
      $el: $('<div class="editor-button"><i class="fa fa-info-circle font-button"></i></div>')
    }, 1);

    this.toolbar.addButton({
      name: 'Mode',
      className: 'fa fa-columns font-button',
      command: 'togglePreviewStyle',
      tooltip: makeTooltip('Toggle Preview Style','<kbd>Alt</kbd>+<kbd>`</kbd>'),
      $el: $('<div class="editor-button"><i class="fa fa-columns font-button"></i></div>')
    }, 1);


    const cntCodeBlock = [
      'Keyboard shortcuts:',
      '===============================================',
      'CTRL+S ___________________ Quick Save',
      'CTRL+Shift+S _____________ Save and Quit to view mode (chrome://extensions/shortcuts)',
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

    let el=this.toolbar._items.find(b => b._name === 'heading');
    el.$el.removeClass().addClass('fas fa-heading font-button');

    el = this.toolbar._items.find(b => b._name === 'bold');
    el._tooltip = makeTooltip('Bold','<kbd>Ctrl</kbd>+<kbd>b</kbd>');
    el.$el.removeClass().addClass('fas fa-bold font-button');

    el = this.toolbar._items.find(b => b._name === 'italic');
    el._tooltip = makeTooltip('Italic','<kbd>Ctrl</kbd>+<kbd>i</kbd>');
    el.$el.removeClass().addClass('fas fa-italic font-button');

    el = this.toolbar._items.find(b => b._name === 'colorSyntax');
    el.$el.removeClass().addClass('fas fa-brush font-button');

    el = this.toolbar._items.find(b => b._name === 'strike');
    el.$el.removeClass().addClass('fas fa-strikethrough font-button');

    el = this.toolbar._items.find(b => b._name === 'hr');
    el._tooltip = makeTooltip('Line','<kbd>Ctrl</kbd>+<kbd>l</kbd>');
    el.$el.removeClass().addClass('fas fa-ruler-horizontal font-button');

    el=this.toolbar._items.find(b => b._name === 'quote');
    el.$el.removeClass().addClass('fas fa-angle-double-right font-button');

    el=this.toolbar._items.find(b => b._name === 'ul');
    el._tooltip = makeTooltip('Unordered list','<kbd>Ctrl</kbd>+<kbd>u</kbd>');
    el.$el.removeClass().addClass('fas fa-list-ul font-button');

    el = this.toolbar._items.find(b => b._name === 'ol');
    el._tooltip = makeTooltip('Ordered list','<kbd>Ctrl</kbd>+<kbd>o</kbd>');
    el.$el.removeClass().addClass('fas fa-list-ol font-button');

    el = this.toolbar._items.find(b => b._name === 'task');
    el.$el.removeClass().addClass('fas fa-tasks font-button');

    el = this.toolbar._items.find(b => b._name === 'indent');
    el.$el.removeClass().addClass('fas fa-indent font-button');

    el = this.toolbar._items.find(b => b._name === 'outdent');
    el.$el.removeClass().addClass('fas fa-outdent font-button');

    el = this.toolbar._items.find(b => b._name === 'table');
    el.$el.removeClass().addClass('fas fa-table font-button');

    el = this.toolbar._items.find(b => b._name === 'image');
    el.$el.removeClass().addClass('fas fa-image font-button');

    el = this.toolbar._items.find(b => b._name === 'link');
    el.$el.removeClass().addClass('fas fa-link font-button');

    el = this.toolbar._items.find(b => b._name === 'code');
    el._tooltip = makeTooltip('Inline code','<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>c</kbd>');
    el.$el.removeClass().addClass('fas fa-code font-button');

    el = this.toolbar._items.find(b => b._name === 'codeblock');
    el._tooltip = makeTooltip('Insert codeBlock','<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>p</kbd>');
    el.$el.removeClass().addClass('fas fa-keyboard font-button');

    editor.commandManager.addCommand(commands.insertTemplate);
    editor.commandManager.addCommand(commands.quickSave);
    editor.commandManager.addCommand(commands.duplicate);
    editor.commandManager.addCommand(commands.togglePreviewStyle);
    editor.commandManager.addCommand(commands.quit);
    editor.commandManager.addCommand(commands.savequit);
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