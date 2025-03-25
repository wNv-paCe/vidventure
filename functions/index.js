const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
admin.initializeApp();
const db = admin.firestore();

exports.completeOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send("Unauthorized");
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const {transactionId} = req.body;
      if (!transactionId) {
        return res.status(400).send("Missing transactionId");
      }

      const transactionRef = db.collection("transactions").doc(transactionId);
      const transactionSnap = await transactionRef.get();
      if (!transactionSnap.exists) {
        return res.status(404).send("Transaction not found");
      }

      const transactionData = transactionSnap.data();
      if (transactionData.payerId !== userId) {
        return res.status(403).send("Permission denied");
      }

      // 更新交易状态
      await transactionRef.update({status: "completed"});

      // 解锁资金
      const receiverWalletRef = db
          .collection("users")
          .doc(transactionData.receiverId)
          .collection("wallet")
          .doc("defaultWallet");

      const walletSnap = await receiverWalletRef.get();
      if (!walletSnap.exists) {
        return res.status(404).send("Receiver wallet not found");
      }

      const walletData = walletSnap.data();
      const newLocked = (walletData.lockedAmount || 0) - transactionData.amount;
      const newWithdrawable =
        (walletData.withdrawableBalance || 0) + transactionData.amount;

      await receiverWalletRef.update({
        lockedAmount: newLocked < 0 ? 0 : newLocked,
        withdrawableBalance: newWithdrawable,
      });

      return res
          .status(200)
          .send({message: "Order completed and funds unlocked."});
    } catch (err) {
      console.error("Function error:", err);
      return res.status(500).send("Internal Server Error");
    }
  });
});
