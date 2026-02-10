"use client";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function ProductPaymentForm({ productKey = "bookkeeping", priceLabel = "Pay ₱1 with QRPH" }) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrPaymentIntentId, setQrPaymentIntentId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
    if (clientId) {
      setGoogleClientId(clientId);
    } else {
      setPaymentError("Google OAuth is not configured. Please contact support.");
    }
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setPaymentError("");

      const verifyRes = await fetch("/api/auth/verify-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData?.error || "Failed to verify Google account.");
      }

      setBuyerEmail(verifyData.email);
      setIsSignedIn(true);
    } catch (err) {
      setPaymentError(err?.message || "Failed to sign in with Google.");
    }
  };

  const handleGoogleError = () => {
    setPaymentError("Failed to sign in with Google. Please try again.");
  };

  const handlePayment = async () => {
    setPaymentError("");
    setQrCodeUrl("");
    setQrPaymentIntentId("");
    setIsPaying(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail, productKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to start payment.");
      }
      if (data?.nextAction?.type === "consume_qr" && data?.nextAction?.code) {
        setQrCodeUrl(data.nextAction.code.image_url || "");
        setQrPaymentIntentId(data.paymentIntentId || "");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      throw new Error("Missing redirect or QR code.");
    } catch (err) {
      setPaymentError(err?.message || "Failed to start payment.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white/70 p-6">
      <h4 className="text-xl font-bold" style={{ color: "#0b4f78" }}>
        Pay via QRPH (GCash or any QRPH app)
      </h4>

      {!isSignedIn ? (
        <div className="mt-4">
          <p className="text-sm text-[#1560a8] mb-4">To get started, sign in with your Gmail account.</p>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleError}
                  text="signin_with"
                  theme="outline"
                  size="large"
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="text-red-600 text-sm">{paymentError}</div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Signed in as: <strong>{buyerEmail}</strong></span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full rounded-md bg-[#2596be] px-4 py-2 text-white font-semibold disabled:opacity-70"
          >
            {isPaying ? "Processing..." : priceLabel}
          </button>
          <button
            onClick={() => {
              setIsSignedIn(false);
              setBuyerEmail("");
              setPaymentError("");
            }}
            className="w-full rounded-md border border-[#2596be] px-4 py-2 text-[#2596be] font-semibold hover:bg-[#f0fbff]"
          >
            Use Different Account
          </button>
        </div>
      )}

      {paymentError ? (
        <div className="mt-3 text-sm text-red-600">{paymentError}</div>
      ) : null}

      {qrCodeUrl ? (
        <div className="mt-6 rounded-xl border bg-white p-4 text-center">
          <p className="text-sm text-[#1560a8]/80">
            Scan this QR code with GCash or any QRPH app to pay.
          </p>
          <div className="mt-4 flex items-center justify-center">
            <img src={qrCodeUrl} alt="QRPH code" className="h-64 w-64" />
          </div>
          {qrPaymentIntentId ? (
            <p className="mt-3 text-xs text-[#1560a8]/60 break-all">
              Payment ID: {qrPaymentIntentId}
            </p>
          ) : null}
          <p className="mt-3 text-sm">
            After paying, open this link to confirm:
            <br />
            <a
              className="text-[#2596be] underline break-all"
              href={`/payment/success?payment_intent_id=${qrPaymentIntentId}`}
            >
              Confirm payment
            </a>
          </p>
        </div>
      ) : null}
    </section>
  );
}
