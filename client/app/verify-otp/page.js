import { Suspense } from "react";
import VerifyOtpClient from "./VerifyOtpClient";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpClient />
    </Suspense>
  );
}
