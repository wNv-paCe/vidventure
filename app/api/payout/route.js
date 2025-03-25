import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, updateDoc, increment } from "firebase/firestore"; // Firestore 更新

export async function POST(req) {
    // 从请求体中提取参数
    const { stripeAccountId, bankAccountId, amount, userId } = await req.json();
    console.log(stripeAccountId, bankAccountId, amount);

    if (!bankAccountId) {
        return new Response(JSON.stringify({ error: "No bank card is bound, please add at least one." }), { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

        const payout = await stripe.payouts.create({
            amount: payoutAmount, // 金额（以分为单位）
            currency: "cad",
            destination: bankAccountId, // 银行账户 ID
        }, {
            stripeAccount: stripeAccountId // 指定是哪个 Connected Account
        });
        // const accounts = await stripe.accounts.listExternalAccounts(stripeAccountId, {
        //     object: "bank_account",
        // });
        // console.log(accounts);
        console.log(userId);
        const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
        //alert(card.id);
        await updateDoc(walletRef, { withdrawableBalance: increment(-amount) });

        return new Response(JSON.stringify({ success: true, payout }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
