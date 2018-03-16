var detemplatize = require('./detemplatize.js')
var htmlparser = require('htmlparser2')

// For JS files, just detemplatize
var remove_templates = {
  preprocess: function (text) {
    return [detemplatize(text)]
  },
  postprocess: function (messages) {
    return messages[0]
  }
}

// remove indentation and return a {indent: }
function dedent(str) {
  var match = str.match(/^[ \t]*(?=\S)/gm)
  if (!match) {
    return str
  }
  var indent = Math.min.apply(Math, match.map(function(x) { return x.length }))
  var re = new RegExp('^[ \\t]{' + indent + '}', 'gm')
  return {
    size: indent,
    text: indent > 0 ? str.replace(re, '') : str
  }
}

// For HTML and SVG files, first detemplatize, then run through HTML plugin
var extract_scripts = function() {
  var scripts,
      originalText
  return {
    preprocess: function (text) {
      originalText = text
      scripts = extract(text)
      return scripts.map(function(chunk) {
        var indentation = dedent(chunk.text)
        chunk.indent_size = indentation.size
        return detemplatize(indentation.text)
      })
    },
    postprocess: function (messages) {
      var result = []
      messages.forEach(function(messageList, index) {
        var lines = originalText.slice(0, scripts[index].start).split('\n')
        var lineno = lines.length - 1
        var colno = scripts[index].indent_size
        messageList.forEach(function(message) {
          message.line += lineno
          message.column += colno
          result.push(message)
        })
      })
      return result
    }
  }
}

function extract(text) {
  var jsMime = /^(application|text)\/(x-)?(javascript|babel|ecmascript-6)$/i
  var inScript = false
  var chunks = []

  var parser = new htmlparser.Parser({
    onopentag: function(name, attrs) {
      if (name !== "script")
        return
      if (attrs.type && !attrs.type.test(jsMime))
        return
      inScript = true
    },
    onclosetag: function(name) {
      if (name == "script" && inScript)
        inScript = false
    },
    ontext: function() {
      if (inScript)
        chunks.push({
          start: parser.startIndex,
          text: text.slice(parser.startIndex, parser.endIndex + 1)
        })
    }
  }, { decodeEntities: true })
  parser.write(text)
  parser.end()
  return chunks
}


module.exports.processors = {
  ".html": extract_scripts(),
  ".svg": extract_scripts(),
  ".js": remove_templates
}
