import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const AddBankAccount = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) return;

        const { token, error } = await stripe.createToken(elements.getElement(CardElement));

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        // 发送 token 到后端
        const response = await fetch("/api/add-bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.id }),
        });

        const data = await response.json();
        setLoading(false);

        if (data.success) {
            alert("银行卡绑定成功！");
        } else {
            alert("绑定失败，请重试。");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || loading}>
                {loading ? "绑定中..." : "绑定银行卡"}
            </button>
        </form>
    );
};

export default AddBankAccount;
