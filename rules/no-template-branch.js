
module.exports = {
  meta: {
    docs: {
      category: 'Template Issues',
      description: 'Forbid usage of conditional branches {% if %}...{% endif %} in templates',
      recommended: true
    }
  },
  create: function (context) {
    sourceCode = context.getSourceCode();
    return {
        Program() {
            sourceCode.ast.tokens.forEach(function(node) {
               if (node.type == 'String' && /\/\* −if−[×]* \*\//.exec(node.value) !== null) {
                   context.report(
                       node,
                       'Do not use {% if %}...{% endif %} in javascript templates'
                   )
               }
            });

            sourceCode.getAllComments().forEach(function(node) {
                if (node.value.indexOf('−if−') !== -1) {
                    context.report(
                        node,
                        'Do not use {% if %}...{% endif %} in javascript templates'
                    )
                }
            });
        }
    };
  }
}
