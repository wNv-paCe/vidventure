export async function POST(req) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
