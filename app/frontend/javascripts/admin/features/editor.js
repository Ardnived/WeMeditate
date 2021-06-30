import EditorJS from '@editorjs/editorjs'
import { afterPendingUploads, hasPendingUploads } from './uploader'
import ParagraphTool from '../editor-blocks/paragraph-tool'
import ListTool from '../editor-blocks/list-tool'
import TextboxTool from '../editor-blocks/textbox-tool'
import ActionTool from '../editor-blocks/action-tool'
import MediaTool from '../editor-blocks/media-tool'
import WhitespaceTool from '../editor-blocks/whitespace-tool'
import LayoutTool from '../editor-blocks/layout-tool'
import CatalogTool from '../editor-blocks/catalog-tool'
import LegacyVimeoTool from '../editor-blocks/legacy/vimeo-tool'

/** Content Editor
 * We use the editorjs (https://editorjs.io) to provide a block-based content editor for our CMS.
 * This is a fairly complex system which uses all the files in the 'cdx-editor' subfolder.
 */

let form, editorInstance, editorInput

const editorParameters = {
  autofocus: true,
  placeholder: 'Let`s write an awesome story!',
  tools: {
    paragraph: {
      class: ParagraphTool,
      inlineToolbar: true,
    },
    list: {
      class: ListTool,
      inlineToolbar: true,
    },
    media: MediaTool,
    action: ActionTool,
    textbox: TextboxTool,
    layout: LayoutTool,
    catalog: CatalogTool,
    whitespace: WhitespaceTool,
    vimeo: LegacyVimeoTool,
  },
  defaultBlock: 'paragraph',
}

export default function load() {
  console.log('loading Editor.js') // eslint-disable-line no-console
  form = document.getElementById('editor-form')

  let contentEditor = document.getElementById('content-editor')

  // Only intialize if the content editor actually exists on this page.
  if (form && contentEditor) {
    //SplashEditor.load()

    form.onsubmit = onSubmit
    editorInput = form.querySelector('#content-input')

    if (contentEditor.dataset.content) {
      editorParameters.data = processDataForLoad(contentEditor.dataset.content)
    }

    editorParameters.holder = contentEditor

    // Initialize the CodeX Editor (aka EditorJS)
    editorInstance = new EditorJS(editorParameters)
  }
}

// Returns the block which currently has focus in the editor.
export function getCurrentEditorBlock() {
  return editorInstance.blocks.getBlockByIndex(editorInstance.blocks.getCurrentBlockIndex())
}

export function setContent(jsonData) {
  editorInstance.render(jsonData)
}

function onSubmit(event) {
  if (hasPendingUploads()) {
    afterPendingUploads(() => form.submit())
    event.stopPropagation()
    event.preventDefault()
    return false
  } else {
    // Retrieve the editor data, then store it in the input before the editor form is submitted.
    editorInstance.save().then(outputData => {
      console.log('Article data: ', outputData) // eslint-disable-line no-console
      editorInput.value = processDataForSave(outputData)
    }).catch((error) => {
      console.error('Editor saving failed: ', error) // eslint-disable-line no-console
      event.preventDefault()
    })
  }
}

// Do any extra processing on the JSON data which is given to us by the editor
function processDataForSave(data) {
  /*
  if (SplashEditor.isActive) {
    // If this page has a splash editor, then we need to add that data to the editor data before it gets saved.
    data.blocks.unshift(SplashEditor.getData())
  }
  */

  // Consolidate all the media file ids for easy reference
  let mediaFiles = []
  for (let index = 0; index < data.length; index++) {
    const block = data[index]
    if (block.data.mediaFiles) mediaFiles = mediaFiles.concat(block.data.mediaFiles)
    delete block.data.mediaFiles
  }

  data.mediaFiles = mediaFiles
  return JSON.stringify(data)
}

// Do any extra processing on the JSON data before we load it into the editor
function processDataForLoad(data) {
  data = JSON.parse(data)

  /*
  if (data.blocks && data.blocks.length > 0 && data.blocks[0].type === 'splash') {
    // Remove the splash data before sending it to editorjs
    const splashData = data.blocks.shift()
    SplashEditor.setData(splashData)
  }
  */

  return data
}