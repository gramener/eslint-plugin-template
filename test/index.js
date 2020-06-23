var detemplatize = require('../detemplatize.js')
var extract = require('../extract.js')

var expect = require('chai').expect
var eslint = require("eslint")
var plugin = require('..')

describe('detemplatize', function() {
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
    var target = '{/**/};{/*\n*/};\n{/* \n */}'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces {% raw with objects', function() {
    var source = '{%  \nraw \nx \n%};\n{%raw x%};{%rawx%}'
    var target = '{/* \n    \n  */};\n{/*   */};/*rawx*/'
    // TODO: not sure why the spaces are required as they are
    expect(detemplatize(source)).to.deep.equal(target)
  })
})

describe('extract', function() {
  it('ignore json script', function() {
    var source = '<script type="application/json">console.log("ok")</script>';
    expect(extract(source)).to.deep.equal([]);
  });

  it('one-line script', function() {
    var source = '<script type="text/javascript">console.log("ok")</script>';
    expect(extract(source)).to.deep.equal([
      {start: 31, end: 48, text: 'console.log("ok")'}
    ]);
  });

  it('strip script tag', function() {
    var source = (
      '<script type="text/javascript">\n' +
        'var x = {{x}};\n' +
        'console.log(x);\n' +
      '</script>'
    );

    expect(extract(source)).to.deep.equal([
      {start: 31, end: 63, text: '\nvar x = {{x}};\nconsole.log(x);\n'}
    ]);
  });

  it('script start indent', function() {
    var source = (
      '<html>' +
      '<script type="text/javascript">\n' +
      '   var x = {{x}};\n' +
      '   console.log(x);\n' +
      '</script>' +
      '   <script type="text/javascript">\n' +
      '       var y = {{y}}; console.log(y);</script>' +
      '</html>'
    );

    expect(extract(source)).to.deep.equal([
      {start: 37, end: 75, text: '\n   var x = {{x}};\n   console.log(x);\n'},
      {start: 118, end: 156, text: '\n       var y = {{y}}; console.log(y);'}
    ]);
  });

  it('allowed mimetypes', function() {
    var allowed = [
      'application/javascript','application/babel', 'application/ecmascript-6',
      'application/x-javascript','application/x-babel', 'application/x-ecmascript-6',
      'text/javascript','text/babel', 'text/ecmascript-6',
      'text/x-javascript','text/x-babel', 'text/x-ecmascript-6',
    ];

    allowed.forEach(function(mimetype) {
      var scriptTag = '<script type="' + mimetype + '">';
      var source = scriptTag + 'console.log("' + mimetype + '")</script>';
      expect(extract(source)).to.deep.equal([{
        start: scriptTag.length,
        end: source.length - '</script>'.length,
        text: 'console.log("' + mimetype + '")'
      }])
    })
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
  /* DOES NOT WORK WITH eslint-plugin-html ENABLED ! */
  /*cli.addPlugin('html', require('eslint-plugin-html'))*/

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
