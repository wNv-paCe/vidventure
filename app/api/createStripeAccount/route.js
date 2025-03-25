import Stripe from "stripe";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化
import { doc, updateDoc } from "firebase/firestore"; // Firestore 更新
import { NextResponse } from "next/server"; // Next.js 响应

export async function POST(req) {
    // ✅ 使用安全的环境变量
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        // ✅ 解析 JSON 请求体
        const { userId, country, email } = await req.json();
        console.log("Received:", userId, country, email);

        // 1️⃣ 创建 Stripe Custom 账户
        const account = await stripe.accounts.create({
            type: "custom", // ✅ 改成 Custom 账户
            country,
            email,
            capabilities: {
                card_payments: { requested: true },
                //payouts: { requested: true }, // 请求 Payout 功能
                transfers: { requested: true },
            },
            business_type: "individual", // 个人账户（如果是公司可改为 "company"）
        });

        console.log("Created Stripe Custom Account:", account.id);


        // 3️⃣ 更新 Firestore 用户信息
        const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
        //alert(card.id);
        await updateDoc(walletRef, { stripeAccountID: account.id });
        // const userRef = doc(db, "users", userId);
        // await updateDoc(userRef, { stripeAccountID: account.id });

        return NextResponse.json({
            success: true,
            stripeAccountId: account.id,
            // onboardingUrl: accountLink.url, // 返回 Onboarding 链接
        });
    } catch (error) {
        console.error("Stripe Account Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
