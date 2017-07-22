function replace_with_obj(match) {
  return '{' + match.slice(1, -1).replace(/[^\n]/g, ' ') + '}'
}

function replace_with_newlines(match) {
  return match.replace(/[^\n]/g, ' ')
}

module.exports = function(text) {
  // {# comments #} is replaced with a newline
  // {% raw xxx %} is replaced with a {} -- since this is typically assigned to a variable
  // {% anything %} is replaced with a newline
  // {{ anything }} is replaced with a {} -- since this is typically assigned to a variable
  return text.replace(/{#[\s\S]*?#}/g, replace_with_newlines)
             .replace(/{%\s*raw\s[\s\S]*?%}/g, replace_with_obj)
             .replace(/{%[\s\S]*?%}/g, replace_with_newlines)
             .replace(/{{[\s\S]*?}}/g, replace_with_obj)
}
