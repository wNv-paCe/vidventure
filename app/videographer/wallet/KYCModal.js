import { useState } from "react";

export default function KYCModal({ remediationLink, onClose, onSuccess, bankAccount }) {
    const handleVerifyNow = () => {
        // 只有在有 `onSuccess` 和 `bankAccount` 时才执行数据传递
        if (onSuccess && bankAccount) {
            onSuccess({
                accountNumber: bankAccount.accountNumber,
                routingNumber: bankAccount.routingNumber,
                cardBrand: bankAccount.cardBrand
            });
        }

        // 然后跳转到 KYC 页面
        window.location.href = remediationLink;
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-red-600">⚠️ Verify Your Account</h2>
                <p className="mb-4 text-gray-700">
                    Your account is not verified yet. You need to complete verification before withdrawing funds.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleVerifyNow}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Verify Now
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                    >
                        Remind Me Later
                    </button>
                </div>
            </div>
        </div>
    );
}
