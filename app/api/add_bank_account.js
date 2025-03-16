import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        const { stripeAccountId, accountNumber, routingNumber, country, currency } = req.body;

        if (!stripeAccountId) {
            return res.status(400).json({ error: "摄像师 Stripe 账户未注册" });
        }

        // 绑定银行卡
        const bankAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
            external_account: {
                object: "bank_account",
                country,
                currency,
                account_number: accountNumber,
                routing_number: routingNumber,
            },
        });

        return res.status(200).json({ success: true, bankAccount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
