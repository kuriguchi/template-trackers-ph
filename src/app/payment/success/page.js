'use client';
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const paymentIntentId = useMemo(
    () => searchParams?.get("payment_intent_id"),
    [searchParams]
  );

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [folderLink, setFolderLink] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

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
          setErrorCode(data?.code || "");
          setMessage(data?.error || "Failed to confirm payment.");
          setBuyerEmail(data?.buyerEmail || "");
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

        {status === "loading" && (
          <div className="mt-6 rounded-md bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-700">
              If this page takes too long or gets stuck, please check your Google Drive directly. Your template folder may have already been copied and is ready for you to access.
            </p>
          </div>
        )}

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

        {errorCode === "GMAIL_VERIFICATION_FAILED" && buyerEmail ? (
          <div className="mt-6 rounded-md bg-red-50 border border-red-200 p-4 text-left">
            <h2 className="font-semibold text-red-800 mb-2">Gmail Verification Failed</h2>
            <p className="text-sm text-red-700 mb-3">
              The email <strong>{buyerEmail}</strong> could not be verified. This may mean:
            </p>
            <ul className="list-disc pl-5 text-sm text-red-700 mb-3 space-y-1">
              <li>The Gmail address is inactive or suspended</li>
              <li>The email address was typed incorrectly</li>
              <li>The account has unusual activity restrictions</li>
            </ul>
            <p className="text-sm text-red-700">
              Please contact support with your payment ID to retry with a valid Gmail address.
            </p>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessInner />
    </Suspense>
  );
}
