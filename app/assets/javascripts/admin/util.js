/* global */
/* exported Util */

/** UTILITY FUNCTIONS
 * This file contains standalone utility functions. Usually these functions have been copied from the internet.
 */

const Util = {
  // Taken from https://stackoverflow.com/a/512542
  // Set the element and position for the user's cursor.
  setCaretPosition: function(elem, caretPos = 0) {
    if (elem != null) {
      if (elem.createTextRange) {
        var range = elem.createTextRange()
        range.move('character', caretPos)
        range.select()
      } else {
        if (elem.selectionStart) {
          elem.focus()
          elem.setSelectionRange(caretPos, caretPos)
        } else {
          elem.focus()
        }
      }
    }
  },

  // Taken from https://stackoverflow.com/a/7478420
  // Returns information about the current text selection.
  getSelectionTextInfo: function(el) {
    var atStart = false, atEnd = false
    var selRange, testRange
    if (window.getSelection) {
      var sel = window.getSelection()
      if (sel.rangeCount) {
        selRange = sel.getRangeAt(0)
        testRange = selRange.cloneRange()

        testRange.selectNodeContents(el)
        testRange.setEnd(selRange.startContainer, selRange.startOffset)
        atStart = (testRange.toString() == '')

        testRange.selectNodeContents(el)
        testRange.setStart(selRange.endContainer, selRange.endOffset)
        atEnd = (testRange.toString() == '')
      }
    } else if (document.selection && document.selection.type != 'Control') {
      selRange = document.selection.createRange()
      testRange = selRange.duplicate()

      testRange.moveToElementText(el)
      testRange.setEndPoint('EndToStart', selRange)
      atStart = (testRange.text == '')

      testRange.moveToElementText(el)
      testRange.setEndPoint('StartToEnd', selRange)
      atEnd = (testRange.text == '')
    }

    return { atStart: atStart, atEnd: atEnd }
  },

  // Generates a string of 16 random characters to be used as a unique identifier.
  generateId: function() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 16 characters after the decimal.
    return Math.random().toString(36).substr(2, 18)
  },

  make: function(tagName, classNames = null, attributes = {}, parent = null) {
    let el = document.createElement(tagName)
  
    if ( Array.isArray(classNames) ) {
      el.classList.add(...classNames)
    } else if ( classNames ) {
      el.classList.add(classNames)
    }
  
    for (let attrName in attributes) {
      if (attrName == 'data') {
        const data = attributes[attrName]
        for (let key in data) {
          el.dataset[key] = data[key]
        }
      } else {
        el[attrName] = attributes[attrName]
      }
    }
  
    if (parent) {
      parent.appendChild(el)
    }
  
    return el
  },
}
