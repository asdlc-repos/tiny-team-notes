import { useEffect, useState, type ReactElement } from "react";
import { Card, CardContent, CardHeader, Grid, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import { currentUser } from "../authz/session";

interface Who {
  name: string;
  email: string;
}

export function useWho(): Who {
  const [who, setWho] = useState<Who>({ name: "", email: "" });
  useEffect(() => {
    void currentUser().then((user) => {
      const p = (user?.profile ?? {}) as Record<string, unknown>;
      const given = typeof p.given_name === "string" ? p.given_name : "";
      const family = typeof p.family_name === "string" ? p.family_name : "";
      const email = typeof p.email === "string" ? p.email : "";
      const name =
        (typeof p.name === "string" && p.name) ||
        `${given} ${family}`.trim() ||
        email ||
        (typeof p.sub === "string" ? p.sub : "");
      setWho({ name, email });
    });
  }, []);
  return who;
}

export default function AccountPage(): ReactElement {
  const who = useWho();
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Account</PageTitle.Header>
      </PageTitle>
      <Card variant="outlined">
        <CardHeader title="Your details" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body2">{who.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body2">{who.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageContent>
  );
}
