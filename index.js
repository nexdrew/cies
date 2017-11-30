'use strict'

const fs = require('fs')
const path = require('path')

function readPackageJson (dir, ignoreNotFound) {
  const file = path.join(dir, 'package.json')
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          if (ignoreNotFound) return resolve()
          err = `File ${file} does not exist :(`
        }
        return reject(err)
      }

      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
    })
  })
}

function add (deps, array, type) {
  let dep
  for (let i = 0, len = array.length; i < len; i++) {
    dep = deps.find(d => d.name === array[i])
    if (dep) dep.types.push(type)
    else deps.push({ types: [type], name: array[i] })
  }
}

module.exports = function cies (opts) {
  opts = opts || {}
  const baseDir = opts.dir || process.cwd()
  return readPackageJson(baseDir).then(pkg => {
    const deps = []
    if (pkg.dependencies && (opts.all || !opts.exclusive)) add(deps, Object.keys(pkg.dependencies), 'prod')
    if (pkg.devDependencies && (opts.all || opts.dev)) add(deps, Object.keys(pkg.devDependencies), 'dev')
    if (pkg.peerDependencies && (opts.all || opts.peer)) add(deps, Object.keys(pkg.peerDependencies), 'peer')
    if ((pkg.bundledDependencies || pkg.bundleDependencies) && (opts.all || opts.bundled)) add(deps, pkg.bundledDependencies || pkg.bundleDependencies, 'bundled')
    if (pkg.optionalDependencies && (opts.all || opts.optional)) add(deps, Object.keys(pkg.optionalDependencies), 'optional')
    if (opts.sort) deps.sort((a, b) => a.name.localeCompare(b.name))
    return deps
  }).then(deps => {
    if (opts.terse || !opts.versions) return deps

    const promises = []
    let scopeName
    deps.forEach(d => {
      scopeName = d.name.split('/')
      promises.push(readPackageJson(path.join(baseDir, 'node_modules', scopeName[0], scopeName[1] || ''), true))
    })
    return Promise.all(promises).then(pkgs => {
      for (let i = 0, len = pkgs.length; i < len; i++) {
        deps[i].version = (pkgs[i] && pkgs[i].version) || 'not installed'
      }
      return deps
    })
  })
}
