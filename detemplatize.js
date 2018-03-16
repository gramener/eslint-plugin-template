function replace_with_obj(match) {
  return '{' + match.slice(1, -1).replace(/[^\n]/g, ' ') + '}'
}

function replace_with_comments(match) {
  return '/*' + match.slice(2, -2) + '*/'
}

module.exports = function (text) {
  // {# comments #} is replaced with a /* ... */
  // {% anything %} is replaced with a /* ... */
  // {% raw xxx %} is replaced with a {} -- since this is typically assigned to a variable
  // {{ anything }} is replaced with a {} -- since this is typically assigned to a variable
  return text
    .replace(/{#[\s\S]*?#}/g, replace_with_comments)
    .replace(/{%\s*raw\s[\s\S]*?%}/g, replace_with_obj)
    .replace(/{%[\s\S]*?%}/g, replace_with_comments)
    .replace(/{{[\s\S]*?}}/g, replace_with_obj)
}
