/* globals it, describe */

const detemplatize = require('../detemplatize.js')
const expect = require('chai').expect
const eslint = require('eslint')
const plugin = require('..')

describe('preprocess', function() {
  it('doesn\'t change input with no markers', function() {
    const source = 'var a = 4;\na++;a = \'stuff\''
    expect(detemplatize(source)).to.deep.equal(source)
  })

  it('removes {% tags', function() {
    const source = '\n{%xx\nxx\n%}{%\nxx\nxx%}\n{%xx%}'
    const target = '\n/*  \n  \n*//*\n  \n  */\n/*  */'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('removes {# tags', function() {
    const source = '\n{#xx\nxx\n#}{#\nxx\nxx#}\n{#xx#}'
    const target = '\n/*  \n  \n*//*\n  \n  */\n/*  */'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('works with tags inside comments', function () {
    const source = '{# {% xxx %} #}'
    const target = '/*           */'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('works with tags inside quotes', function () {
    const source = 'let x = \'{% \'\' %}\''
    const target = 'let x = \'/*    */\''
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces {{ tags with objects', function() {
    const source = '{{x}};{{x\ny}};\n{{\nx\ny\n}}'
    const target = '{/**/};{/*\n*/};\n{/* \n */}'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces {% raw with objects', function() {
    const source = '{%  \nraw \nx \n%};\n{%raw x%};{%rawx%}'
    const target = '{/* \n    \n  */};\n{/*   */};/*    */'
    // TODO: not sure why the spaces are required as they are
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('discards code between eslint-disable .. eslint-enable', function() {
    const source = 'foo({{x}});/* eslint-disable */x{{y}} = 1;/*  eslint-enable \n*/bar({{x}});/*eslint-disable*/x{{y}} = 1;/*eslint-enable*/bar({{x}});'
    const target = 'foo({/**/});bar({/**/});bar({/**/});'
    expect(detemplatize(source)).to.deep.equal(target)
  })

  it('replaces code blocks with comments', function () {
    const source = '{% if true %}\nvar x = 1{% else %}var x = 2{% endif %}'
    const target = '/*         */\nvar x = 1/*      */var x = 2/*       */'
    expect(detemplatize(source)).to.deep.equal(target)
  })
})

describe('run-lint', function () {
  const engine = new eslint.ESLint({
    overrideConfig: {
      env: { browser: true },
      extends: ['eslint:recommended'],
      rules: {
        indent: ['error', 4],
        'linebreak-style': 'off',
      },
    },
    plugins: {
      html: require('eslint-plugin-html'),
      template: plugin,
    },
  })

  it('returns errors on JS templates', async function() {
    const reports = await engine.lintFiles(['test/sample/sample.js'])
    expect(reports[0].errorCount).to.equal(2)
    expect(reports[0].warningCount).to.equal(0)
    expect(reports[0].messages[0].ruleId).to.equal('no-unused-vars')
    expect(reports[0].messages[1].ruleId).to.equal('no-unused-vars')
  })

  it('returns errors on HTML templates', async function () {
    const reports = await engine.lintFiles(['test/sample/sample.html'])
    expect(reports[0].errorCount).to.equal(6)
    expect(reports[0].warningCount).to.equal(0)
    reports[0].messages.forEach(function(message) {
      expect(message.ruleId).to.equal('no-unused-vars')
    })
  })
})
