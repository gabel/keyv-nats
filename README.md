# keyv-nats

> NATS storage adapter for the awesome [keyv](https://github.com/jaredwray/keyv).

[![build](https://github.com/gabel/keyv-nats/actions/workflows/tests.yaml/badge.svg)](https://github.com/gabel/keyv-nats/actions/workflows/tests.yaml)
[![codecov](https://codecov.io/github/gabel/keyv-nats/branch/main/graph/badge.svg?token=0Z1LP396MP)](https://codecov.io/github/gabel/keyv-nats)
[![GitHub license](https://img.shields.io/github/license/gabel/keyv-nats)](https://github.com/gabel/keyv-nats/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/keyv-nats)](https://npmjs.com/package/keyv-nats)

## Installation

```shell
yarn add keyv keyv-nats
```

## Usage

```typescript
import Keyv from 'keyv'
import KeyvNats from 'keyv-nats'

const keyvNats = new KeyvNats({ servers: "localhost:4222" });
await keyvNats.connect();
const keyv = new Keyv({ store: keyvNats })

const key = 'foo'
const value = 'bar'

await keyv.set(key, value)

await keyv.get(key)

keyv.disconnect();
```

## Tests

NATS Keyv storage adapter uses [Testcontainers for NodeJS](https://node.testcontainers.org/) in order to run 
NATS server during test automation. Please check [general Docker requirements](https://www.testcontainers.org/supported_docker_environment/) 
of Testcontainers to run those in your local docker environment.

```shell
# nothing else required as testcontainer will start and stop nats
yarn test
```
