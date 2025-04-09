import amqp from "amqplib";

async function sendMessage() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "hello";
    const msg = "hello world";

    await channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log("[x] Sent '%s'", msg);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("RabbitMQ Error:", error);
  }
}

sendMessage();
