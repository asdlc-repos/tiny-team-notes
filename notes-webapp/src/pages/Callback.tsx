import { useEffect, useRef, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Stack } from "@wso2/oxygen-ui";
import { handleCallback } from "../authz/session";
import { Splash } from "../App";

export default function CallbackPage(): ReactElement {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    handleCallback().then(
      () => navigate("/", { replace: true }),
      (e: unknown) => setError(e instanceof Error ? e.message : "Sign-in failed"),
    );
  }, [navigate]);

  if (error) {
    return (
      <Stack sx={{ p: 4 }}>
        <Alert severity="error">Sign-in failed: {error}</Alert>
      </Stack>
    );
  }
  return <Splash />;
}
