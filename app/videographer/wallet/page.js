"use client";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化文件
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";

export default function Wallet({ userId }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  userId = user.uid;

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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Balance</h2>

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


      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-4">Bank Cards</h3>
        <div className="space-y-4">
          {wallet.cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              {/* 卡片信息 */}
              <div>
                <p className="text-sm font-semibold">{card.brand}</p>
                <p className="text-lg font-bold">
                  **** **** **** {card.last4}
                </p>
                <p className="text-sm text-gray-600">Expires {card.expiry}</p>
              </div>
              {/* 图标或卡片标识 */}
              <div className="text-right">
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                  {card.brand}
                </span>
              </div>
            </div>

          ))}

          <div className="grid grid-cols-1 gap-4">
            {wallet.cards.map((card) => (
              <div
                key={card.id}
                className="relative p-6 rounded-xl shadow-md text-white bg-gradient-to-r from-gray-800 to-gray-900"
              >
                {/* 芯片图标 */}
                <div className="absolute top-4 left-4">
                  <img src="/chip-icon.png" alt="Chip" className="h-6" />
                </div>

                {/* 银行卡品牌 */}
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">{card.brand}</p>
                  <img
                    src={`/card-icons/${card.brand.toLowerCase()}.png`}
                    alt={`${card.brand} logo`}
                    className="h-6"
                  />
                </div>

                {/* 卡号 */}
                <p className="text-xl font-bold tracking-widest mt-4">
                  **** **** **** {card.last4}
                </p>

                {/* 过期日期 */}
                <div className="flex justify-between mt-2 text-sm">
                  <p>Expires {card.expiry}</p>
                  <p>Card Holder</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {wallet.cards.map((card) => (
              <motion.div
                key={card.id}
                className="relative w-80 h-48 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-800 text-white p-6"
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
                    <p>Card Holder</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* 添加银行卡按钮 */}
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => alert("Add card modal")}
        >
          Add Card
        </button>
      </div>


      {/* 提现按钮 */}
      <button
        onClick={handleWithdraw}
        disabled={wallet.totalBalance - wallet.lockedAmount <= 0}
        className={`px-4 py-2 rounded ${wallet.totalBalance - wallet.lockedAmount > 0
          ? "bg-green-500 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        Withdraw
      </button>
    </div>
  );
}
