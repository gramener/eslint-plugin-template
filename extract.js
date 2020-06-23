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
         // remove the </script> part
        chunk.end = parser.startIndex;
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

  parser.write(text)
  parser.end()

  return chunks
}
