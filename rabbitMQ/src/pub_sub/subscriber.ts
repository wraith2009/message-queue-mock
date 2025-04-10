#!/usr/bin/env ts-node

import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";

async function startConsumer() {
  const exchange = "logs";

  try {
    const connection: any = await amqp.connect("amqp://localhost");
    const channel: Channel = await connection.createChannel();

    await channel.assertExchange(exchange, "fanout", { durable: false });

    const q = await channel.assertQueue("", { exclusive: true });

    console.log(`[*] Waiting for messages in ${q.queue}. To exit press CTRL+C`);

    await channel.bindQueue(q.queue, exchange, "");

    channel.consume(
      q.queue,
      (msg: ConsumeMessage | null) => {
        if (msg?.content) {
          console.log(`[x] ${msg.content.toString()}`);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}

startConsumer();
