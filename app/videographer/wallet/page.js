"use client";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from "@/app/_utils/firebase"; // Firebase 初始化文件
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import AddBankAccount from "./add_bank_card_frontend";
import BankAccountForm from "./add_bank_card_frontend";
import WithdrawForm from "./withDrawForm";

//{userID} or {param.userID}, {param} is the object passed from the router,destructuring is used to get the userID from the object

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  //const [availableBalanceUpdated, setAvailableBalanceUpdated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddCardForm, setShowAddCardForm] = useState(false); // 控制表单显示
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;
  const userEmail = user?.email;
  //const userStripeAccountID = wallet.stripeAccountID;
  //console.log(wallet);
  //console.log(user);

  //new card state
  const [newCard, setNewCard] = useState({
    accountNumber: "",
    routingNumber: "",
    cardBrand: "",
  });
  // const [newCard, setNewCard] = useState({
  //   brand: "Visa",
  //   last4: "",
  //   expiry: "",
  //   cardHolder: "",
  //   type: "Credit",
  // });

  // || means or, if either of the field is empty, it will return an alert
  const handleAddCard = async () => {
    if (!newCard.last4 || !newCard.expiry || !newCard.cardHolder) {
      alert("Please fill in all required fields.");
      return;
    }
    //crypto is a built-in module in Node.js, it is used to generate random id
    //...newCard is used to spread the newCard object, then add the id to it
    const newCardData = {
      id: crypto.randomUUID(),
      ...newCard,
    };

    // 更新 Firestore
    //arrayUnion is used to add the new card to the existing cards array, but it will not add the same card twice
    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    await updateDoc(walletRef, {
      cards: arrayUnion(newCardData),
    });

    // 更新前端状态
    //...prev is for keeping all the previous state, and only updating the cards array
    //the reason to use arrow function is to update the state based on the previous state in case of any concurrency issues
    setWallet((prev) => ({
      ...prev,
      cards: [...prev.cards, newCardData],
    }));

    // 清空表单
    //reset the newCard state
    setNewCard({
      accountNumber: "",
      outingNumber: "",
    });
    setShowAddCardForm(false); // 隐藏表单

    alert("Card added successfully!");
  };

  const handleBankAccountAdded = async (newBankAccount) => {
    if (!userId) return;

    const newBankData = {
      id: crypto.randomUUID(), // 生成唯一 ID
      ...newBankAccount, // 传入的银行卡信息
    };

    try {
      // 更新 Firebase
      const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
      await updateDoc(walletRef, {
        cards: arrayUnion(newBankData), // 添加银行卡信息到数组
      });

      // 更新前端状态
      setWallet((prev) => ({
        ...prev,
        cards: [...(prev?.cards || []), newBankData], // 确保数组存在
      }));

      // 隐藏表单
      setShowAddCardForm(false);
    } catch (error) {
      console.error("Error adding bank account:", error);
      alert("Failed to add bank account.");
    }
  };

  //walletRef is the reference to the wallet document in the Firestore
  //arrayRemove is used to remove the card from the cards array
  const handleRemoveCard = async (card) => {
    const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");
    //alert(card.id);
    await updateDoc(walletRef, { cards: arrayRemove(card) });
    //filter is used to keep the card with the different id from the cards array, which means removing
    setWallet((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== card.id),
    }));
  };

  const cardVariants = {
    hover: { rotateY: 180, transition: { duration: 0.6 } },
  };
  //userId is the dependency, useEffect will run whenever the userId changes
  //if the dependency is an empty array, it will only run once when the component is mounted
  //if the dependency is not provided, it will run every time the component is rendered or updated, which is not recommended, cause it will cause performance issues
  // useEffect(() => {


  //   const fetchWallet = async () => {
  //     const walletDocRef = doc(db, "users", userId, "wallet", "defaultWallet");
  //     const walletSnap = await getDoc(walletDocRef);

  //     if (walletSnap.exists()) {
  //       //console.log("Wallet data:", walletSnap.data());
  //       setWallet(walletSnap.data());  // 更新钱包数据
  //     } else {
  //       console.log("No wallet data found.");
  //     }

  //     setLoading(false);  // 停止加载
  //   };

  //   //console.log("userId:", userId);

  //   fetchWallet();
  // }, [userId, availableBalanceUpdated]);

  useEffect(() => {
    if (!userId) return;
  
    const walletDocRef = doc(db, "users", userId, "wallet", "defaultWallet");
  
    // 监听 Firestore 数据变更
    const unsubscribe = onSnapshot(walletDocRef, (walletSnap) => {
      if (walletSnap.exists()) {
        setWallet(walletSnap.data());
      } else {
        console.log("No wallet data found.");
        setWallet(null);
      }
      setLoading(false);
    });
  
    // 清理监听器，防止内存泄漏
    return () => unsubscribe();
  }, [userId]);  // 仅在 userId 变化时重新绑定监听



  const handleWithdraw = async () => {
    if (!wallet) return;
    const availableBalance = wallet.totalBalance - wallet.lockedAmount;

    if (availableBalance > 0) {
      const walletRef = doc(db, "users", userId);
      await updateDoc(walletRef, {
        "wallet.totalBalance": wallet.totalBalance - availableBalance,
      });
      alert(`Withdrawn $${(availableBalance).toFixed(2)}!`);
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

      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-gray-800 mb-4">Account Balance</h3>

        {/* 进度条 */}
        {/* 进度条 */}
        <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          {/* 红色部分 (lockedAmount) */}
          <div
            className="absolute top-0 left-0 h-6 bg-red-500"
            style={{ width: `${(wallet.lockedAmount / (wallet.lockedAmount + wallet.withdrawableBalance)) * 100}%` }}
          ></div>

          {/* 绿色部分 (withdrawableBalance) */}
          <div
            className="absolute top-0 h-6 bg-green-500"
            style={{
              width: `${(wallet.withdrawableBalance / (wallet.lockedAmount + wallet.withdrawableBalance)) * 100}%`,
              left: `${(wallet.lockedAmount / (wallet.lockedAmount + wallet.withdrawableBalance)) * 100}%` // 让绿色紧跟红色后面
            }}
          ></div>
        </div>



        {/* 金额信息 */}
        {/* toFixed is used to round the number to the specified decimal places */}

        <div className="flex justify-between text-sm mt-2">
          <p className="text-red-500 font-semibold">Locked: ${wallet.lockedAmount.toFixed(2)}</p>
          <p className="text-blue-600 font-bold">Total: ${(wallet.lockedAmount + wallet.withdrawableBalance).toFixed(2)}</p>

          <p className="text-green-600 font-semibold">Available: ${wallet.withdrawableBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* 提现按钮 */}
      <div className="flex justify-center my-10">
        {/* Withdraw Button */}
        {/* <p>{wallet.stripeAccountID}</p> */}
        {/* {userId} {wallet.withdrawableBalance} */}
        {userId && wallet?.withdrawableBalance !== undefined && (
          <WithdrawForm
            stripeAccountId={wallet.stripeAccountID}
            bankCards={wallet.cards}
            userId={userId}
            availableBalance={wallet.withdrawableBalance}
            className="my-6 mx-auto"
          />
        )}
        {/* <button
          onClick={handleWithdraw}
          disabled={wallet.totalBalance - wallet.lockedAmount <= 0}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out ${wallet.totalBalance - wallet.lockedAmount > 0
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <i className="fas fa-arrow-down mr-2"></i> Withdraw
        </button> */}

        {/* TopUp Button */}
        {/* <button
          onClick={handleTopUp} // 假设你已经实现了充值功能
          className="px-6 py-3 rounded-full text-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out"
        >
          <i className="fas fa-arrow-up mr-2"></i> Top Up
        </button> */}
      </div>


      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Bank Cards</h3>
        <div className="flex flex-wrap gap-4">
          {wallet.cards.map((card) => (
            <motion.div
              key={card.id}
              className={`relative w-80 h-48 rounded-xl shadow-lg text-white p-6 ${card.cardBrand === 'Visa' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-yellow-600 to-yellow-800'} group`}
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
                <p className="text-lg font-semibold">{card.cardBrand}</p>
                <p className="text-xl font-bold tracking-widest">{card.accountNumber}</p>
                <div className="flex justify-between text-sm">
                  <p>Routing Number {card.routingNumber}</p>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* <p>{userId}</p>
      <BankAccountForm Id={userId} stripeAccountId={wallet.stripeAccountID} userEmail={userEmail} />
      <p>{wallet.stripeAccountID}</p>
      <p>{userEmail}</p> */}
      {showAddCardForm && (
        <BankAccountForm Id={userId} stripeAccountId={wallet.stripeAccountID} userEmail={userEmail}
          onSuccess={handleBankAccountAdded} // 提交成功后隐藏
          onCancel={() => setShowAddCardForm(false)} // 取消时隐藏
        />

      )}
      {/* "Add Card" 按钮 */}
      {!showAddCardForm && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddCardForm(true)}
        >
          Add Card
        </button>
      )}


    </div>
  );
}
