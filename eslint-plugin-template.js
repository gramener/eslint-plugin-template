var detemplatize = require('./detemplatize.js')
var html = require('eslint-plugin-html').processors['.html']

var remove_templates = {
  preprocess: function(text) {
    return [detemplatize(text)]
  },
  postprocess: function(messages) {
    return messages[0]
  }
}

module.exports.processors = {
  // For HTML files, first detemplatsize, then run through HTML plugin
  ".html": {
    preprocess: function(text) {
      text = html.preprocess.call(this, detemplatize(text), '')
      return text
    },
    postprocess: html.postprocess
  },
  // For JS and SVG files, just detemplatize
  ".js": remove_templates
  ".svg": remove_templates
}
