const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("stripeAccountId");

        // 获取 Stripe 账户信息
        const account = await stripe.accounts.retrieve(accountId);

        // 检查是否需要补充 KYC 信息
        const requiresKYC = account.requirements.currently_due.length > 0;

        if (requiresKYC) {
            // 生成 Remediation Link
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: "http://localhost:3000/videographer/wallet",
                return_url: "http://localhost:3000/videographer/wallet",
                type: "account_update"
            });

            return new Response(JSON.stringify({ success: true, requiresKYC: true, remediationLink: accountLink.url }), { status: 200 });
        }

        return new Response(JSON.stringify({ success: true, requiresKYC: false, message: "KYC is already completed." }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, requiresKYC: false, error: error.message }), { status: 500 });
    }
}
