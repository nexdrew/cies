#!/usr/bin/env node
'use strict'

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
  .help('-h, --help', {
    desc: 'Print this help content',
    implicitCommand: false
  })
  .version('-v, --version', {
    desc: 'Print cies program version',
    implicitCommand: false
  })
  .outputSettings({ maxWidth: 66 })
  .parseAndExit()
  .then(argv => require('./index')(argv))
  .then(deps => deps.forEach(d => console.log(d)))
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
