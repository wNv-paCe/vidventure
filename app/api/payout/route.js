import Stripe from "stripe";

export async function POST(req) {
    // 从请求体中提取参数
    const { stripeAccountId, bankAccountId, amount } = await req.json();
    console.log(stripeAccountId, bankAccountId, amount);

    if (!bankAccountId) {
        return new Response(JSON.stringify({ error: "No bank card is bound, please add at least one." }), { status: 400 });
    }

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        const payoutAmount = parseInt(amount * 100); // $10 => 1000 cents

        // **设置 bankAccountId 为默认提现账户**
        // await stripe.accounts.update(stripeAccountId, {
        //     external_account: bankAccountId,
        // });

        //发起 Payout 到银行账户
        const transfer = await stripe.transfers.create({
            amount: payoutAmount, // 1 CAD (Stripe 以 cents 计)
            currency: "cad",
            destination: stripeAccountId, // 不是 `ba_` 开头的 ID，而是 `acct_` 开头的 Stripe 账户 ID
        });
        console.log(transfer);

        // const payout = await stripe.payouts.create({
        //     amount: payoutAmount,
        //     currency: "cad",
        //     destination: bankAccountId,
        // });

        return new Response(JSON.stringify({ success: true, transfer }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
