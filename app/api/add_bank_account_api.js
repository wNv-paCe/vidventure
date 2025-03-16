import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { userId, bankAccountNumber, routingNumber, country, currency } = req.body;

        if (!userId || !bankAccountNumber || !routingNumber || !country || !currency) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 模拟数据库查找用户的 Stripe 账户 ID（你可以改成 Firestore、MongoDB）
        let stripeAccountId = null; // 假设数据库里查到了这个用户的 stripeAccountId

        // 如果用户没有 Stripe Connected Account，就创建一个
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country,
                email: `user_${userId}@example.com`, // 这里可以改成真实邮箱
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                }
            });

            stripeAccountId = account.id;

            // 🚀 这里要把 stripeAccountId 存入数据库，方便下次使用
        }

        // 绑定银行卡
        const bankAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
            external_account: {
                object: "bank_account",
                country,
                currency,
                account_number: bankAccountNumber,
                routing_number: routingNumber
            }
        });

        return res.status(200).json({ message: "Bank account added successfully", bankAccount, stripeAccountId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
