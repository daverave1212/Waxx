
var module = {
    exports : {}
}

var __requirer = {
    '__requirer' : module.exports
}

function require(moduleName) {
    return __requirer[moduleName]
}