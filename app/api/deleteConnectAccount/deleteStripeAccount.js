import Stripe from "stripe";

const stripe = new Stripe("sk_test_51Qu6bTD5mmGmKdJV3aXcuTxzQ0QBFSFzj2qP3hiDe99AOU6ImAm9ZAxE8LHRvPYxwkZMsCa8uxAEciSl3vxHP1k100DTuk0dPm"); // 你的 Stripe Secret Key

// 🔴 直接在这里填入要删除的 Connect Account ID
const accountId = "acct_1R5cLTD86XUVdnFH";

async function deleteAccount() {
    try {
        // 2️⃣ 删除账户
        const deletedAccount = await stripe.accounts.del(accountId);

        console.log(`✅ 账户 ${accountId} 删除成功:`, deletedAccount.deleted);
    } catch (error) {
        console.error("❌ 删除账户失败:", error.message);
    }
}

// 运行删除函数
deleteAccount();
