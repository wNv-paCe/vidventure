import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, runTransaction } from "firebase/firestore";

export const config = {
  api: {
    bodyParser: false, // 禁用默认 JSON 解析，保持原始请求体
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await req.text(); // 读取原始请求体
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("Webhook received:", event.type);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 处理支付成功事件
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("Missing userId in metadata.");
      return new Response("Missing userId in metadata.", { status: 400 });
    }

    try {
      const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists()) {
          console.warn(`Wallet not found for user: ${userId}`);
          return;
        }

        const walletData = walletSnap.data();

        // 计算 Stripe 手续费（默认 2.9% + 0.30 CAD）
        const stripeFees = (session.amount_total * 0.029 + 30) / 100;
        const netAmount = session.amount_total / 100 - stripeFees;

        transaction.update(walletRef, {
          totalBalance: (walletData.totalBalance || 0) + netAmount,
          withdrawableBalance:
            (walletData.withdrawableBalance || 0) + netAmount,
          transactions: [
            ...(walletData.transactions || []), // 避免 `undefined` 问题
            {
              id: `txn_${Date.now()}`,
              amount: netAmount,
              type: "deposit",
              fees: stripeFees,
              timestamp: new Date().toISOString(),
            },
          ],
        });

        console.log(`Wallet updated for user ${userId}: +$${netAmount}`);
      });

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error("Error updating wallet:", error);
      return new Response("Error updating wallet.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: false }), { status: 400 });
}
