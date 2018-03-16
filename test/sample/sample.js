{# Set data in the JS variable data #}    // ignored
{% import json %}                         // ignored
var x = {{ json.dumps(data) }}            // becomes var x = {}
var y = {% raw json.dumps(data) %}        // becomes var y = {}
// Object.assign(x, y)                       // dummy command to use x and y
