import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        const { stripeAccountId, amount } = req.body;

        if (!stripeAccountId) {
            return res.status(400).json({ error: "摄像师 Stripe 账户未注册" });
        }

        const payoutAmount = parseInt(amount * 100); // $10 => 1000 cents

        // 发起转账
        const transfer = await stripe.transfers.create({
            amount: payoutAmount,
            currency: "usd",
            destination: stripeAccountId,
        });

        return res.status(200).json({ success: true, transfer });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
