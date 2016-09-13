var detemplatize = require('./detemplatize.js')
var html = require('eslint-plugin-html').processors['.html']

// For JS files, just detemplatize
var remove_templates = {
  preprocess: function(text) {
    return [detemplatize(text)]
  },
  postprocess: function(messages) {
    return messages[0]
  }
}

// For HTML and SVG files, first detemplatize, then run through HTML plugin
var extract_scripts = {
  preprocess: function(text) {
    text = html.preprocess.call(this, detemplatize(text), '')
    return text
  },
  postprocess: html.postprocess
}

module.exports.processors = {
  ".html": extract_scripts,
  ".js": remove_templates,
  ".svg": extract_scripts
}
