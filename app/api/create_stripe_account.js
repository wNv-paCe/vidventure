import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        const { userId, country, email } = req.body;

        // 1️⃣ 创建 Stripe Connected Account
        const account = await stripe.accounts.create({
            type: "express",
            country,
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            }
        });

        // 🚀 把 account.id 存入数据库
        // await firestore.collection("users").doc(userId).update({ stripeAccountId: account.id });

        return res.status(200).json({ success: true, stripeAccountId: account.id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
