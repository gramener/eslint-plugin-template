replace_with_obj = function(match) {
  return '{' + match.slice(1, -1).replace(/[^\n]/g, ' ') + '}'
}

replace_with_newlines = function(match) {
  return match.replace(/[^\n]/g, ' ')
}

module.exports = function(text) {
  return text.replace(/{#[\s\S]*?#}/g, replace_with_newlines)
             .replace(/{%[\s\S]*?%}/g, replace_with_newlines)
             .replace(/{{[\s\S]*?}}/g, replace_with_obj)
}
