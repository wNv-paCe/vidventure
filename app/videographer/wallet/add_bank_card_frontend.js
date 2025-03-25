
import { useState } from "react";
import KYCModal from "./KYCModal";

const BankAccountForm = ({ Id, stripeAccountId, userEmail, onSuccess, onCancel }) => {
    const [bankAccount, setBankAccount] = useState({
        userId: Id,
        accountNumber: "",
        routingNumber: "",
        cardBrand: "",
        email: userEmail,
        country: "CA",
        currency: "cad",
    });

    const [showModal, setShowModal] = useState(false); // 控制模态框的显示
    const [remediationLink, setRemediationLink] = useState(""); // 用于存储 remediationLink

    // ✅ 等用户手动关闭模态框后再调用 `onSuccess`
    const handleModalClose = () => {
        setShowModal(false);
        onSuccess({
            accountNumber: bankAccount.accountNumber,
            routingNumber: bankAccount.routingNumber,
            cardBrand: bankAccount.cardBrand
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(bankAccount);

        const response_bank = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/addBankAccount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stripeAccountId, ...bankAccount }),
        });


        const data_bank = await response_bank.json();
        if (data_bank.success) {
            alert("The bank account is successfully bound!");
            // console.log(data_bank);
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getRemediationLink?stripeAccountId=${data_bank.finalStripeAccountId}`);
            const data = await res.json();
            if (data.success && data.requiresKYC) {

                setShowModal(true);
                //console.log(data.remediationLink);
                setRemediationLink(data.remediationLink);

                

                // 传递 `handleModalClose` 作为 `Modal` 关闭的回调
                return;

            }
            onSuccess({ accountNumber: bankAccount.accountNumber, routingNumber: bankAccount.routingNumber, cardBrand: bankAccount.cardBrand }); // 把银行卡数据传给父组件

        } else {
            alert("Binding Failure:" + data_bank.error);
        }
    };

    // 👇 在 Modal 关闭时调用 onSuccess
    // const handleModalClose = () => {
    //     setShowModal(false);
    //     onSuccess({
    //         accountNumber: bankAccount.accountNumber,
    //         routingNumber: bankAccount.routingNumber,
    //         cardBrand: bankAccount.cardBrand
    //     });
    // };

    return (
        <div>


            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Binding bank account</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Bank Account Number</label>
                    <input
                        type="text"
                        placeholder="Enter bank account number"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Routing Number</label>
                    <input
                        type="text"
                        placeholder="Enter routing number"
                        value={bankAccount.routingNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, routingNumber: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1 mt-4">Card Brand</label>
                    <select
                        value={bankAccount.cardBrand}
                        onChange={(e) => setBankAccount({ ...bankAccount, cardBrand: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Select Card Brand</option>
                        <option value="MasterCard">MasterCard</option>
                        <option value="Visa">Visa</option>
                    </select>
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Add Card
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* 在银行卡绑定成功后显示模态框 */}
            {showModal && (
                <KYCModal
                    remediationLink={remediationLink}
                    onClose={handleModalClose}
                    onSuccess={onSuccess}
                    bankAccount={bankAccount}
                />
            )}
        </div>

    );
};

export default BankAccountForm;
