import type { ReactElement } from "react";
import { Button, Layout, ParticleBackground, Stack, Typography } from "@wso2/oxygen-ui";
import { signIn } from "../authz/session";

export default function SignedOutPage(): ReactElement {
  return (
    <Layout.Content>
      <ParticleBackground opacity={0.5} />
      <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ minHeight: "100vh" }}>
        <Typography variant="h4">You are signed out</Typography>
        <Button variant="contained" onClick={() => void signIn()}>
          Sign in
        </Button>
      </Stack>
    </Layout.Content>
  );
}
