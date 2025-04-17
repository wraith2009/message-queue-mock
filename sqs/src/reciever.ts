import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

interface ConsumerOptions {
  region: string;
  queueUrl: string;
  maxMessages?: number;
  waitTimeSeconds?: number;
}

/**
 * Continuously polls SQS, processes and deletes messages.
 */
async function awsSQSConsumer(options: ConsumerOptions) {
  const { region, queueUrl, maxMessages = 5, waitTimeSeconds = 10 } = options;

  const sqs = new SQSClient({ region });

  const receiveParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: maxMessages,
    WaitTimeSeconds: waitTimeSeconds,
  };

  console.log(`🔄 Starting SQS consumer on ${queueUrl} (region=${region})`);

  while (true) {
    try {
      const { Messages } = await sqs.send(
        new ReceiveMessageCommand(receiveParams)
      );

      if (!Messages || Messages.length === 0) {
        continue;
      }

      for (const msg of Messages) {
        console.log(" Received:", msg.Body);

        if (msg.ReceiptHandle) {
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: msg.ReceiptHandle,
            })
          );
          console.log(`🗑️  Deleted message ${msg.MessageId}`);
        }
      }
    } catch (err) {
      console.error(" Consumer error:", err);
      await new Promise((r) => setTimeout(r, 5_000));
    }
  }
}

(async () => {
  const { AWS_REGION, SQS_QUEUE_URL } = process.env;
  if (!AWS_REGION || !SQS_QUEUE_URL) {
    console.error(
      "Missing AWS_REGION or SQS_QUEUE_URL in environment variables."
    );
    process.exit(1);
  }

  await awsSQSConsumer({
    region: AWS_REGION,
    queueUrl: SQS_QUEUE_URL,
    maxMessages: 5,
    waitTimeSeconds: 10,
  });
})();
