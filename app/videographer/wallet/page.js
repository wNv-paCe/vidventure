"use client";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化文件
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";

export default function Wallet({ userId }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddCardForm, setShowAddCardForm] = useState(false); // 控制表单显示
  const auth = getAuth();
  const user = auth.currentUser;
  userId = user.uid;

  const [newCard, setNewCard] = useState({
    brand: "Visa",
    last4: "",
    expiry: "",
    cardHolder: "",
    type: "Credit",
  });

  const handleAddCard = async () => {
    if (!newCard.last4 || !newCard.expiry || !newCard.cardHolder) {
      alert("Please fill in all required fields.");
      return;
    }

    const newCardData = {
      id: crypto.randomUUID(),
      ...newCard,
    };

    // 更新 Firestore
    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    await updateDoc(walletRef, {
      cards: arrayUnion(newCardData),
    });

    // 更新前端状态
    setWallet((prev) => ({
      ...prev,
      cards: [...prev.cards, newCardData],
    }));

    // 清空表单
    setNewCard({
      brand: "Visa",
      last4: "",
      expiry: "",
      cardHolder: "",
      type: "Credit",
    });
    setShowAddCardForm(false); // 隐藏表单

    alert("Card added successfully!");
  };

  const handleRemoveCard = async (card) => {
    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    //alert(card.id);
    await updateDoc(walletRef, { cards: arrayRemove(card) });

    setWallet((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== card.id),
    }));
  };

  const cardVariants = {
    hover: { rotateY: 180, transition: { duration: 0.6 } },
  };

  useEffect(() => {


    const fetchWallet = async () => {
      const walletDocRef = doc(db, "users", userId, "wallet", "defaultWallet");
      const walletSnap = await getDoc(walletDocRef);

      if (walletSnap.exists()) {
        console.log("Wallet data:", walletSnap.data());
        setWallet(walletSnap.data());  // 更新钱包数据
      } else {
        console.log("No wallet data found.");
      }

      setLoading(false);  // 停止加载
    };

    console.log("userId:", userId);

    fetchWallet();
  }, [userId]);



  const handleWithdraw = async () => {
    if (!wallet) return;
    const availableBalance = wallet.totalBalance - wallet.lockedAmount;

    if (availableBalance > 0) {
      const walletRef = doc(db, "users", userId);
      await updateDoc(walletRef, {
        "wallet.totalBalance": wallet.totalBalance - availableBalance,
      });
      alert(`Withdrawn $${(availableBalance / 100).toFixed(2)}!`);
      setWallet((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance - availableBalance,
      }));
    } else {
      alert("No available balance to withdraw!");
    }
  };

  const handleTopUp = async () => { };

  if (loading) return <div>Loading wallet...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>

      {/* 显示余额 */}
      {/* <div className="mb-4">
        <p className="text-xl font-bold text-gray-800">
          Total Balance: <span className="text-blue-600">${wallet.totalBalance.toFixed(2)}</span>
        </p>
        <p className="text-lg text-red-500 font-semibold">
          Locked Amount: <span className="text-red-600">${wallet.lockedAmount.toFixed(2)}</span>
        </p>
        <p className="text-lg text-green-600 font-semibold">
          Available Balance: <span className="text-green-500">${(wallet.totalBalance - wallet.lockedAmount).toFixed(2)}</span>
        </p>
      </div> */}

      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-gray-800 mb-4">Account Balance</h3>

        {/* 进度条 */}
        <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-6 bg-red-500"
            style={{ width: `${(wallet.lockedAmount / wallet.totalBalance) * 100}%` }}
          ></div>
          <div
            className="absolute top-0 left-0 h-6 bg-green-500"
            style={{ width: `${((wallet.totalBalance - wallet.lockedAmount) / wallet.totalBalance) * 100}%` }}
          ></div>
        </div>

        {/* 金额信息 */}
        <div className="flex justify-between text-sm mt-2">
          <p className="text-blue-600 font-bold">Total: ${wallet.totalBalance.toFixed(2)}</p>
          <p className="text-red-500 font-semibold">Locked: ${wallet.lockedAmount.toFixed(2)}</p>
          <p className="text-green-600 font-semibold">Available: ${(wallet.totalBalance - wallet.lockedAmount).toFixed(2)}</p>
        </div>
      </div>

      {/* 提现按钮 */}
      <div className="flex justify-between mt-6">
        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={wallet.totalBalance - wallet.lockedAmount <= 0}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out ${wallet.totalBalance - wallet.lockedAmount > 0
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <i className="fas fa-arrow-down mr-2"></i> Withdraw
        </button>

        {/* TopUp Button */}
        <button
          onClick={handleTopUp} // 假设你已经实现了充值功能
          className="px-6 py-3 rounded-full text-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out"
        >
          <i className="fas fa-arrow-up mr-2"></i> Top Up
        </button>
      </div>


      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Bank Cards</h3>
        <div className="flex flex-wrap gap-4">
          {wallet.cards.map((card) => (
            <motion.div
              key={card.id}
              className={`relative w-80 h-48 rounded-xl shadow-lg text-white p-6 ${card.brand === 'Visa' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-yellow-600 to-yellow-800'} group`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute top-2 right-2 hidden group-hover:block z-10">
                <button
                  onClick={() => handleRemoveCard(card)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Remove
                </button>
              </div>
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <p className="text-lg font-semibold">{card.brand}</p>
                <p className="text-xl font-bold tracking-widest">**** **** **** {card.last4}</p>
                <div className="flex justify-between text-sm">
                  <p>Expires {card.expiry}</p>
                  <p>{card.cardHolder}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>



      {/* <div className="m-4">
        <h3 className="font-semibold text-lg mb-4">Bank Cards</h3>
        <div className="space-y-4">

          <div className="flex flex-wrap gap-4">
            {wallet.cards.map((card) => (
              <motion.div
                key={card.id}
                className={`relative w-80 h-48 rounded-xl shadow-lg text-white p-6 ${card.brand === 'Visa' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-yellow-600 to-yellow-800'}`}
                variants={cardVariants}
                whileHover="hover"
                style={{ perspective: 1000 }}
              >
                <motion.div className="absolute inset-0 flex flex-col justify-between p-4">
                  <p className="text-lg font-semibold">{card.brand}</p>
                  <p className="text-xl font-bold tracking-widest">
                    **** **** **** {card.last4}
                  </p>
                  <div className="flex justify-between text-sm">
                    <p>Expires {card.expiry}</p>
                    <p>{card.cardHolder}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </div> */}

      {/* "Add Card" 按钮 */}
      {!showAddCardForm && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddCardForm(true)}
        >
          Add Card
        </button>
      )}

      {/* 📌 添加银行卡表单 */}

      {showAddCardForm && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Add New Card</h3>

          <label className="block mb-2">
            Card Holder Name
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded"
              value={newCard.cardHolder}
              onChange={(e) => setNewCard({ ...newCard, cardHolder: e.target.value })}
            />
          </label>

          <label className="block mb-2">
            Card Number (Last 4 Digits)
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded"
              maxLength="4"
              pattern="\d{4}"
              value={newCard.last4}
              onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
            />
          </label>

          <label className="block mb-2">
            Expiry Date (MM/YY)
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded"
              placeholder="MM/YY"
              value={newCard.expiry}
              onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
            />
          </label>

          <label className="block mb-2">
            Card Brand
            <select
              className="w-full mt-1 p-2 border rounded"
              value={newCard.brand}
              onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
            >
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
            </select>
          </label>

          <button
            className="mt-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddCard}
          >
            Add Card
          </button>

          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setShowAddCardForm(false)}
          >
            Cancel
          </button>
        </div>
      )}



    </div>
  );
}
