import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, runTransaction, arrayUnion } from "firebase/firestore";

// From GPT
export const config = {
  api: {
    bodyParser: false, // 禁用默认 JSON 解析，保持原始请求体
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// From Stripe
export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return new Response("Missing Stripe signature or webhook secret", {
      status: 400,
    });
  }

  let event;
  try {
    const rawBody = await req.text(); // 读取原始请求体
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log(
      "Webhook received:",
      event.type,
      "Session ID:",
      event.data.object.id
    );
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  // End from Stripe

  // 处理支付成功事件
  if (
    event.type === "charge.succeeded" ||
    event.type === "payment_intent.succeeded"
  ) {
    console.log(
      "Ignoring event:",
      event.type,
      "Session ID:",
      event.data.object.id
    );
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Processing checkout session:", {
      id: session.id,
      userId: session.metadata?.userId,
      videographerId: session.metadata?.videographerId,
      packageId: session.metadata?.packageId,
      amount: session.amount_total / 100,
    });

    const userId = session.metadata?.userId;
    const videographerId = session.metadata?.videographerId;
    const packageId = session.metadata?.packageId;
    const serviceTitle = session.metadata?.serviceTitle;

    if (!userId) {
      console.error("Missing userId in metadata.");
      return new Response("Missing userId in metadata.", { status: 400 });
    }

    if (!videographerId) {
      console.error("Missing videographerId in metadata.");
      return new Response("Missing videographerId in metadata.", {
        status: 400,
      });
    }

    try {
      const receiverWalletRef = videographerId
        ? doc(db, "users", videographerId, "wallet", "defaultWallet")
        : null;

      const transactionsRef = doc(db, "transactions", session.id);
      const netAmount = session.amount_total / 100;

      await runTransaction(db, async (transaction) => {
        // 交易类型为服务支付
        if (videographerId) {
          console.log("Routing to service_payment logic...");

          if (!receiverWalletRef) {
            console.error("Receiver wallet not found.");
            return new Response("Receiver wallet not found.", { status: 400 });
          }

          const receiverWalletSnap = await transaction.get(receiverWalletRef);
          if (!receiverWalletSnap.exists()) {
            console.warn(
              `Wallet not found for receiver: ${videographerId}, creating one...`
            );
            transaction.set(receiverWalletRef, {
              totalBalance: 0,
              withdrawableBalance: 0,
              lockedAmount: 0,
              transactions: [],
            });
          }

          // ✅ **检查 `receiverWalletRef` 里的交易是否已存在**
          const receiverWalletData = (
            await transaction.get(receiverWalletRef)
          ).data();
          const existingReceiverTransaction =
            receiverWalletData?.transactions?.some(
              (txn) => txn.id === session.id
            );
          if (existingReceiverTransaction) {
            console.warn(
              "Transaction already processed in receiver wallet or payer wallet, skipping..."
            );
            return;
          }

          transaction.set(transactionsRef, {
            id: session.id,
            payerId: userId,
            receiverId: videographerId,
            packageId: packageId,
            amount: netAmount,
            serviceTitle: serviceTitle,
            status: "pending",
            type: "service_payment",
            timestamp: new Date().toISOString(),
          });

          transaction.update(receiverWalletRef, {
            totalBalance:
              (receiverWalletSnap.data()?.totalBalance || 0) + netAmount,
            lockedAmount:
              (receiverWalletSnap.data()?.lockedAmount || 0) + netAmount,
            transactions: arrayUnion({
              id: session.id,
              amount: netAmount,
              type: "service_payment",
              timestamp: new Date().toISOString(),
            }),
          });

          console.log(`Locked funds for ${videographerId}: +$${netAmount}`);

          console.log(
            "Service payment processed successfully, stopping execution."
          );
          return;
        }
      });

      console.log("Completed transaction processing. Exiting webhook.");
      return;
    } catch (error) {
      if (error.message === "STOP_EXECUTION") {
        console.log("Webhook execution stopped after service_payment.");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
        });
      }
      console.error("Error updating wallet:", error);
      return new Response("Error updating wallet.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: false }), { status: 400 });
}
