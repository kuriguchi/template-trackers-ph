"use client";
import Link from "next/link";
import { useState } from "react";

function AllInOneFinancePaymentForm() {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrPaymentIntentId, setQrPaymentIntentId] = useState("");

  return (
    <section className="rounded-2xl bg-white/70 p-6">
      <h4 className="text-xl font-bold" style={{ color: "#0b4f78" }}>
        Pay with GCash (QRPH)
      </h4>
      <p className="mt-2 text-sm text-[#1560a8]/80">
        Enter your email to receive your template folder after payment.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPaymentError("");
          setQrCodeUrl("");
          setQrPaymentIntentId("");
          setIsPaying(true);
          try {
            const res = await fetch("/api/payments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ buyerEmail, productKey: "all-in-one-finance" }),
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
        }}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] items-center"
      >
        <input
          required
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="buyer@gmail.com"
          className="w-full rounded-md border px-3 py-2"
        />
        <button
          disabled={isPaying}
          className="rounded-md bg-[#2596be] px-4 py-2 text-white font-semibold disabled:opacity-70"
        >
          {isPaying ? "Redirecting..." : "Pay ₱1 with QRPH"}
        </button>
      </form>
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

export default function AllInOneFinanceProductPage() {
  return (
    <main className="min-h-dvh bg-white text-[#1560a8]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex justify-center mb-8">
          <img
            src="/all_in_one_fin.png"
            alt="All-in-one Finance Preview"
            className="rounded-xl shadow-lg max-w-full h-64 object-contain"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b4f78] mb-4">
          ALL-IN-ONE FINANCE TRACKER
        </h1>
        <p className="mb-6 text-base text-[#1560a8]/90">
          Organize every peso in one place with the All-in-one Finance Tracker. Track income,
          expenses, bills, savings, and goals so you can see your full financial picture at a glance.
          Perfect for households, freelancers, and small business owners.
        </p>
        <hr className="my-6 border-[#2596be]/30" />
        <h2 className="text-xl font-bold mb-3">WHAT’S INSIDE</h2>
        <ul className="list-disc pl-6 mb-6 text-[#1560a8]/90">
          <li>Monthly Trackers (12 Tabs)</li>
          <li>Weekly Tracker</li>
          <li>Paycheck Tracker</li>
          <li>50/30/20 Tab Tracker.</li>
          <li>Sinking Funds Tracker</li>
          <li>Debt Snowball Tracker</li>
          <li>Annual Dashboard & Overview</li>
          <li>Bill Calendar</li>
        </ul>
        <hr className="my-8 border-[#2596be]/30" />
        <AllInOneFinancePaymentForm />
        <div className="mt-8">
          <Link href="/" className="text-[#2596be] underline">
            Back to products
          </Link>
        </div>
      </div>
    </main>
  );
}
