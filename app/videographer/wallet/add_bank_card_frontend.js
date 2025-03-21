
import { useState } from "react";

const BankAccountForm = ({ Id, stripeAccountId, userEmail }) => {
    const [bankAccount, setBankAccount] = useState({
        userId: Id,
        accountNumber: "",
        routingNumber: "",
        email: userEmail,
        country: "CA",
        currency: "cad",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(bankAccount);

        const response = await fetch("/api/addBankAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stripeAccountId, ...bankAccount }),
        });

        const data = await response.json();
        if (data.success) {
            alert("银行账户绑定成功！");
        } else {
            alert("绑定失败：" + data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="银行账户号码"
                value={bankAccount.accountNumber}
                onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                required
            />
            <input
                type="text"
                placeholder="银行路由号码(Routing Number)"
                value={bankAccount.routingNumber}
                onChange={(e) => setBankAccount({ ...bankAccount, routingNumber: e.target.value })}
                required
            />
            <button type="submit">绑定银行账户</button>
        </form>
    );
};

export default BankAccountForm;
