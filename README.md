# ~~dependen~~cies

> List dependencies (in your terminal)

[![Build Status](https://travis-ci.org/nexdrew/cies.svg?branch=master)](https://travis-ci.org/nexdrew/cies)
[![Coverage Status](https://coveralls.io/repos/github/nexdrew/cies/badge.svg?branch=master)](https://coveralls.io/github/nexdrew/cies?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Simple CLI to list (different types of) dependencies from a package.json file.

Why? Because:

1. I think `cat package.json | json dependencies | json -ka` is a bit convoluted
2. I'm tired of using the alias `node -e '\''Object.keys(require("./package.json").dependencies).forEach(x => console.log(x))'\''` on every machine
3. I want something slightly more robust (support for devDependencies and directories other than cwd).

**New in version 2**: Output name, types, and locally installed version (with `-v` flag) of each dependency!

```console
$ cies -asv
chalk            prod 2.3.0
coveralls        dev  3.0.0
standard         dev  10.0.3
standard-version dev  4.2.0
sywac            prod 1.2.0
tap              dev  10.7.2
```

When piping stdout to another program, `cies` will infer the `--terse` flag to only print dependency names without color. Here's an example, using [`nfo`](https://github.com/nexdrew/nfo) to easily query npm:

```console
$ cies | xargs nfo dist-tags

next
{ latest: '4.1.0', beta: '4.0.0-beta.6' }

react
{ latest: '16.0.0',
  '0.10.0-rc1': '0.10.0-rc1',
  '0.11.0-rc1': '0.11.0-rc1',
  next: '16.0.0-rc.3',
  dev: '15.5.0-rc.2',
  '0.14-stable': '0.14.9',
  '15-next': '15.6.0-rc.1' }

react-dom
{ latest: '16.0.0',
  next: '16.0.0-rc.3',
  dev: '15.5.0-rc.2',
  '0.14-stable': '0.14.9',
  '15-next': '15.6.0-rc.1' }
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
  -v, --versions   Lookup current installed versions     [boolean]
  -t, --terse      Print names only, without color       [boolean]
  -h, --help       Print this help content               [boolean]
  -V, --version    Print cies program version            [boolean]
```

## License

ISC © Contributors
