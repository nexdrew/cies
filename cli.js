#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const colors = {
  prod: 'cyan',
  dev: 'magenta',
  peer: 'blue',
  bundled: 'green',
  optional: 'yellow'
}

let opts
require('sywac')
  .preface(null, 'List dependencies from package.json')
  .positional('[dir]', {
    paramsDesc: 'Optional path to directory containing package.json'
  })
  .boolean('-d, --dev', {
    desc: 'Include devDependencies'
  })
  .boolean('-p, --peer', {
    desc: 'Include peerDependencies'
  })
  .boolean('-b, --bundled', {
    desc: 'Include bundledDependencies'
  })
  .boolean('-o, --optional', {
    desc: 'Include optionalDependencies'
  })
  .boolean('-a, --all', {
    desc: 'Include dependencies from all types'
  })
  .boolean('-x, --exclusive', {
    desc: 'Exclude production dependencies'
  })
  .boolean('-s, --sort', {
    desc: 'Sort list before printing'
  })
  .boolean('-v, --versions', {
    desc: 'Lookup current installed version'
  })
  .boolean('-t, --terse', {
    desc: 'Print names only, without color'
  })
  .help('-h, --help', {
    desc: 'Print this help content',
    implicitCommand: false
  })
  .version('-V, --version', {
    desc: 'Print cies program version',
    implicitCommand: false
  })
  .outputSettings({ maxWidth: 66 })
  .parseAndExit()
  .then(argv => {
    opts = argv
    if (!chalk.supportsColor) opts.terse = true
    return require('./index')(opts)
  })
  .then(deps => {
    let nameLen = 0
    let typeLen = 0
    deps.forEach(d => {
      if (opts.terse) return console.log(d.name)
      nameLen = Math.max(nameLen, d.name.length)
      d.typeString = d.types.join(',')
      typeLen = Math.max(typeLen, d.typeString.length)
    })
    if (opts.terse) return

    let name
    let type
    deps.forEach(d => {
      name = chalk.white(d.name) + new Array(nameLen - d.name.length + 2).join(' ')
      type = d.types.map(type => chalk[colors[type]](type)).join(',')
      if (d.version) type += new Array(typeLen - d.typeString.length + 2).join(' ') + chalk.inverse(d.version)
      console.log(name + type)
    })
  })
  .catch(err => {
    console.error(typeof err === 'string' ? chalk.red(err) : err)
    process.exitCode = 1
  })
