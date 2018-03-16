# eslint-plugin-template

Parses out template declarations found in js and html files.

For example if you have a file like below, eslint will not be able to parse it
normally due to the template markers. With this plugin, the linter is able to
work normally. Note that whatever is inside the markers is replaced with `{}`.

```js
  {# Set data in the JS variable data #}    // ignored
  {% import json %}                         // ignored
  var x = {{ json.dumps(data) }}            // becomes var x = {}
  var y = {% raw json.dumps(data) %}        // becomes var y = {}
```

## Installation

```
npm install --save-dev eslint eslint-plugin-template
```

To install globally, using the `-g` flag.

## Usage

Add `template` to the plugins section of your `.eslintrc` configuration file. You
can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "template"
    ]
}
```

This automatically extracts JS from HTML files via `eslint-plugin-html`. So you
do not need to include the `"html"` template.

## Tests
```
$ npm test
```

## Release

- Update the version in `package.json`
- Commit to the master branch and push
- Run `npm publish`
