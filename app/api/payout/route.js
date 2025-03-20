import Stripe from "stripe";

export async function POST(req) {
    // 从请求体中提取参数
    const { stripeAccountId, amount } = await req.json();

    if (!stripeAccountId) {
        return new Response(JSON.stringify({ error: "No bank card is bound, please add at least one." }), { status: 400 });
    }

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        const payoutAmount = parseInt(amount * 100); // $10 => 1000 cents

        // 发起 Payout 到银行账户
        const payout = await stripe.payouts.create({
            amount: payoutAmount,
            currency: "cad",
            destination: stripeAccountId,
        });

        return new Response(JSON.stringify({ success: true, payout }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
