'use strict'

process.env.FORCE_COLOR = '1'

const test = require('tap').test
const cp = require('child_process')
const path = require('path')
const chalk = require('chalk')

const parentPath = path.resolve(__dirname, '..')
const cliPath = path.join(parentPath, 'cli.js')
const wrapperPath = path.resolve(__dirname, 'wrapper.js')

function cli (args, useWrapper) {
  return new Promise((resolve, reject) => {
    cp.execFile(useWrapper ? wrapperPath : cliPath, args ? args.split(/\s/) : [], {
      encoding: 'utf8',
      env: Object.assign({}, process.env)
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
      chalk`{white chalk}          {cyan prod} ^2.3.2`,
      chalk`{white latest-version} {cyan prod} ^3.1.0`,
      chalk`{white ora}            {cyan prod} ^2.0.0`,
      chalk`{white semver}         {cyan prod} ^5.5.0`,
      chalk`{white sywac}          {cyan prod} ^1.2.0`
    ]))
    t.notOk(r.stderr)
  })
})

test('--dev includes dependencies and devDependencies', t => {
  return cli(`${parentPath} --dev`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod} ^2.3.2`,
      chalk`{white latest-version}   {cyan prod} ^3.1.0`,
      chalk`{white ora}              {cyan prod} ^2.0.0`,
      chalk`{white semver}           {cyan prod} ^5.5.0`,
      chalk`{white sywac}            {cyan prod} ^1.2.0`,
      chalk`{white coveralls}        {magenta dev}  ^3.0.0`,
      chalk`{white mockery}          {magenta dev}  ^2.1.0`,
      chalk`{white standard}         {magenta dev}  ^11.0.1`,
      chalk`{white standard-version} {magenta dev}  ^4.3.0`,
      chalk`{white tap}              {magenta dev}  ^11.1.3`
    ]))
    t.notOk(r.stderr)
  })
})

test('--all includes everything defined', t => {
  return cli(`${parentPath} --all`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod} ^2.3.2`,
      chalk`{white latest-version}   {cyan prod} ^3.1.0`,
      chalk`{white ora}              {cyan prod} ^2.0.0`,
      chalk`{white semver}           {cyan prod} ^5.5.0`,
      chalk`{white sywac}            {cyan prod} ^1.2.0`,
      chalk`{white coveralls}        {magenta dev}  ^3.0.0`,
      chalk`{white mockery}          {magenta dev}  ^2.1.0`,
      chalk`{white standard}         {magenta dev}  ^11.0.1`,
      chalk`{white standard-version} {magenta dev}  ^4.3.0`,
      chalk`{white tap}              {magenta dev}  ^11.1.3`
    ]))
    t.notOk(r.stderr)
  })
})

test('--sort sorts list', t => {
  return cli(`${parentPath} --all --sort`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white chalk}            {cyan prod} ^2.3.2`,
      chalk`{white coveralls}        {magenta dev}  ^3.0.0`,
      chalk`{white latest-version}   {cyan prod} ^3.1.0`,
      chalk`{white mockery}          {magenta dev}  ^2.1.0`,
      chalk`{white ora}              {cyan prod} ^2.0.0`,
      chalk`{white semver}           {cyan prod} ^5.5.0`,
      chalk`{white standard}         {magenta dev}  ^11.0.1`,
      chalk`{white standard-version} {magenta dev}  ^4.3.0`,
      chalk`{white sywac}            {cyan prod} ^1.2.0`,
      chalk`{white tap}              {magenta dev}  ^11.1.3`
    ]))
    t.notOk(r.stderr)
  })
})

test('--terse prints uncolored names only', t => {
  return cli(`${parentPath} --all --terse`).then(r => {
    t.equal(r.stdout, withLineFeeds(['chalk', 'latest-version', 'ora', 'semver', 'sywac', 'coveralls', 'mockery', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('fails if no package.json file', t => {
  return Promise.all([
    cli('dne').catch(err => {
      t.equal(err.code, 1)
      t.includes(err.message, `File ${path.join('dne', 'package.json')} does not exist :(`)
    }),
    cli('dne -v').catch(err => {
      t.equal(err.code, 1)
      t.includes(err.message, `File ${path.join('dne', 'package.json')} does not exist :(`)
    })
  ])
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
      chalk`{white @nexdrew/slugid}     {cyan prod}         ^2.0.0`,
      chalk`{white chai}                {magenta dev}          ^3.4.1`,
      chalk`{white chalk}               {magenta dev}          ^1.1.3`,
      chalk`{white cliui}               {cyan prod},{green bundled} ^3.2.0`,
      chalk`{white decamelize}          {cyan prod}         ^1.1.1`,
      chalk`{white dezalgo}             {green bundled}      unknown`,
      chalk`{white find-up}             {cyan prod},{magenta dev}     ^2.1.0`,
      chalk`{white fs-vacuum}           {green bundled}      unknown`,
      chalk`{white react}               {blue peer}         ^16.0.0`,
      chalk`{white react-dom}           {blue peer}         ^16.0.0`,
      chalk`{white react-router}        {yellow optional}     ^1.0.2`,
      chalk`{white redux-simple-router} {yellow optional}     ^1.0.1`,
      chalk`{white which}               {magenta dev}          ^1.2.9`,
      chalk`{white write-file-atomic}   {green bundled}      unknown`
    ]))
    t.notOk(r.stderr)
  })
})

test('-v looks up installed versions', t => {
  return cli(`${path.resolve(__dirname, 'all')} -asv`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid}     {cyan prod}         ^2.0.0  {inverse 2.0.1}         {blue 2.0.2}     {blue patch}`,
      chalk`{white chai}                {magenta dev}          ^3.4.1  {inverse not installed} {magenta 3.5.0}     {magenta in-range}`,
      chalk`{white chalk}               {magenta dev}          ^1.1.3  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white cliui}               {cyan prod},{green bundled} ^3.2.0  {inverse 3.3.0}         {yellow 3.4.0}     {yellow minor}`,
      chalk`{white decamelize}          {cyan prod}         ^1.1.1  {inverse 1.1.1}         {red 9.9.9}     {red major}`,
      chalk`{white dezalgo}             {green bundled}      unknown {inverse not installed} 9.9.9     ¯\\_(ツ)_/¯`,
      chalk`{white find-up}             {cyan prod},{magenta dev}     ^2.1.0  {inverse 2.1.0}         {green 2.1.0}`,
      chalk`{white fs-vacuum}           {green bundled}      unknown {inverse not installed} no latest ¯\\_(ツ)_/¯`,
      chalk`{white react}               {blue peer}         ^16.0.0 {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white react-dom}           {blue peer}         ^16.0.0 {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white react-router}        {yellow optional}     ^1.0.2  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white redux-simple-router} {yellow optional}     ^1.0.1  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white which}               {magenta dev}          ^1.2.9  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white write-file-atomic}   {green bundled}      unknown {inverse not installed} 9.9.9     ¯\\_(ツ)_/¯`
    ]))
    t.notOk(r.stderr)
  })
})

test('supports alt bundleDependencies', t => {
  return cli(`${path.resolve(__dirname, 'bundle-alt')} -xb`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white abbrev}     {green bundled} unknown`,
      chalk`{white ansi-regex} {green bundled} unknown`,
      chalk`{white ansicolors} {green bundled} unknown`,
      chalk`{white aproba}     {green bundled} unknown`
    ]))
    t.notOk(r.stderr)
  })
})
