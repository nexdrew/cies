# ~~dependen~~cies

> List dependencies (in your terminal)

[![Build Status](https://travis-ci.org/nexdrew/cies.svg?branch=master)](https://travis-ci.org/nexdrew/cies)
[![Coverage Status](https://coveralls.io/repos/github/nexdrew/cies/badge.svg?branch=master)](https://coveralls.io/github/nexdrew/cies?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/nexdrew/cies.svg)](https://greenkeeper.io/)

List dependencies from package.json and easily compare installed version against latest version published.

Basically a smaller, simpler, faster [`npm-check`](https://github.com/dylang/npm-check).

## Examples

### List all dependencies and compare versions

![cies -av](https://user-images.githubusercontent.com/1929625/37691440-799199ee-2c88-11e8-8a57-b9a8b4581a68.png)

The columns of output are:
1. package name
2. type of dependency
3. semver range declared in package.json, if any
4. version installed in local node_modules, if any
5. latest published version, if any
6. semver difference between installed and latest, if any

### List all dependencies without version lookup

![cies -a](https://user-images.githubusercontent.com/1929625/37691583-5bd58da6-2c89-11e8-93d3-4889148b83ea.png)

### List only the names of all dependencies

![cies -at](https://user-images.githubusercontent.com/1929625/37691611-74fe8472-2c89-11e8-84dd-e6b90ee9ff99.png)

This makes it easy to pipe dependencies to another program, like [`nfo`](https://github.com/nexdrew/nfo):

```console
$ cies -at | xargs nfo dist-tags

chalk
{ latest: '2.3.2' }

latest-version
{ latest: '3.1.0' }

ora
{ latest: '2.0.0' }

semver
{ alpha: '2.0.0-alpha',
  beta: '2.0.0-beta',
  latest: '5.5.0',
  'v4-rc': '4.0.0' }

sywac
{ latest: '1.2.0' }

coveralls
{ latest: '3.0.0' }

mockery
{ latest: '2.1.0' }

standard
{ latest: '11.0.1' }

standard-version
{ latest: '4.3.0', next: '4.3.0-candidate.1' }

tap
{ latest: '11.1.3', next: '11.0.0-rc.3' }
```

## Install

```console
$ npm i -g cies
```

```console
$ cies --help
List dependencies from package.json

Usage: cies [dir] [options]

Arguments:
  [dir]  Optional path to directory containing package.json  [dir]

Options:
  -d, --dev        Include devDependencies               [boolean]
  -p, --peer       Include peerDependencies              [boolean]
  -b, --bundled    Include bundledDependencies           [boolean]
  -o, --optional   Include optionalDependencies          [boolean]
  -a, --all        Include dependencies from all types   [boolean]
  -x, --exclusive  Exclude production dependencies       [boolean]
  -s, --sort       Sort list before printing             [boolean]
  -v, --versions   Lookup installed and latest versions  [boolean]
  -t, --terse      Print names only, without color       [boolean]
  -h, --help       Print this help content               [boolean]
  -V, --version    Print cies program version            [boolean]
```

## License

ISC © Contributors
