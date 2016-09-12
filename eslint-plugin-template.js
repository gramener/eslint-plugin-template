var detemplatize = require('./detemplatize.js')
var html = require('eslint-plugin-html').processors['.html']

module.exports.processors = {
  // For HTML files, first detemplatsize, then run through HTML plugin
  ".html": {
    preprocess: function(text) {
      text = html.preprocess.call(this, detemplatize(text), '')
      return text
    },
    postprocess: html.postprocess
  },
  // For JS files, just detemplatize
  ".js": {
    preprocess: function(text) {
      return [detemplatize(text)]
    },
    postprocess: function(messages) {
      return messages[0]
    }
  }
}
