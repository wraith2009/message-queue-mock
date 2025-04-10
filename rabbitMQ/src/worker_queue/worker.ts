import amqp from "amqplib";

const queue = "task_queue";

async function receiveMessages() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });

    console.log(
      `[*] Waiting for messages in "${queue}". Press CTRL+C to exit.`
    );

    channel.consume(
      queue,
      (msg) => {
        if (msg) {
          const content = msg.content.toString();
          const secs = content.split(".").length - 1;

          console.log(`[x] Received: "${content}"`);
          setTimeout(() => {
            console.log("[x] Done\n");
          }, secs * 1000);
        }
      },
      { noAck: true } // Auto-acknowledge
    );
  } catch (error) {
    console.error("RabbitMQ Consumer Error:", error);
  }
}

receiveMessages();
