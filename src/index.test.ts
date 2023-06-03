import Keyv from 'keyv'
import KeyvNats from "./index";
import { NatsConnectionOptions, NatsContainer, StartedNatsContainer } from "testcontainers";
import { NatsConnectionImpl } from "nats/lib/nats-base-client/nats";

let options: NatsConnectionOptions
let container: StartedNatsContainer
beforeAll(async () => {
    container = await new NatsContainer("nats:2.9.17-alpine")
        .withArg('debug', '-DV')
        .withArg('jetstream', '-js')
        .withExposedPorts({
            container: 4222,
            host: 33124
        })
        .withReuse()
        .start();

    options = container.getConnectionOptions()
})

afterAll(async () => {
    await container.stop()
})

describe('Nats Keyv storage apapter',  () => {
    test('Basic initialization of NATS keyv adapter connection to NATS (using testcontainers)', async () => {
        const keyvNats = new KeyvNats(options);
        expect(keyvNats).toBeInstanceOf(KeyvNats);

        await keyvNats.connect();
        expect(keyvNats.client).toBeInstanceOf(NatsConnectionImpl);
        await keyvNats.disconnect();
    })

    test('Disconnect from nats server', async() => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        await keyvNats.disconnect();

        let err
        if (undefined !== keyvNats.client) {
            err = await keyvNats.client.closed();
        } else {
            err = "Nats client not initialized."
        }
        expect(err).toBe(undefined);
        await keyvNats.disconnect();
    })

    test('Set and get basic entries', async() => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        const key = 'foo'
        const value = 'bar'
        await keyvNats.set(key, value)

        expect(await keyvNats.get(key)).toBe(value)
        await keyvNats.disconnect();
    })

    test('Delete a key', async() => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        const key = 'to_be_deleted'
        const value = 'me'
        await keyvNats.set(key, value)

        expect(await keyvNats.get(key)).toBe(value)

        await keyvNats.delete(key)

        expect(await keyvNats.get(key)).toBe(undefined)

        await keyvNats.disconnect();
    })

    test('Clear all keys', async() => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        const key = 'to_be_deleted'
        const value = 'me'
        await keyvNats.set(key, value)

        expect(await keyvNats.get(key)).toBe(value)

        await keyvNats.clear()

        expect(await keyvNats.get(key)).toBe(undefined)

        await keyvNats.set(key, value)

        expect(await keyvNats.get(key)).toBe(value)

        await keyvNats.disconnect();
    })

    /**
     * setMany() is not supported yet by keyv-nats
     */
    test('Create 100 keys', async () => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        for (let i = 1; i < 100; i++) {
            const key = "foo" + Math.random()
            const value = "" + Math.random()
            await keyvNats.set(key, value)

            expect(await keyvNats.get(key)).toBe(value)
        }
        await keyvNats.disconnect();
    })

    test('Usage as keyv adapter', async () => {
        const keyvNats = new KeyvNats(options);
        await keyvNats.connect();
        const keyv = new Keyv({ store: keyvNats })

        const key = 'foo'
        const value = 'bar'
        await keyv.set(key, value)

        expect(await keyv.get(key)).toBe(value)
        await keyv.disconnect();
    })
})
