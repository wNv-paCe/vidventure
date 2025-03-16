import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    console.log("Received checkout request");

    const {
      amount,
      userId,
      userType,
      videographerId,
      packageId,
      serviceTitle,
    } = await req.json();
    console.log("Parsed request:", {
      amount,
      userId,
      userType,
    });

    if (!userId || !userType || amount <= 0) {
      console.error("Invalid amount or user ID:", { amount, userId, userType });
      return NextResponse.json(
        { error: "Invalid amount or user ID" },
        { status: 400 }
      );
    }

    // Stripe Checkout Session
    // From Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Service Payment",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId,
        userType,
        amount,
        videographerId: videographerId || "",
        packageId: packageId || "",
        serviceTitle: serviceTitle || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${userType}/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/servicePackage/${packageId}`,
    });

    console.log("Created Stripe session:", session);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // End from Stripe
}
