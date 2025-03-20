import { response } from "express";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

    try {
        //console.log('req is', req);
        const { userId, stripeAccountId, accountNumber, routingNumber, email, country, currency } = await req.json();
        console.log(userId, stripeAccountId, accountNumber, routingNumber, email, country, currency);

        let finalStripeAccountId = stripeAccountId;

        if (!finalStripeAccountId) {
            console.log("Creating Stripe account");
            response = await fetch("http://localhost:3000/api/createStripeAccount", { // ❗ 使用完整 URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, country, email }),
            });

            if (!response.ok) {
                return NextResponse.json({ error: "Failed to create Stripe account" }, { status: 500 });
            }

            const data = await response.json();
            console.log(data);
            finalStripeAccountId = data.stripeAccountId; // 获取新创建的 Account ID
            console.log("finalStripeAccountId is", finalStripeAccountId);
        }

        // 绑定银行卡
        const bankAccount = await stripe.accounts.createExternalAccount(finalStripeAccountId, {
            external_account: {
                object: "bank_account",
                country,
                currency,
                account_number: accountNumber,
                routing_number: routingNumber,
            },
        });

        return NextResponse.json({ success: true, bankAccount });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
