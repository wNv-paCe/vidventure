import { db } from "@/lib/firebaseAdmin"; // 确保 Firebase Admin SDK 已初始化

export async function POST(req) {
    try {
        const { orderId, customerId } = await req.json();
        
        if (!orderId || !customerId) {
            return new Response(JSON.stringify({ error: "Missing required parameters." }), { status: 400 });
        }

        // 获取订单信息
        const orderRef = db.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return new Response(JSON.stringify({ error: "Order not found." }), { status: 404 });
        }

        const orderData = orderSnap.data();

        // 验证订单状态和付款人
        if (orderData.payer !== customerId) {
            return new Response(JSON.stringify({ error: "Unauthorized: You are not the payer of this order." }), { status: 403 });
        }
        if (orderData.status !== "unconfirmed") {
            return new Response(JSON.stringify({ error: "Order status is not 'unconfirmed'." }), { status: 400 });
        }

        // 获取交易记录
        const transactionRef = db.collection("transactions").doc(orderData.transactionId);
        const transactionSnap = await transactionRef.get();

        if (!transactionSnap.exists) {
            return new Response(JSON.stringify({ error: "Transaction not found." }), { status: 404 });
        }

        const transactionData = transactionSnap.data();
        const sellerId = transactionData.seller;
        const amount = transactionData.amount;

        // 更新卖家账户的资金信息
        const sellerRef = db.collection("users").doc(sellerId);
        await db.runTransaction(async (t) => {
            const sellerSnap = await t.get(sellerRef);
            if (!sellerSnap.exists) {
                throw new Error("Seller not found.");
            }

            const sellerData = sellerSnap.data();
            if (sellerData.lockedAmount < amount) {
                throw new Error("Insufficient locked funds.");
            }

            // 资金解锁
            t.update(sellerRef, {
                lockedAmount: sellerData.lockedAmount - amount,
                availableAmount: sellerData.availableAmount + amount
            });

            // 更新订单状态
            t.update(orderRef, { status: "confirmed" });
        });

        return new Response(JSON.stringify({ success: true, message: "Order confirmed successfully." }), { status: 200 });
    } catch (error) {
        console.error("Error confirming order:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
