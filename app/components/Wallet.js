"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;

  const [newCard, setNewCard] = useState({
    brand: "Visa",
    last4: "",
    expiry: "",
    cardHolder: "",
    type: "Credit",
  });

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);
    getDoc(userDocRef).then((userSnap) => {
      if (userSnap.exists()) {
        // setUserType(userSnap.data().type || "client"); // Removed
      }
    });

    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    const unsubscribe = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        setWallet(doc.data());
        setLoading(false);
      } else {
        console.warn("No wallet found, creating one...");
        setDoc(walletRef, {
          totalBalance: 0,
          lockedAmount: 0,
          withdrawableBalance: 0,
          cards: [],
          transactions: [],
        }).then(() => {
          setWallet({
            totalBalance: 0,
            lockedAmount: 0,
            withdrawableBalance: 0,
            cards: [],
            transactions: [],
          });
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [userId]);

  /** 处理提现逻辑 */
  const handleWithdraw = async () => {
    if (
      !wallet ||
      withdrawAmount <= 0 ||
      withdrawAmount > wallet.withdrawableBalance
    ) {
      alert("Invalid withdraw amount.");
      return;
    }

    try {
      const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
      await updateDoc(walletRef, {
        withdrawableBalance: wallet.withdrawableBalance - withdrawAmount,
        transactions: arrayUnion({
          id: `txn_${Date.now()}`,
          amount: -withdrawAmount,
          type: "withdrawal",
          timestamp: new Date().toISOString(),
        }),
      });

      alert(`Withdrawal request submitted for $${withdrawAmount}`);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Failed to process withdrawal.");
    }
  };

  /** 处理添加银行卡 */
  const handleAddCard = async () => {
    if (!/^[A-Za-z\s]+$/.test(newCard.cardHolder)) {
      alert("Card holder name can only contain letters and spaces.");
      return;
    }

    if (!/^\d{4}$/.test(newCard.last4)) {
      alert("Last 4 digits of card number must be exactly 4 digits.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(newCard.expiry)) {
      alert("Expiry date must be in MM/YY format (e.g., 11/25).");
      return;
    }

    const newCardData = {
      id: crypto.randomUUID(),
      ...newCard,
    };

    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    await updateDoc(walletRef, {
      cards: arrayUnion(newCardData),
    });

    setWallet((prev) => ({
      ...prev,
      cards: [...prev.cards, newCardData],
    }));

    setNewCard({
      brand: "Visa",
      last4: "",
      expiry: "",
      cardHolder: "",
      type: "Credit",
    });
    setShowAddCardForm(false);
    alert("Card added successfully!");
  };

  /** 处理删除银行卡 */
  const handleRemoveCard = async (card) => {
    console.log("Attempting to remove card:", card);

    if (!wallet || !wallet.cards || wallet.cards.length === 0) {
      console.error("No wallet or cards found.");
      return;
    }

    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");

    try {
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        console.log("Wallet data before update:", walletSnap.data());
      } else {
        console.error("Wallet document not found!");
        return;
      }

      await updateDoc(walletRef, {
        cards: arrayRemove(card),
      });

      setWallet((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== card.id),
      }));

      console.log("Card removed successfully!");
    } catch (error) {
      console.error("Error removing card:", error);
    }
  };

  if (loading) return <div>Loading wallet...</div>;
  if (!wallet) return <div>No wallet found.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>

      {/* 账户余额展示 */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-gray-800 mb-4">Account Balance</h3>
        <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-6 bg-red-500"
            style={{
              width: `${(wallet.lockedAmount / wallet.totalBalance) * 100}%`,
            }}
          ></div>
          <div
            className="absolute top-0 left-0 h-6 bg-green-500"
            style={{
              width: `${
                ((wallet.totalBalance - wallet.lockedAmount) /
                  wallet.totalBalance) *
                100
              }%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <p className="text-blue-600 font-bold">
            Total: ${wallet.totalBalance.toFixed(2)}
          </p>
          <p className="text-red-500 font-semibold">
            Locked: ${wallet.lockedAmount.toFixed(2)}
          </p>
          <p className="text-green-600 font-semibold">
            Available: ${wallet.withdrawableBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 提现功能 */}
      <div className="mt-4">
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="border p-2 mr-2 w-24"
          placeholder="Amount"
          min="0"
          max={wallet.withdrawableBalance}
          step={10}
        />
        <button
          onClick={handleWithdraw}
          disabled={wallet.withdrawableBalance <= 0}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            wallet.withdrawableBalance > 0
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Withdraw Funds
        </button>
      </div>

      {/* 添加/管理银行卡 */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Bank Cards</h3>
        <div className="flex flex-wrap gap-4">
          {wallet.cards.map((card) => (
            <motion.div
              key={card.id}
              className="relative w-80 h-48 rounded-xl shadow-lg text-white p-6 bg-blue-600 group hover:opacity-100 overflow-visible"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Remove button clicked");
                    handleRemoveCard(card);
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <p className="text-lg font-semibold">{card.brand}</p>
                <p className="text-xl font-bold tracking-widest">
                  **** **** **** {card.last4}
                </p>
                <div className="flex justify-between text-sm">
                  <p>Expires {card.expiry}</p>
                  <p>{card.cardHolder}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 添加银行卡表单 */}
      {!showAddCardForm && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddCardForm(true)}
        >
          Add Card
        </button>
      )}
      {showAddCardForm && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow-md">
          <h3 className="font-semibold mb-2">Enter Card Details</h3>

          <input
            type="text"
            placeholder="Card Holder Name"
            value={newCard.cardHolder}
            onChange={(e) =>
              setNewCard({ ...newCard, cardHolder: e.target.value })
            }
            className="w-full border p-2 mb-2"
          />

          <input
            type="text"
            placeholder="Last 4 digits"
            maxLength="4"
            value={newCard.last4}
            onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
            className="w-full border p-2 mb-2"
          />

          <input
            type="text"
            placeholder="Expiry (MM/YY)"
            value={newCard.expiry}
            onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
            className="w-full border p-2 mb-2"
          />

          <select
            value={newCard.brand}
            onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
            className="w-full border p-2 mb-2"
          >
            <option value="Visa">Visa</option>
            <option value="MasterCard">MasterCard</option>
            <option value="Amex">American Express</option>
          </select>

          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleAddCard}
          >
            Save Card
          </button>

          <button
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => setShowAddCardForm(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
