var detemplatize = require('../detemplatize.js')
var expect = require('chai').expect
var eslint = require("eslint")
var plugin = require('..')

describe('preprocess', function() {
  it('doesn\'t change input with no markers', function() {
    var source = 'var a = 4;\na++;\a = \'stuff\''
    expect(detemplatize(source)).to.deep.equal(source)
  })

  it('removes {% tags', function() {
    var source = '\n{%xx\nxx\n%}{%\nxx\nxx%}\n{%xx%}'
    var target = '\n/*xx\nxx\n*//*\nxx\nxx*/\n/*xx*/'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('removes {# tags', function() {
    var source = '\n{#xx\nxx\n#}{#\nxx\nxx#}\n{#xx#}'
    var target = '\n/*xx\nxx\n*//*\nxx\nxx*/\n/*xx*/'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces {{ tags with objects', function() {
    var source = '{{x}};{{x\ny}};\n{{\nx\ny\n}}'
    var target = '{   };{  \n  };\n{ \n \n \n }'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces {% raw with objects', function() {
    var source = '{%  \nraw \nx \n%};\n{%raw x%};{%rawx%}'
    var target = '{   \n    \n  \n };\n{       };/*rawx*/'
    // TODO: not sure why the spaces are required as they are
    expect(detemplatize(source)).to.deep.equal(target)
  })
})

describe('run-lint', function () {
  var cli = new eslint.CLIEngine({
    envs: ['browser'],
    extends: ['eslint:recommended'],
    rules: {
      indent: ['error', 4]
    }
  })
  cli.addPlugin('template', plugin)

  it('returns errors on JS templates', function() {
    var report = cli.executeOnFiles(['test/sample/sample.js'])
    expect(report.errorCount).to.equal(2)
    expect(report.warningCount).to.equal(0)
    expect(report.results[0].messages[0].ruleId).to.equal('no-unused-vars')
    expect(report.results[0].messages[1].ruleId).to.equal('no-unused-vars')
  })

  it('returns errors on HTML templates', function () {
    var report = cli.executeOnFiles(['test/sample/sample.html'])
    expect(report.errorCount).to.equal(6)
    expect(report.warningCount).to.equal(0)
    report.results[0].messages.forEach(function(message) {
      expect(message.ruleId).to.equal('no-unused-vars')
    })
  })
})
