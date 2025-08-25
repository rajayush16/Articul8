import amqp from "amqplib"
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage{
    action:string;
    keys:string[];
}

export const startCacheConsumer = async()=>{
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username:"admin",
            password:"admin123"
        });

        const channel = await connection.createChannel();

        const queueName = "cache-invalidation";
        
        await channel.assertQueue(queueName,{durable:true});

        console.log("Blog service cache consumer started");

        channel.consume(queueName,async(msg)=>{
            if(msg){
                try {
                    const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage;

                    console.log("Blog service received cache invalidation message",content);

                    if(content.action == "invalidateCache"){
                        for(const pattern of content.keys){
                            const keys = await redisClient.keys(pattern);

                            if(keys.length > 0){
                                await redisClient.del(keys);

                                console.log(`Blog service invalidated ${keys.length}, cache key invalidated ${pattern}`);

                                const searchQuery = "";
                                const category = "";

                                const cacheKey = `blogs:${searchQuery}:${category}`;

                                const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

                                await redisClient.set(cacheKey,JSON.stringify(blogs),{EX:3600});

                                console.log("Cache Rebuild: ",cacheKey);
                            }
                        }
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.log("Error processing cache invalidation in blog service",error);
                    channel.nack(msg,false,true);
                }
            }
        })
    } catch (error) {
        console.log("Failed to start service consumer",error);
    }
}