import amqp from "amqplib"
import dotenv from "dotenv";

dotenv.config();


let channel: amqp.Channel;

export const connectRabbitMQ = async()=>{
    try {
        const connection = await amqp.connect({
            protocol:"amqp",
            port: 5672,
            hostname: process.env.RABBITMQ_HOSTNAME,
            username:process.env.RABBITMQ_USERNAME,
            password:process.env.RABBITMQ_PASSWORD
        })

        channel = await connection.createChannel();

        console.log("Connected Succesfully to RabbitMQ");
    } catch (error) {
        console.log("Failed to connect to RabbitMQ",error)
    }
}


export const publishToQueue = async(queueName:string,message:any) =>{
    if(!channel){
        console.log("RabbitMQ channel is not initialized");
    }

    channel.assertQueue(queueName,{durable:true});

    await channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{persistent:true});
}

export const invalidateCache = async(cacheKeys:string[]) =>{
    try {
        const message = {
            action:"invalidateCache",
            keys:cacheKeys
        }

        await publishToQueue("cache-invalidation",message);
        
        console.log("Cache Invalidation Job Pushed to Queue");
    } catch (error) {
        console.log("Failed to invalidate Cache: ",error);
    }
}
