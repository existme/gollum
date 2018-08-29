import templatePickerExtension from "./popupPickTemplate";

const Editor = require('tui-editor');
require("./popupPickTemplate");
const urlPaste = require("./popupUrlPaste");
require('tui-editor/dist/tui-editor-extColorSyntax');
require('tui-editor/dist/tui-editor-extScrollSync');
require('tui-editor/dist/tui-editor-extTable');
require('tui-editor/dist/tui-editor-extUML');

const common = require("./common");
let content = document.querySelector('#mdContent').value;
const rendererUrl = UML_SRV + "/";
const commands = require('./editor-commands');
const $ = require('jquery');

if (editMode === 'create') {
  const title = $("#gollum-editor-page-title").val();
  const mdc = $('#mdContent');
  content =
    `# ${title}\n` +
    `_Written by: ${author}_\n` +
    `# ${title}\n` +
    `\n` +
    `Start your content here...\n\n` +
    `\`\`\` sh\n` +
    `code placeholder\n` +
    `\`\`\`\n\n`+
    `* * *\n` +
    `Creation date: _${common.getDate(new Date())}_\n`;
  mdc.val(content);

}

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
        let filename = blob.name.replace(/ /g, '_');
        callback(uploadedImageFolder + '/' + filename, filename);
      });
    }
  },
  exts: [
    'chart',
    'mark',
    'colorSyntax',
    'templatePicker',
    'scrollSync',
    {
      'name': 'uml',
      'rendererURL': rendererUrl
    }
  ]
});

resizeEditor();

function resizeEditor() {
  let isCreateMode = window.location.toString().indexOf("/create/") > 0;
  let heightOfSibblings = 130 + (isCreateMode ? 90 : 0);
  $('#editSection').css('height', $(window).height() - heightOfSibblings);
}

let editButtons = require("./editor-buttons.js");
editButtons.init(editor);
console.log("Editor initialized");


$(window).resize(function () {
  resizeEditor();
});


/**
 * QuickSave implementation
 */
$("#gollum-editor-quicksave").click(function () {
  commands.runQuickSave();
});
commands.init(editor);

$(document).ready(function () {
  editor.focus();
  urlPaste.initUI(editor);
});