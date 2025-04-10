import express, { Request, Response } from "express";
import amqp from "amqplib";
const app = express();
app.use(express.json());

const queue = "task_queue";

let channel: any = null;
let connection = null;
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
    console.log(" Connected to RabbitMQ");
  } catch (error) {
    console.error(" Failed to connect to RabbitMQ:", error);
  }
}

app.post("/send", async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    for (let i = 0; i < 10; i++) {
      const msg = `${message} ${i}`;
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
      });
      console.log("[x] Sent '%s'", msg);
    }

    res.json({ status: "10 messages sent" });
  } catch (error) {
    console.error("Error sending message:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
});

app.listen(3000, async () => {
  await connectRabbitMQ();
  console.log("Server listening on http://localhost:3000");
});
