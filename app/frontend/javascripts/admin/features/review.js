import $ from 'jquery'

/** REVIEW
 * Handles behaviours for the admin review page.
 */

let selectedId = null
let $detailsReview, detailsIframe
let $contentReview, contentIframe

export default function load() {
  console.log('loading Review.js') // eslint-disable-line no-console
  const form = document.getElementById('review-form')
  if (!form) return

  // Store a few elemennts from the page.
  // The review page will have two tabs, and two embedded iframes to show previews of the final content.
  // One for the page's archive preview (ie. 'details'), and one for the page itself (ie. 'content')
  $detailsReview = $('#details-review')
  detailsIframe = document.getElementById('details-iframe')
  $contentReview = $('#content-review')
  contentIframe = document.getElementById('content-iframe')

  // Setup zenscroll for the sidebar menu.
  //menuScroller = zenscroll.createScroller(document.getElementById('review-menu').firstChild, 1000, 50)

  // Set up evetns
  $(form).on('submit', _event => storeReviewData())
  $('.review-button').on('mouseenter', event => highlightBlock(event.currentTarget.dataset))
  $('.review-button:not(.disabled)').on('click', event => toggleApproval(event.currentTarget.dataset))

  if (detailsIframe) {
    // Add a callback to resize the details frame whenever it reloads
    detailsIframe.addEventListener('load', function() {
      this.style.height = (this.contentWindow.document.body.scrollHeight + 10) + 'px'
    })
  }
}

// Stores all the selected review actions in the review form's input field.
// This should be run just before the view page is submitted, to prepare the data to be sent to the server.
function storeReviewData() {
  const data = []
  $('.review-button').each(function(index, element) {
    const effect = element.classList.contains('approved') ? element.dataset.effect : 'nochange'
    data.push({ id: element.dataset.id, effect: effect })
  })

  $('#review-input').val(JSON.stringify({
    details: getApprovedDetailChanges(),
    content: data,
  }))
}

// Gets the changeset for all approved detail changes.
function getApprovedDetailChanges() {
  let result = []

  $('.review-button[data-context="details"]').each(function(index, element) {
    if (element.classList.contains('approved')) {
      result.push(element.dataset.id)
    }
  })

  return result
}

// The review page is made up of two contexts 'details' and 'content'
// This function allows you to switch the display between those two contexts.
function showContext(context) {
  const $from = (context == 'details') ? $contentReview : $detailsReview
  const $to = (context == 'details') ? $detailsReview : $contentReview
  if ($from.css('display') == 'none') {
    $to.fadeIn('fast')
  } else {
    $from.fadeOut('fast', () => $to.fadeIn('fast'))
  }
}

// Highlight any specified review block.
// Expected arguments:
//   context - the context that this block belongs to which should be shown
//   refresh - whether the details iframe should be highlighted as well
function highlightBlock(args) {
  showContext(args.context)

  if (selectedId) {
    $(`.review-block[data-id="${selectedId}"]`).removeClass('active')
    $(`.review-button[data-id="${selectedId}"]`).removeClass('active')
  }

  selectedId = args.id
  $(`.review-block[data-id="${args.id}"]`).addClass('active')
  $(`.review-button[data-id="${args.id}"]`).addClass('active')

  if (args.context == 'content') {
    postMessage('highlight', { id: args.id })
  } else if (args.context == 'details' && args.refresh == 'true') {
    if (detailsIframe) detailsIframe.classList.add('active')
  } else {
    if (detailsIframe) detailsIframe.classList.remove('active')
  }
}

// Toggle the approved/rejected state for any reviewable block
// Expected arguments:
//   id      - the id of the block which should be toggled
//   context - the context that this block belongs to which should be shown
//   refresh - whether the details iframe should be reloaded
function toggleApproval(args) {
  const approved = !$(`.review-button[data-id="${args.id}"]`).hasClass('approved')
  $(`.review-button[data-id="${args.id}"]`).toggleClass('approved', approved)
  $(`.review-block[data-id="${args.id}"]`).toggleClass('approved', approved)

  if (args.context == 'content') {
    // This sends a message to the preview iframe to update the state of the block with the given id.
    // This allows us to have the preview dynamically change when a content change is approved/rejected.
    postMessage('approve', { id: args.id, approved: approved })
  } else if (args.context == 'details' && args.refresh == 'true') {
    // For detail changes, we instead reload the preview iframe, if refresh is set to true.
    const url = detailsIframe.src.split('?')[0]
    detailsIframe.src = `${url}?review=true&excerpt=true&reify=${getApprovedDetailChanges().join(',')}`
  }
}

// Send a message to the page's content preview.
function postMessage(action, data) {
  data.action = action
  data = JSON.parse(JSON.stringify(data))
  contentIframe.contentWindow.postMessage(data, '*')
}
