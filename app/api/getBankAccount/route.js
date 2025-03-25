import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const stripeAccountId = searchParams.get("stripeAccountId");

    if (!stripeAccountId) {
      return new Response(JSON.stringify({ error: "Stripe account ID is required." }), { status: 400 });
    }

    const accounts = await stripe.accounts.listExternalAccounts(stripeAccountId, {
      object: "bank_account",
    });
    

    return new Response(JSON.stringify({ accounts: accounts.data }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
