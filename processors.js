var detemplatize = require('./detemplatize.js')
var extract = require('./extract.js')

// remove indentation and return a {indent: }
function dedent(str) {
  var match = str.match(/^[ \t]*(?=\S)/gm)
  if (!match) {
    return { size: 0, text: str }
  }
  var indent = Math.min.apply(Math, match.map(function (x) { return x.length }))
  var re = new RegExp('^[ \\t]{' + indent + '}', 'gm')
  return {
    size: indent,
    text: indent > 0 ? str.replace(re, '') : str
  }
}

module.exports = {
   // For JS files, just detemplatize
   detemplatize: function() {
     return {
       preprocess: function (text) {
         return [detemplatize(text)]
       },
       postprocess: function (messages) {
         return messages[0];
       },
       supportsAutofix: false
     };
   },
   // For HTML and SVG files, first detemplatize, then run through HTML plugin
   detemplatizeHTML: function() {
     var scripts, originalText;

     return {
       preprocess: function (text) {
         originalText = text
         scripts = extract(text)

         return scripts.map(function (chunk) {
           var indentation = dedent(chunk.text);
           chunk.indent_size = indentation.size;
           return detemplatize(indentation.text)
         });
       },
       postprocess: function (messages) {
         var result = [];

         messages.forEach(function (messageList, index) {
           var lines = originalText.slice(0, scripts[index].start).split('\n');
           var lineno = lines.length - 1;
           var colno = scripts[index].indent_size

           messageList.forEach(function (message) {
             message.line += lineno;
             message.column += colno;
             result.push(message);
           });
         });

         return result
       },
       supportsAutofix: false
     };
   }
};

