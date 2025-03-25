import { useState, useEffect } from "react";
import KYCModal from "./KYCModal";

export default function WithdrawForm({ stripeAccountId, bankCards, userId, availableBalance }) {
    const [amount, setAmount] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [showModal, setShowModal] = useState(false); // 控制模态框的显示
    const [remediationLink, setRemediationLink] = useState(""); // 用于存储 remediationLink

    const handleModalClose = () => {
        setShowModal(false);
        // onSuccess({
        //     accountNumber: bankAccount.accountNumber,
        //     routingNumber: bankAccount.routingNumber,
        //     cardBrand: bankAccount.cardBrand
        // });
    };

    // 获取绑定的银行卡列表
    //console.log(stripeAccountId);
    useEffect(() => {
        async function fetchAccounts() {
            if (!stripeAccountId) {
                return new Response(JSON.stringify({ error: "No bank card is bound, please add at least one." }), { status: 400 });
            } // 确保 stripeAccountId 存在

            try {
                //console.log(stripeAccountId);
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getBankAccount?stripeAccountId=${stripeAccountId}`);
                const data = await res.json();

                if (data.error) {
                    console.error("Error fetching accounts:", data.error);
                    return;
                }

                if (Array.isArray(data.accounts) && data.accounts.length > 0) {
                    setAccounts(data.accounts);
                    setSelectedAccount(data.accounts[0].id);
                } else {
                    setAccounts([]);
                }
            } catch (error) {
                console.error("Failed to fetch accounts", error);
            }
        }

        fetchAccounts();
    }, [stripeAccountId, bankCards]); // 依赖 stripeAccountId，确保获取正确数据


    // 处理提现请求
    const handleWithdraw = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount.");
            return;
        }
        if(amount > availableBalance){
            setMessage("you little piece of shit, don't you see your available balance?");
            return;
        }
        if (!selectedAccount) {
            setMessage("Please select a bank account.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {

            const res_reme = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getRemediationLink?stripeAccountId=${stripeAccountId}`);
            const data_reme = await res_reme.json();
            if (data_reme.success && data_reme.requiresKYC) {

                setShowModal(true);
                //console.log(data_reme.remediationLink);
                setRemediationLink(data_reme.remediationLink);



                // 传递 `handleModalClose` 作为 `Modal` 关闭的回调
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stripeAccountId: stripeAccountId,
                    bankAccountId: selectedAccount,
                    amount: parseFloat(amount),
                    userId: userId,
                }),
            });
            //console.log(userId,availableBalance);

            const data = await res.json();
            if (res.ok) {
                setMessage("Withdrawal successful!");
            } else {
                setMessage(data.error || "Withdrawal failed.");
            }
        } catch (error) {
            setMessage("An error occurred while processing withdrawal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-bold">Withdraw Funds</h2>
                <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.last4}</option>
                    ))}
                </select>
                <button
                    onClick={handleWithdraw}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Withdraw"}
                </button>
                {message && <p className="text-center text-red-500">{message}</p>}
            </div>
            {showModal && (
                <KYCModal
                    remediationLink={remediationLink}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
