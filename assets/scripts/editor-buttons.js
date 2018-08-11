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

    this.toolbar.addButton({
      name: 'Mode',
      className: 'fas fa-stamp',
      event: 'evtTemplate',
      tooltip: '     Insert a template',
      $el: $('<div class="editor-button" style="color:#00c132"><i class="fas fa-stamp"></i></div>')
    }, 1);

    const cntCodeBlock = [
      'Keyboard shortcuts:',
      '----------------------------------------',
      'CTRL+s                   Strike',
      'CTRL+b                   Bold',
      'CTRL+q                   BlockQuote',
      'CTRL+Shift+p        CodeBlock',
      'CTRL+Shift+c        Code',
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