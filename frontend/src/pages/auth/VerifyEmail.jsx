import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verify = async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.message);

        setTimeout(() => {
          navigate(`/auth/set-account?token=${token}`);
        }, 1500);
      } else {
        setStatus("error");
        setMessage(result.error);
      }
    };

    verify();
  }, [searchParams, navigate, verifyEmail]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 font-openSans">
      <h1
        className={`text-6xl font-semibold mb-4 ${
          status === "error" ? "text-red-600" : "text-blue-600"
        }`}
      >
        {status === "loading"
          ? "Verifying..."
          : status === "success"
          ? "Success!"
          : "Verification Failed"}
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-6 text-xl">{message}</p>
    </div>
  );
}
