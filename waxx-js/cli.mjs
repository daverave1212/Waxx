
import fs from 'fs'
import path from 'path'

import { go } from './waxx/src/index.mjs'

const languages = {
    'javascript': 'js',
    'python': 'py',
    'haxe': 'hx',
    'js': 'js',
    'py': 'py',
    'hx': 'hx'
}

let args = process.argv.slice(2)

console.log(args)

if (['help', '--help', '-h'].includes(args[0])) {
    console.log('Argument #1: the language [js | py | hx | (javascript | python | haxe]')
    console.log('Argument #2: the path to your waxx source file [_.wx | _.waxx | _.xx]')
    process.exit()
} else if (args.length < 2)
    throw 'This CLI takes 2 arguments: <language> <file>. See "help" for more information.'

let options = {
    language: languages[args[0]],
    filePath: args[1]
}

if (options.language == null)
    throw `Language ${options.language} not found.`

if (!fs.existsSync(options.filePath))
    throw `File ${options.filePath} does not seem to exist.`

if (!fs.lstatSync(options.filePath).isFile())
    throw `Path ${options.filePath} does not seem to be a valid file.`

if ( !/(.*\.wx)|(.*\.waxx)|(.*\.xx)/i.test(options.filePath) ) { // If is file name valid    
    throw `File name ${options.filePath} has an invalid format. Make sure the file ends in .wx, .waxx or .xx`
}

let parentDirectory = path.resolve(path.dirname(options.filePath))
console.log(parentDirectory)
let fileNameNoExtension = path.basename(options.filePath).split('.').slice(0, -1).join('.')
let compiledFileName = fileNameNoExtension + '.' + options.language
let sourceFilePath = path.join(parentDirectory, compiledFileName)

let sourceCode = fs.readFileSync(options.filePath, {encoding: 'utf8', flag: 'r'})

let compiledCode = go(sourceCode, options.language)

fs.writeFileSync(compiledFileName, compiledCode)














