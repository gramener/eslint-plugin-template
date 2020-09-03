/*
function extract_tag_body(content) {
  return content.slice(content.indexOf('%}') + 2, content.lastIndexOf('{%'))
}
*/

/*
function escape_quotes_n_comments(content) {
    return content.replace(/["']/g, '`').replace(/(\/\*|\*\/)/g, '``')
}
*/

function replace_with_padding(content, padding) {
  return content.replace(/[^\n]/g, padding).replace('/\n/g', '\\\n')
}

/*
function replace_with_brackets(match) {
  return '{' + replace_with_padding(match.slice(1, -1), ' ') + '}'
}

function replace_with_quote(match) {
  return '"' + replace_with_padding(match.slice(1, -1), '×') + '"'
}

function replace_with_singlequote(match) {
  return "'" + replace_with_padding(match.slice(1, -1), '×') + "'"
}
*/

function replace_with_comments(match, start) {
  start = start || 0;

  var prefix = '/* ';
  var suffix = ' */';
  var minlength = prefix.length + suffix.length + start;

  if (match.length > minlength) {
      var pre_breaks = replace_with_padding(match.slice(0, prefix.length + start), '');
      var post_breaks = replace_with_padding(match.slice(match.length - suffix.length, match.length), '');
      var result = [
          prefix,
          pre_breaks,
          replace_with_padding(match.slice(prefix.length + start, match.length - suffix.length), '×'),
          post_breaks,
          suffix
      ].join('');
      return result;
  } else if (match.length == minlength) {
      result = prefix + '×' + replace_with_padding(match, '') + suffix;
      return result;
  } else {
      return '';
  }
}

function replace_with_placeholder(match) {
  return '____' + replace_with_comments(match, 4);
}

function empty_js_comments(text) {
  // /* comments */ are emptied if contains any {#...#}, {%...%} or {{...}} tag (prevents nested comment later)
  var tagRegex = /({%[\s\S]*?%}|{#[\s\S]*?#}|{{[\s\S]*?}})/mg;
  return text.replace(/\/\*[\s\S]*?\*\//g, function(match) {
    if (tagRegex.exec(match) !== null) {
        return replace_with_comments(match);
    } else {
        return match;
    }
  });
}

function detemplatize_block_comments(text) {
  // {% comment %}...{% endcomment %} replaced by /* ... */
  return text.replace(/{%\s*comment\s[\s\S]*?%}[\s\S]*?{%\s*endcomment\s[\s\S]*?%}/g, function(match) {
    return replace_with_comments(match);
  })
}

function detemplatize_inline_comments(text) {
  // {# comments #} is replaced with a /* ... */
  return text.replace(/{#[\s\S]*?#}/g, function(match) {
    return replace_with_comments(match);
  });
}

function detemplatize_tags(text) {
  // {{ anything }} is replaced with a { ... } -- this is typically assigned to a variable
  text = text.replace(/{{[\s\S]*?}}/g, replace_with_placeholder)

  // {% block|endblock|with|endwith xxx %} are replaced by a /* ××× */
  text = text.replace(/{%\s*(block|endblock|blocktrans|endblocktrans|with|endwith)\s[\s\S]*?%}/g, function(match) {
      return replace_with_comments(match);
  });

  // {% trans ... as ... %} is replaced by a /* ××× */
  text = text.replace(/{%\s*trans\s[\s\S]*?\sas\s[\s\S]*?%}/g, function(match) {
      return replace_with_comments(match);
  });

  // {% raw xxx %} is replaced with a { ... } -- this is typically assigned to a variable
  text = text.replace(/{%\s*raw\s[\s\S]*?%}/g, replace_with_placeholder);

  // {% for %} & {% endfor %} tags are replaced with a /* ××× */
  text = text.replace(/{%\s*(for|endfor)[\s\S]*?%}/g, function(match) {
      return replace_with_comments(match);
  });

  // {% anything %} is replaced with a ' ××× '
  return text.replace(/{%[\s\S]*?%}/g, replace_with_placeholder)
}

function detemplatize_branches(text) {
  var branchRegex = /{%\s*(if|endif)\s[\s\S]*?%}/mg;
  var stack = [], ranges = [];
  var match;

  while((match = branchRegex.exec(text)) !== null) {
    if (match[1] == 'if') {
      stack.push(match.index)
    } else if (stack.length) {
      ranges.push([stack.pop(), match.index + match[0].length])
    }
  }

  ranges.forEach(function(range) {
    text = text.slice(0, range[0]) + replace_with_comments(text.slice(range[0], range[1])) + text.slice(range[1]);
  })

  return text;
}

function fix_artefacts(text) {
  // Fix artefact `...: /* ××× */,`
  text = text.replace(/(:[\s]*)(\/\* [×]+ \*\/)([\s]*[,}])/g, function(match, p1, p2, p3) {
    return p1 + '"' + p2.slice(2, -2).replace(/\n/g, '\\\n') + '"' + p3
  })
/*
  // Fix artefact `____     : ...`
  text = text.replace(/([\s]+____)[\s]+:/g, function(match, p1) {
    return p1 + ':'
  })

  // Fix artefact `...: ____     ,`
  text = text.replace(/:( ____[\s]+(,|\n))/g, function(match, p1, p2) {
    return ': ____' + p2;
  })

  // Fix artefact `..., ____        )`
  text = text.replace(/,( ____[\s]+\))/g, function(match, p1, p2) {
    return ', ____)';
  });
*/
  return text;
}

module.exports = function (text) {
    text = empty_js_comments(text)
    text = detemplatize_block_comments(text)
    text = detemplatize_inline_comments(text)

    text = detemplatize_branches(text)
    text = detemplatize_tags(text)
    text = fix_artefacts(text)

    return text
}
