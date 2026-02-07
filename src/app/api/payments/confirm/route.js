import { grantAccess } from "@/lib/grantAccess";
// import { sendPurchaseConfirmationEmail } from "@/lib/sendEmail";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

function getPaymongoSecretKey() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing PAYMONGO_SECRET_KEY.");
  }
  return secretKey;
}

function buildAuthHeader(secretKey) {
  const token = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(request) {
  try {
    const paymentIntentId = request.nextUrl.searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return Response.json(
        { error: "payment_intent_id is required." },
        { status: 400 }
      );
    }

    const secretKey = getPaymongoSecretKey();
    const authHeader = buildAuthHeader(secretKey);

    const intentResponse = await fetch(
      `${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const intentBody = await intentResponse.json();
    if (!intentResponse.ok) {
      return Response.json(
        { error: intentBody?.errors?.[0]?.detail || "Failed to fetch payment intent." },
        { status: 400 }
      );
    }

    const intentAttributes = intentBody?.data?.attributes;
    const status = intentAttributes?.status;

    if (status !== "succeeded") {
      return Response.json(
        { status, message: "Payment not completed yet." },
        { status: 202 }
      );
    }

    const metadata = intentAttributes?.metadata || {};
    const buyerEmail = metadata.buyerEmail;
    const templateFolderId = metadata.templateFolderId;
    const productKey = metadata.productKey || "bookkeeping";

    if (!buyerEmail || !templateFolderId) {
      return Response.json(
        { error: "Missing fulfillment metadata." },
        { status: 400 }
      );
    }

    const result = await grantAccess({
      buyerEmail,
      templateFolderId,
    });

    // Email notification disabled (domain not verified)
    // try {
    //   await sendPurchaseConfirmationEmail({
    //     buyerEmail,
    //     productKey,
    //     folderLink: result.webViewLink,
    //     folderName: result.name,
    //   });
    // } catch (emailError) {
    //   console.error("Email send failed (non-blocking):", emailError);
    // }

    return Response.json({
      status: "fulfilled",
      ...result,
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Failed to confirm payment." },
      { status: 500 }
    );
  }
}
