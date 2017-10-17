'use strict'

const test = require('tap').test
const cp = require('child_process')
const path = require('path')

const parentPath = path.resolve(__dirname, '..')
const cliPath = path.join(parentPath, 'cli.js')

function cli (args) {
  return new Promise((resolve, reject) => {
    cp.execFile(cliPath, args ? args.split(/\s/) : [], { encoding: 'utf8' }, (err, stdout, stderr) => {
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
    t.equal(r.stdout, withLineFeeds(['sywac']))
    t.notOk(r.stderr)
  })
})

test('--dev includes dependencies and devDependencies', t => {
  return cli(`${parentPath} --dev`).then(r => {
    t.equal(r.stdout, withLineFeeds(['sywac', 'coveralls', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('--all includes everything defined', t => {
  return cli(`${parentPath} --all`).then(r => {
    t.equal(r.stdout, withLineFeeds(['sywac', 'coveralls', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('--sort sorts list', t => {
  return cli(`${parentPath} --all --sort`).then(r => {
    t.equal(r.stdout, withLineFeeds(['coveralls', 'standard', 'standard-version', 'sywac', 'tap']))
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

test('prints nothing if no dependencies', t => {
  return cli(path.resolve(__dirname, 'empty')).then(r => {
    t.equal(r.stdout, '')
    t.notOk(r.stderr)
  })
})

test('supports all dependency types', t => {
  return cli(`${path.resolve(__dirname, 'all')} -dpbos`).then(r => {
    t.equal(r.stdout, withLineFeeds(['chai', 'chalk', 'cliui', 'decamelize', 'dezalgo', 'find-up', 'fs-vacuum', 'react', 'react-dom', 'react-router', 'redux-simple-router', 'which', 'write-file-atomic']))
    t.notOk(r.stderr)
  })
})

test('supports alt bundleDependencies', t => {
  return cli(`${path.resolve(__dirname, 'bundle-alt')} -xb`).then(r => {
    t.equal(r.stdout, withLineFeeds(['abbrev', 'ansi-regex', 'ansicolors', 'aproba']))
    t.notOk(r.stderr)
  })
})
