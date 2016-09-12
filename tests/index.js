var detemplatize = require('../detemplatize.js')
var expect = require('chai').expect

describe('preprocess', function() {
  it('doesn\'t change input with no markers', function() {
    var input = 'var a = 4;\na++;\a = \'stuff\''
    expect(detemplatize(input)).to.deep.equal(input)
  })

  it('removes {% tags', function() {
    var input = '\n{%xx\nxx\n%}{%\nxx\nxx%}\n{%xx%}'
    expect(detemplatize(input)).to.deep.equal(input.replace(/[^\n]/g, ' '))
  })

  it('removes {# tags', function() {
    var input = '\n{#xx\nxx\n#}{#\nxx\nxx#}\n{#xx#}'
    expect(detemplatize(input)).to.deep.equal(input.replace(/[^\n]/g, ' '))
  })

  it('replaces {{ tags with objects', function() {
    var input = '{{x}};{{x\ny}};\n{{\nx\ny\n}}';
    expect(detemplatize(input)).to.deep.equal('{   };{  \n  };\n{ \n \n \n }');
  });
})
