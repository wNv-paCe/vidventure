import { useState } from "react";

export default function KYCModal({ remediationLink, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-red-600">⚠️ Verify Your Account</h2>
                <p className="mb-4 text-gray-700">
                    Your account is not verified yet. You need to complete verification before withdrawing funds.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => window.location.href = remediationLink}
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
