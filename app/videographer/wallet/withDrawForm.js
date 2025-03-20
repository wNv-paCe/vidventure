import { useState } from "react";

export default function WithdrawForm({ stripeAccountId }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 处理提现请求
  const handleWithdraw = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (!stripeAccountId) {
      setMessage("No bank account is linked.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeAccountId,
          amount: parseFloat(amount),
        }),
      });

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Withdraw Funds</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleWithdraw}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
      {message && <p className="text-center text-red-500">{message}</p>}
    </div>
  );
}
