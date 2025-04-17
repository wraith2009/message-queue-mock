import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

interface SendResult extends SendMessageCommandOutput {}

/**
 * Sends a JSON message to the given SQS queue.
 * @param sqs      An initialized SQSClient
 * @param queueUrl The full URL of the target queue
 * @param body     Any JSON‑serializable object
 */
async function awsSendMessage(
  sqs: SQSClient,
  queueUrl: string,
  body: object
): Promise<SendResult> {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(body),
  });

  try {
    const result = await sqs.send(command);
    console.log(" Sent message:", result.MessageId);
    return result;
  } catch (err) {
    console.error(" SQS send error:", err);
    throw err;
  }
}

(async () => {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    SQS_QUEUE_URL,
  } = process.env;

  if (
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !AWS_REGION ||
    !SQS_QUEUE_URL
  ) {
    console.error(
      "Missing one of AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, or SQS_QUEUE_URL"
    );
    process.exit(1);
  }

  const sqsClient = new SQSClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    await awsSendMessage(sqsClient, SQS_QUEUE_URL, { message: "hello" });
  } catch {
    process.exit(1);
  }
})();
