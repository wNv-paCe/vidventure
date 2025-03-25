import Stripe from "stripe";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化文件
import { doc, updateDoc } from "firebase/firestore"; // 确保正确导入
import { NextResponse } from "next/server"; // ✅ 使用 Next.js 响应方式

export async function POST(req) {

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
    

    try {
        const { userId, country, email } = await req.json(); // ✅ 使用 `await req.json()` 解析请求体
        console.log("received", userId, country, email);

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
        const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
            //alert(card.id);
            await updateDoc(walletRef, { stripeAccountID: account.id });

        return NextResponse.json({ success: true, stripeAccountId: account.id });
    } catch (error) {
        console.error("Stripe Account Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
        
    }
}
