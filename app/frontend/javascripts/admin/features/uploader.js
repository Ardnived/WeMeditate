import $ from 'jquery'
import { make } from '../util'
import { translate } from '../../i18n'

let uploads = {}
let pendingUploads = 0
let uploadEndpoint
let loaderElement
let listElement
let submitButton
let modal

export default function load() {
  console.log('loading Uploader.js') // eslint-disable-line no-console

  const uploaderContainer = document.getElementById('uploader')
  if (uploaderContainer) {
    uploadEndpoint = uploaderContainer.dataset.endpoint
    modal = document.getElementById('uploader-modal')
    loaderElement = document.getElementById('uploader-loader')
    submitButton = document.getElementById('uploader-submit')
    listElement = document.getElementById('uploader-list')
    listElement.innerHTML = null
  }
}

export function hasPendingUploads() {
  return pendingUploads > 0
}

export function afterPendingUploads(onCompletion) {
  // TODO: This onApprove callback doesn't work.
  $(modal).modal({ onApprove: () => onCompletion }).modal('show')
}

// This sends a file to our server's upload endpoint
export function uploadFile(file, success, failure) {
  addUpload(file)

  const data = new FormData()
  data.append('file', file)

  $.ajax({
    url: uploadEndpoint,
    type: 'POST',
    processData: false,
    contentType: false,
    dataType: 'json',
    data: data,
    success: function(result) {
      updateUpload(file.name, 'success')
      success(result)
    },
    error: function(result) {
      let error = result.responseJSON.errors[0]
      error = error.split(' Original Error: ')[0]
      updateUpload(file.name, 'error', error)
      failure(result)
    },
  })
}

function addUpload(file) {
  adjustPendingUploads(+1)
  uploads[file.name] = {
    status: 'pending',
    file: file
  }

  listElement.appendChild(buildUploadItem(uploads[file.name]))
}

function updateUpload(name, status, message = null) {
  adjustPendingUploads(-1)
  uploads[name].status = status
  uploads[name].message = message
  const item = listElement.querySelector(`.item[data-file="${name}"]`)
  listElement.replaceChild(buildUploadItem(uploads[name]), item)
}

function adjustPendingUploads(adjustment) {
  pendingUploads += adjustment

  if (pendingUploads > 0) {
    loaderElement.querySelector('span').innerText = translate('uploader.waiting', { count: pendingUploads })
  }

  submitButton.classList.toggle('disabled', pendingUploads > 0)
  $(loaderElement).toggle(pendingUploads > 0)
}

function buildUploadItem(upload) {
  const item = make('div', 'item', { data: { file: upload.file.name }})

  switch (upload.status) {
  case 'success':
    make('i', ['green', 'check', 'circle', 'icon'], {}, item)
    break
  case 'error':
    make('i', ['red', 'times', 'circle', 'icon'], {}, item)
    break
  default:
    make('i', ['fitted', 'sync', 'loading', 'icon'], {}, item)
    break
  }

  const content = make('div', 'content', {}, item)
  make('div', 'header', { innerText: upload.file.name }, content)

  if (upload.message) {
    make('div', 'description', { innerText: upload.message }, content)
  }

  return item
}

