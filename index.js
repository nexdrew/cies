'use strict'

const fs = require('fs')
const path = require('path')

function add (set, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    set.add(array[i])
  }
}

module.exports = function cies (opts) {
  opts = opts || {}
  const file = path.join(opts.dir || process.cwd(), 'package.json')
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') err = `File ${file} does not exist :(`
        return reject(err)
      }

      let pkg
      try {
        pkg = JSON.parse(data)
      } catch (e) {
        return reject(e)
      }

      const deps = new Set()
      if (pkg.dependencies && (opts.all || !opts.exclusive)) add(deps, Object.keys(pkg.dependencies))
      if (pkg.devDependencies && (opts.all || opts.dev)) add(deps, Object.keys(pkg.devDependencies))
      if (pkg.peerDependencies && (opts.all || opts.peer)) add(deps, Object.keys(pkg.peerDependencies))
      if ((pkg.bundledDependencies || pkg.bundleDependencies) && (opts.all || opts.bundled)) add(deps, pkg.bundledDependencies || pkg.bundleDependencies)
      if (pkg.optionalDependencies && (opts.all || opts.optional)) add(deps, Object.keys(pkg.optionalDependencies))
      const array = Array.from(deps)
      if (opts.sort) array.sort()
      resolve(array)
    })
  })
}
