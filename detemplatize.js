function extract_tag_body(content) {
  return content.slice(content.indexOf('%}') + 2, content.lastIndexOf('{%'))
}

function escape_quotes_n_comments(content) {
    return content.replace(/["']/g, '`').replace(/(\/\*|\*\/)/g, '``')
}

function replace_with_brackets(match) {
  return '{/*' + replace_with_padding(match.slice(3, -3)) + '*/}'
}

function replace_with_padding(content) {
  return content.replace(/[^\n]/g, ' ')
}

function replace_with_comments(match) {
  return '/*' + escape_quotes_n_comments(match.slice(2, -2)) + '*/'
}

function detemplatize_comments(text) {
  // {# comments #} is replaced with a /* ... */
  text = text.replace(/{#[\s\S]*?#}/g, replace_with_comments)

  // {% comment %}...{% endcomment %} replaced by /* ... */
  return text.replace(/{%\s*comment\s[\s\S]*?%}[\s\S]*?{%\s*endcomment\s[\s\S]*?%}/g, function(match) {
    return '/*' + escape_quotes_n_comments(extract_tag_body(match)) + '*/'
  })
}

function detemplatize_values(text) {
  // {{ anything }} is replaced with a {/* ... */} -- this is typically assigned to a variable
  text = text.replace(/{{[\s\S]*?}}/g, replace_with_brackets)

  // {% raw xxx %} is replaced with a {/* ... */} -- this is typically assigned to a variable
  return text.replace(/{%\s*raw\s[\s\S]*?%}/g, replace_with_brackets)
}

function detemplatize_tags(text) {
  // {% anything %} is replaced with a /* ... */
  return text.replace(/{%[\s\S]*?%}/g, replace_with_comments)
}

module.exports = function (text) {
  text = detemplatize_comments(text)
  text = detemplatize_values(text)

  return detemplatize_tags(text)
}
