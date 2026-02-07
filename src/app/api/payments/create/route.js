const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

function resolveTemplateFolderId({ templateFolderId, productKey }) {
  if (templateFolderId) {
    return templateFolderId;
  }

  const productMap = {
    bookkeeping: process.env.GOOGLE_TEMPLATE_FOLDER_ID,
    "academic-tracking": process.env.GOOGLE_TEMPLATE_FOLDER_ID_ACADEMIC_TRACKING,
    "all-in-one-finance": process.env.GOOGLE_TEMPLATE_FOLDER_ID_ALL_IN_ONE_FINANCE,
  };

  if (productKey) {
    return productMap[productKey] || null;
  }

  return process.env.GOOGLE_TEMPLATE_FOLDER_ID;
}

function getPaymongoSecretKey() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing PAYMONGO_SECRET_KEY.");
  }
  return secretKey;
}

function getOrigin(request) {
  return (
    process.env.PAYMONGO_RETURN_URL ||
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

function buildAuthHeader(secretKey) {
  const token = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function POST(request) {
  try {
    const { buyerEmail, templateFolderId, productKey } = await request.json();

    if (!buyerEmail) {
      return Response.json({ error: "buyerEmail is required." }, { status: 400 });
    }

    const resolvedTemplateFolderId = resolveTemplateFolderId({
      templateFolderId,
      productKey,
    });

    if (!resolvedTemplateFolderId) {
      const envHint =
        productKey === "academic-tracking"
          ? "GOOGLE_TEMPLATE_FOLDER_ID_ACADEMIC_TRACKING"
          : productKey === "all-in-one-finance"
          ? "GOOGLE_TEMPLATE_FOLDER_ID_ALL_IN_ONE_FINANCE"
          : "GOOGLE_TEMPLATE_FOLDER_ID";

      return Response.json(
        { error: `Missing template folder configuration. Set ${envHint}.` },
        { status: 400 }
      );
    }

    const secretKey = getPaymongoSecretKey();
    const authHeader = buildAuthHeader(secretKey);

    const paymentIntentResponse = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: 100,
            currency: "PHP",
            payment_method_allowed: ["qrph"],
            description: "Template purchase",
            metadata: {
              buyerEmail,
              templateFolderId: resolvedTemplateFolderId,
              productKey: productKey || "bookkeeping",
            },
          },
        },
      }),
    });

    const paymentIntentBody = await paymentIntentResponse.json();
    if (!paymentIntentResponse.ok) {
      return Response.json(
        { error: paymentIntentBody?.errors?.[0]?.detail || "Failed to create payment intent." },
        { status: 400 }
      );
    }

    const paymentIntentId = paymentIntentBody?.data?.id;

    const paymentMethodResponse = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "qrph",
            billing: {
              email: buyerEmail,
              name: buyerEmail,
            },
          },
        },
      }),
    });

    const paymentMethodBody = await paymentMethodResponse.json();
    if (!paymentMethodResponse.ok) {
      return Response.json(
        { error: paymentMethodBody?.errors?.[0]?.detail || "Failed to create payment method." },
        { status: 400 }
      );
    }

    const paymentMethodId = paymentMethodBody?.data?.id;
    const origin = getOrigin(request);
    let returnUrl;

    try {
      const baseUrl = new URL(origin);
      if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
        return Response.json(
          {
            error:
              "PAYMONGO_RETURN_URL must be https. Use an https URL (ngrok for local) or set PAYMONGO_RETURN_URL to your live domain.",
          },
          { status: 400 }
        );
      }
      returnUrl = new URL(
        `/payment/success?payment_intent_id=${paymentIntentId}`,
        baseUrl
      ).toString();
    } catch (error) {
      return Response.json(
        { error: "PAYMONGO_RETURN_URL is invalid." },
        { status: 400 }
      );
    }

    const attachResponse = await fetch(
      `${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              return_url: returnUrl,
            },
          },
        }),
      }
    );

    const attachBody = await attachResponse.json();
    if (!attachResponse.ok) {
      return Response.json(
        { error: attachBody?.errors?.[0]?.detail || "Failed to attach payment method." },
        { status: 400 }
      );
    }

    const nextAction = attachBody?.data?.attributes?.next_action || null;
    const redirectUrl = nextAction?.redirect?.url || nextAction?.redirect?.href;

    if (nextAction?.type === "consume_qr") {
      return Response.json({
        paymentIntentId,
        nextAction: {
          type: "consume_qr",
          code: nextAction?.code || null,
        },
      });
    }

    if (!redirectUrl) {
      return Response.json(
        {
          error: "Missing redirect URL from PayMongo.",
          debug: {
            paymentIntentId,
            nextAction,
            status: attachBody?.data?.attributes?.status || null,
          },
        },
        { status: 400 }
      );
    }

    return Response.json({
      redirectUrl,
      paymentIntentId,
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Failed to create payment." },
      { status: 500 }
    );
  }
}
