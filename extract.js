var htmlparser = require('htmlparser2')

module.exports = function(text) {
  var jsMime = /^(application|text)\/(x-)?(javascript|babel|ecmascript-6)$/i
  var chunks = []
  var chunk = undefined;

  function parserEntry(parser) {
    return text.slice(parser.startIndex, parser.endIndex + 1);
  }

  var parser = new htmlparser.Parser({
    onopentag: function (name, attrs) {
      if (name == 'script' && (!attrs.type || jsMime.test(attrs.type))) {
        chunk = {
          start: parser.endIndex + 1,
          text: ''
        }
      }
    },
    onclosetag: function (name) {
      if (name == "script" && chunk) {
        // ignore the </script> part
        chunk.end = parser.startIndex;
        // trim chunk and force a \n at the end to prevent invalid
        // no-trailing-spaces & eol-last issues
        chunk.text = chunk.text.replace(/[\s\n]*$/, '\n');
        chunks.push(chunk)
        chunk = null
      }
    },
    ontext: function () {
      // JS like "for (var i=0; i<10; i++)" gets split at the "<". Merge these
      if (chunk) {
        chunk.text += parserEntry(parser)
      }
    }
  }, {
    decodeEntities: true
  });

  // ignore all <script> tags within a {% comment %}...{% endcomment %}
  text = text.replace(/{%\s*comment\s[\s\S]*?%}[\s\S]*?{%\s*endcomment\s[\s\S]*?%}/g, function(match) {
    return match.replace(/<script[\s>]+/g, '<!-- script ')
                .replace(/<\/[\s]*script[\s]*>/g, '</script -->');
  });

  parser.write(text)
  parser.end()

  return chunks
}
