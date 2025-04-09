import amqp from "amqplib";

async function receiveMessages() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "hello";

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log(
      `[x] Waiting for messages in queue: "${queue}". Press CTRL+C to exit.`
    );

    channel.consume(
      queue,
      (msg) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log(`[x] Received: '${messageContent}'`);

          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("RabbitMQ Consumer Error:", error);
  }
}

receiveMessages();
