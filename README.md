# eslint-plugin-template

Parses out template declarations found in js and html files.

For example if you have a file like below, eslint will not be able to parse it normally due to the template markers. With this plugin, the linter is able to work normally. Note that whatever is inside the markers is replaced with `{}`.

```js
  {# Set data in the JS variable data #}
  {% import json %}
  var x = {{ json.dumps(data) }}
```

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Next, install `eslint-plugin-template`:

```
$ npm install eslint-plugin-template --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-template` globally.

## Usage

Add `template` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

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
