'use strict'

process.env.FORCE_COLOR = '1'

const test = require('tap').test
const cp = require('child_process')
const path = require('path')
const chalk = require('chalk')

const parentPath = path.resolve(__dirname, '..')
const cliPath = path.join(parentPath, 'cli.js')

function cli (args, disableColor) {
  const env = Object.assign({}, process.env)
  if (disableColor) delete env.FORCE_COLOR
  return new Promise((resolve, reject) => {
    cp.execFile(cliPath, args ? args.split(/\s/) : [], {
      encoding: 'utf8',
      env
    }, (err, stdout, stderr) => {
      if (err) return reject(err)
      resolve({ stdout, stderr })
    })
  })
}

function withLineFeeds (array) {
  return array.concat('').join('\n')
}

test('default includes dependencies', t => {
  return cli().then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk} {cyan prod}`,
      chalk`{white sywac} {cyan prod}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--dev includes dependencies and devDependencies', t => {
  return cli(`${parentPath} --dev`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod}`,
      chalk`{white sywac}            {cyan prod}`,
      chalk`{white coveralls}        {magenta dev}`,
      chalk`{white standard}         {magenta dev}`,
      chalk`{white standard-version} {magenta dev}`,
      chalk`{white tap}              {magenta dev}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--all includes everything defined', t => {
  return cli(`${parentPath} --all`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod}`,
      chalk`{white sywac}            {cyan prod}`,
      chalk`{white coveralls}        {magenta dev}`,
      chalk`{white standard}         {magenta dev}`,
      chalk`{white standard-version} {magenta dev}`,
      chalk`{white tap}              {magenta dev}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--sort sorts list', t => {
  return cli(`${parentPath} --all --sort`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod}`,
      chalk`{white coveralls}        {magenta dev}`,
      chalk`{white standard}         {magenta dev}`,
      chalk`{white standard-version} {magenta dev}`,
      chalk`{white sywac}            {cyan prod}`,
      chalk`{white tap}              {magenta dev}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--terse prints uncolored names only', t => {
  return cli(`${parentPath} --all --terse`).then(r => {
    t.equal(r.stdout, withLineFeeds(['chalk', 'sywac', 'coveralls', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('infers --terse if no color supported (e.g. when piping stdout to another program)', t => {
  return cli(`${parentPath} -a`, true).then(r => {
    t.equal(r.stdout, withLineFeeds(['chalk', 'sywac', 'coveralls', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('fails if no package.json file', t => {
  return cli('dne').catch(err => {
    t.equal(err.code, 1)
    t.includes(err.message, `File ${path.join('dne', 'package.json')} does not exist :(`)
  })
})

test('fails if package.json invalid json', t => {
  return cli(path.resolve(__dirname, 'invalid-json')).catch(err => {
    t.equal(err.code, 1)
    t.includes(err.message, 'Unexpected token')
  })
})

test('fails if package.json is a directory ¯\\_(ツ)_/¯', t => {
  return cli(path.resolve(__dirname)).catch(err => {
    t.equal(err.code, 1)
    t.includes(err.message, 'EISDIR')
  })
})

test('prints nothing if no dependencies', t => {
  return cli(path.resolve(__dirname, 'empty')).then(r => {
    t.equal(r.stdout, '')
    t.notOk(r.stderr)
  })
})

test('supports all dependency types', t => {
  return cli(`${path.resolve(__dirname, 'all')} -dpbos`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid}     {cyan prod}`,
      chalk`{white chai}                {magenta dev}`,
      chalk`{white chalk}               {magenta dev}`,
      chalk`{white cliui}               {cyan prod},{green bundled}`,
      chalk`{white decamelize}          {cyan prod}`,
      chalk`{white dezalgo}             {green bundled}`,
      chalk`{white find-up}             {cyan prod}`,
      chalk`{white fs-vacuum}           {green bundled}`,
      chalk`{white react}               {blue peer}`,
      chalk`{white react-dom}           {blue peer}`,
      chalk`{white react-router}        {yellow optional}`,
      chalk`{white redux-simple-router} {yellow optional}`,
      chalk`{white which}               {magenta dev}`,
      chalk`{white write-file-atomic}   {green bundled}`
    ]))
    t.notOk(r.stderr)
  })
})

test('-v looks up installed versions', t => {
  return cli(`${path.resolve(__dirname, 'all')} -asv`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid}     {cyan prod}         {inverse 2.0.1}`,
      chalk`{white chai}                {magenta dev}          {inverse not installed}`,
      chalk`{white chalk}               {magenta dev}          {inverse not installed}`,
      chalk`{white cliui}               {cyan prod},{green bundled} {inverse 3.3.0}`,
      chalk`{white decamelize}          {cyan prod}         {inverse 1.1.1}`,
      chalk`{white dezalgo}             {green bundled}      {inverse not installed}`,
      chalk`{white find-up}             {cyan prod}         {inverse 2.1.0}`,
      chalk`{white fs-vacuum}           {green bundled}      {inverse not installed}`,
      chalk`{white react}               {blue peer}         {inverse not installed}`,
      chalk`{white react-dom}           {blue peer}         {inverse not installed}`,
      chalk`{white react-router}        {yellow optional}     {inverse not installed}`,
      chalk`{white redux-simple-router} {yellow optional}     {inverse not installed}`,
      chalk`{white which}               {magenta dev}          {inverse not installed}`,
      chalk`{white write-file-atomic}   {green bundled}      {inverse not installed}`
    ]))
    t.notOk(r.stderr)
  })
})

test('supports alt bundleDependencies', t => {
  return cli(`${path.resolve(__dirname, 'bundle-alt')} -xb`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white abbrev}     {green bundled}`,
      chalk`{white ansi-regex} {green bundled}`,
      chalk`{white ansicolors} {green bundled}`,
      chalk`{white aproba}     {green bundled}`
    ]))
    t.notOk(r.stderr)
  })
})
