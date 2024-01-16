import { EventEmitter } from 'events';
import type { Store } from 'keyv';
import { connect, NatsConnection, ConnectionOptions, JetStreamClient, KV, StringCodec } from "nats";
import seedrandom from "seedrandom";

type KeyvNatsOptions = ConnectionOptions & {
    ttl?: number,
    namespace?: string
}

class KeyvNats<Value = any> extends EventEmitter implements Store<Value> {
    public ttlSupport = true;
    public client: NatsConnection | undefined = undefined
    public opts: KeyvNatsOptions = {servers: 'localhost:4222'}
    public jetStream: JetStreamClient | undefined = undefined
    private namespace: string = 'keyv'
    /**
     * Time to live in milliseconds
     * @private ttl
     */
    private ttl: number = 0
    public keyValueBucket: KV | undefined

    constructor(options?: KeyvNatsOptions) {
        super();
        this.opts = options || this.opts
        this.namespace = this.opts.namespace || this.namespace
        this.ttl = this.opts.ttl || this.ttl
    }

    public async connect() {
        try {
            this.client = await connect(this.opts)
            this.jetStream = this.client.jetstream()
            await this.createBucket()
        } catch (error) {
            this.emit('error', error)
        }
        return this.client
    }

    private async createBucket() {
        if (this.jetStream)
            this.keyValueBucket = await this.jetStream.views.kv(this.namespace, {
                ttl: this.ttl
            });
    }

    public async disconnect() {
        return this.client !== undefined ? await this.client.close() : false;
    }

    /**
     * Deletes the bucket and recreates it
     */
    clear(): void | Promise<void> {
        if (this.keyValueBucket)
            return this.keyValueBucket.destroy().then(() => {
                this.createBucket().then(() => {
                    return
                })
            })
    }

    delete(key: string): boolean | Promise<boolean> {
        if (this.keyValueBucket)
            return this.keyValueBucket.delete(getRandomisedKey(key)).then(() => {
                return true
            })

        return false;
    }

    get(key: string): Promise<Value | undefined> | Value | undefined {
        if (this.keyValueBucket)
            // @ts-expect-error - Value needs to be number, string or buffer
            return this.keyValueBucket.get(getRandomisedKey(key)).then((kvValue) => {
                if (kvValue) {
                    const value = StringCodec().decode(kvValue.value)
                    return value ? value : undefined
                }
            }).catch((reason) => {
                // catch get for the clear all case, when bucket is not re-created yet
            })

        return undefined
    }

    set(key: string, value: Value): any {
        if (this.keyValueBucket)
            // @ts-expect-error - Value needs to be number, string or buffer
            return this.keyValueBucket.put(getRandomisedKey(key), StringCodec().encode(value))

        return undefined
    }
}

/**
 * Key's can be complex jsons. This function generates a random but unique int 32 value for the given json.
 * This makes the key valid to store in the NATS's kv bucket.
 */
const getRandomisedKey = (key: string) => {
    return seedrandom(key.replace(":","_")).int32().toString()
}

export = KeyvNats