'use strict'

const fs = require('fs')
const path = require('path')
const latestVersion = require('latest-version')
const semver = require('semver')

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

function addArray (deps, array, type) {
  let dep
  for (let i = 0, len = array.length; i < len; i++) {
    dep = deps.find(d => d.name === array[i])
    if (dep) dep.types.push(type)
    else deps.push({ types: [type], name: array[i], semver: 'unknown' })
  }
}

function addObject (deps, obj, type) {
  let dep
  for (const [name, semver] of Object.entries(obj)) {
    dep = deps.find(d => d.name === name)
    if (dep) dep.types.push(type)
    else deps.push({ types: [type], name, semver })
  }
}

module.exports = function cies (opts) {
  opts = opts || {}
  const baseDir = opts.dir || process.cwd()
  return readPackageJson(baseDir).then(pkg => {
    const deps = []
    if (pkg.dependencies && (opts.all || !opts.exclusive)) addObject(deps, pkg.dependencies, 'prod')
    if (pkg.devDependencies && (opts.all || opts.dev)) addObject(deps, pkg.devDependencies, 'dev')
    if (pkg.peerDependencies && (opts.all || opts.peer)) addObject(deps, pkg.peerDependencies, 'peer')
    if ((pkg.bundledDependencies || pkg.bundleDependencies) && (opts.all || opts.bundled)) addArray(deps, pkg.bundledDependencies || pkg.bundleDependencies, 'bundled')
    if (pkg.optionalDependencies && (opts.all || opts.optional)) addObject(deps, pkg.optionalDependencies, 'optional')
    if (opts.sort) deps.sort((a, b) => a.name.localeCompare(b.name))
    return deps
  }).then(deps => {
    if ((!opts.versions || (opts.terse && !opts.command)) && !opts.major && !opts.minor && !opts.patch) return deps

    const promises = []
    let scopeName
    deps.forEach(d => {
      scopeName = d.name.split('/')
      promises.push(Promise.all([
        readPackageJson(path.join(baseDir, 'node_modules', scopeName[0], scopeName[1] || ''), true),
        latestVersion(d.name)
      ]))
    })
    return Promise.all(promises).then(pkgs => {
      let pkgJson, latest
      for (let i = 0, len = pkgs.length; i < len; i++) {
        [pkgJson, latest] = pkgs[i]
        deps[i].version = (pkgJson && pkgJson.version) || 'not installed'
        deps[i].latest = latest || 'no latest'
        if ((deps[i].version !== 'not installed' || deps[i].semver !== 'unknown') && deps[i].latest !== 'no latest') {
          if (deps[i].version !== 'not installed') deps[i].diff = semver.diff(deps[i].version, deps[i].latest)
          else deps[i].diff = semver.satisfies(deps[i].latest, deps[i].semver) ? 'in-range' : 'out-of-range'
        } else {
          deps[i].diff = '¯\\_(ツ)_/¯'
        }
      }
      if (opts.major || opts.minor || opts.patch) {
        const matches = [/out/, /ツ/]
        if (opts.major) matches.push(/major/)
        if (opts.minor) matches.push(/minor/)
        if (opts.patch) matches.push(/patch/)
        return deps.filter(d => matches.some(regex => regex.test(d.diff)))
      }
      return deps
    })
  })
}
