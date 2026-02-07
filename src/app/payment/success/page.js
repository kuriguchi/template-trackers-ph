'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntentId = useMemo(
    () => searchParams?.get("payment_intent_id"),
    [searchParams]
  );

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [folderLink, setFolderLink] = useState("");

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus("error");
      setMessage("Missing payment intent.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(
          `/api/payments/confirm?payment_intent_id=${paymentIntentId}`
        );
        const data = await res.json();

        if (res.status === 202) {
          setStatus("pending");
          setMessage("Payment is still processing. Please refresh in a moment.");
          return;
        }

        if (!res.ok) {
          setStatus("error");
          setMessage(data?.error || "Failed to confirm payment.");
          return;
        }

        setStatus("success");
        setFolderLink(data?.webViewLink || "");
        setMessage("Payment confirmed. Your template folder is ready.");
      } catch (error) {
        setStatus("error");
        setMessage(error?.message || "Failed to confirm payment.");
      }
    };

    run();
  }, [paymentIntentId]);

  return (
    <main className="min-h-dvh bg-white text-[#1560a8]">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-[#0b4f78]">Payment Status</h1>
        <p className="mt-4 text-sm text-[#1560a8]/80">Status: {status}</p>
        <p className="mt-4">{message}</p>

        {status === "success" && folderLink ? (
          <div className="mt-6">
            <a
              className="inline-flex items-center rounded-md bg-[#2596be] px-4 py-2 text-white font-semibold"
              href={folderLink}
              target="_blank"
              rel="noreferrer"
            >
              Open your template folder
            </a>
          </div>
        ) : null}

        <div className="mt-8">
          <Link href="/" className="text-[#2596be] underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
