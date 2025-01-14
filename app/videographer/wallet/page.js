"use client";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化文件
import { getAuth } from "firebase/auth";

export default function Wallet({ userId }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  userId = user.uid;

  useEffect(() => {
    // const fetchWallet = async () => {
    //   //const walletRef = doc(db, "users", userId);
    //   const walletDocRef = doc(db, "users", userId, "wallet", "defaultWallet");

    //   const walletSnap = await getDoc(walletDocRef);
    //   if (walletSnap.exists()) {
    //     setWallet(walletSnap.data().wallet);
    //   }
    //   setLoading(false);
    // };

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
      

    // const fetchWallet = async () => {
    //     try {
    //       // 获取子集合引用
    //       const walletCollectionRef = collection(db, "users", userId, "wallet");
      
    //       // 获取子集合所有文档的快照
    //       const walletSnapshot = await getDocs(walletCollectionRef);
      
    //       // 提取数据
    //       const walletDocs = walletSnapshot.docs.map(doc => ({
    //         id: doc.id, // 文档 ID
    //         ...doc.data(), // 文档数据
    //       }));
      
    //       // 假设你希望处理的数据是第一个文档（如果只有一个文档的话）
    //       if (walletDocs.length > 0) {
    //         setWallet(walletDocs[0]); // 更新 React 状态
    //       } else {
    //         console.log("No wallet data found in the collection.");
    //       }
    //     } catch (error) {
    //       console.error("Error fetching wallet collection:", error);
    //     } finally {
    //       setLoading(false); // 停止加载指示器
    //     }
    //   };
      
    console.log("userId:", userId);

    fetchWallet();
  }, [userId]);
    //const totalBalance = Number(wallet.totalBalance);
    //const lockedAmount = Number(wallet.lockedAmount);


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
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>

      {/* 显示余额 */}
      <div className="mb-4">
        <p>Total Balance: ${(wallet.totalBalance ).toFixed(2)}</p>
        <p>Locked Amount: ${(wallet.lockedAmount ).toFixed(2)}</p>
        <p>Available Balance: ${((wallet.totalBalance - wallet.lockedAmount) / 100).toFixed(2)}</p>
      </div>

      {/* 显示银行卡 */}
      <div className="mb-4">
        <h3 className="font-semibold">Bank Cards</h3>
        <ul className="list-disc ml-5">
          {wallet.cards.map((card) => (
            <li key={card.id}>
              {card.brand} ending in {card.last4} (Expires {card.expiry})
            </li>
          ))}
        </ul>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => alert("Add card modal")}>
          Add Card
        </button>
      </div>

      {/* 提现按钮 */}
      <button
        onClick={handleWithdraw}
        disabled={wallet.totalBalance - wallet.lockedAmount <= 0}
        className={`px-4 py-2 rounded ${
          wallet.totalBalance - wallet.lockedAmount > 0
            ? "bg-green-500 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Withdraw
      </button>
    </div>
  );
}
