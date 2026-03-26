import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeoHead from "@/components/seo/SeoHead.tsx";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return <SeoHead title="Auth Callback" description="Authentication callback route." noIndex />;
}
