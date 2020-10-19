var processors = require('./processors.js')

module.exports = {
  rules: {
    "no-template-branch": require('./rules/no-template-branch.js')
  },
  configs: {
    recommended: {
       rules: {
         'template/no-template-branch': 2
       }
    }
  },
  processors: {
    ".html": processors.detemplatizeHTML(),
    ".svg": processors.detemplatizeHTML(),
    ".js": processors.detemplatize()
  }
};
