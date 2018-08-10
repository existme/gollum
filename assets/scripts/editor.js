const Editor = require('tui-editor');
require('tui-editor/dist/tui-editor-extColorSyntax.min')
require('tui-editor/dist/tui-editor-extScrollSync.min')
require('tui-editor/dist/tui-editor-extTable.min')
require('tui-editor/dist/tui-editor-extUML.min')
const common = require("./common");

const content = document.querySelector('#mdContent').value;
const rendererUrl = UML_SRV + "/";

const editor = new Editor({
  el: document.querySelector('#editSection'),
  initialEditType: 'markdown',
  initialValue: content,
  previewStyle: 'vertical',
  minHeight: '600px',
  usageStatistics: false,
  events: {
    change: function () {
      document.querySelector('#mdContent').value = editor.getMarkdown();
    }
  },
  hooks: {
    addImageBlobHook: function (blob, callback) {

      var uploadedImageFolder = '/img' + common.removeFirstLastPathComponent(window.location.pathname);
      var decodedUploadedImageFolder = decodeURIComponent(uploadedImageFolder);
      var fd = new FormData();
      fd.append('data', blob);
      fd.append('upload_dest', uploadedImageFolder);
      $.ajax({
        type: 'POST',
        url: '/rcc/upload-file',
        data: fd,
        processData: false,
        contentType: false
      }).done(function (data) {
        console.log(data);
      });
      callback(uploadedImageFolder + '/' + blob.name, blob.name);
    }
  },
  exts: [
    'chart',
    'colorSyntax',
    'scrollSync',
    {
      'name': 'uml',
      'rendererURL': rendererUrl
    }
  ]
});
resizeEditor();
// $( window ).on( "load", function() {
//   resizeEditor();
// });
function resizeEditor() {
  let isCreateMode = window.location.toString().indexOf("/create/") > 0;
  let heightOfSibblings = 130 + (isCreateMode ? 90 : 0);
  $('#editSection').css('height', $(window).height() - heightOfSibblings);
}

$(window).resize(function () {
  resizeEditor();
});

const cntCodeBlock = [
  'Keyboard shortcuts:',
  '----------------------------------------',
  'CTRL+s                   Strike',
  'CTRL+b                   Bold',
  'CTRL+q                   BlockQuote',
  'CTRL+Shift+p        CodeBlock',
  'CTRL+Shift+c        Code',
].join('\n');

const toolbar = editor.getUI().getToolbar();

editor.eventManager.addEventType('evtHelp');
editor.eventManager.addEventType('evtMode');
editor.eventManager.listen('evtHelp', () => {
  alert(cntCodeBlock)
});


function togglePreviewStyle() {
  let mode = editor.getCurrentPreviewStyle();
  console.log(mode);
  if (mode === 'vertical') {
    mode = 'tab';
  } else {
    mode = 'vertical';
  }
  localStorage.setItem('previewStyle', mode);
  editor.changePreviewStyle(mode)
}

function setStoredPreviewStyle() {
  let mode = localStorage.getItem('previewStyle');
  if (mode === 'vertical' || mode === 'tab') {
    editor.changePreviewStyle(mode);
  }
}

editor.eventManager.listen('evtMode', () => {
  togglePreviewStyle();
});


toolbar.addButton({
  name: 'Help',
  className: 'fab fa-info-circle',
  event: 'evtHelp',
  tooltip: '     Help',
  $el: $('<div class="editor-button" style="color:navy"><i class="fa fa-info-circle"></i></div>')
}, 1);

toolbar.addButton({
  name: 'Mode',
  className: 'fa fa-modx',
  event: 'evtMode',
  tooltip: '     Toggle Preview Style',
  $el: $('<div class="editor-button" style="color:#ffc132"><i class="fa fa-clone"></i></div>')
}, 1);

setStoredPreviewStyle();

var timeout;
$("#gollum-editor-quicksave").click(function () {
  // alert("Quick Save not implemented yet!\n Use Save instead");
  let form = jq172("#gollum-editor-form")[0];
  let title = jq172("#gollum-editor-page-title")[0].value;
  let pagepath = jq172("#gollum-editor-page-path")[0].value;
  let mdtext = jq172('#mdContent')[0].value;
  let commitMessage = jq172("#gollum-editor-message-field")[0].value;

  let fd = new FormData();
  fd.append('path', pagepath);
  fd.append('page', title);
  fd.append('content', mdtext);
  fd.append('message', commitMessage + " (QuickSave)");


  jq172.ajax({
    type: 'POST',
    url: '/rcc/quicksave',
    data: fd,
    processData: false,
    contentType: false
  }).done(function (data) {
    let status = jq172("#gollum-editor-status");
    status.css({'display':'inline'});
    status[0].innerHTML="<i class=\"fas fa-save mini-icon\"></i> SAVED";
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      status[0].innerText="";
      status.css({'display':'none'});
    }, 2000);
  });

});