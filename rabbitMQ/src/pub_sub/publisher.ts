import express, { Request, Response } from "express";
import amqp from "amqplib";
const app = express();
app.use(express.json());

const queue = "pub_sub";

let channel: any = null;
let connection = null;
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertExchange("logs", "fanout", { durable: false });
    console.log(" Connected to RabbitMQ");
  } catch (error) {
    console.error(" Failed to connect to RabbitMQ:", error);
  }
}

app.post("/send", async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const msg = `${message}`;
    channel.publish("logs", "", Buffer.from(msg), {
      persistent: true,
    });
    console.log("[x] Sent '%s'", msg);

    res.json({ status: " messages sent" });
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
