import { RedisClientType, createClient } from "redis";

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private subscriptions: Map<string, string[]> = new Map();
    private reverseSubscriptions: Map<string, string[]> = new Map();
    private redisClient: RedisClientType;

    private constructor() {
        this.redisClient = createClient();
        this.redisClient.connect();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public unsubscribe(userId: string, subscription: string) {
        // const subscriptions = this.subscriptions.get(userId);
        // if (subscriptions) {
        //     this.subscriptions.set(userId, subscriptions.filter(s => s !== subscription));
        // }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscription, reverseSubscriptions.filter(s => s !== userId));
            if (this.reverseSubscriptions.get(subscription)?.length === 0) {
                this.reverseSubscriptions.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
    }

    public userLeft(userId: string) {
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
        this.subscriptions.set(userId, []);
    }
}