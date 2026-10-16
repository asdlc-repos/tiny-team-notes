import { useEffect, useState, type ReactElement } from "react";
import { Alert, CircularProgress, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { notesApi } from "../api";

// Foundation placeholder: proves the wiring end to end (GET /notes through the
// gateway). The real board (post form, table, empty/validation states) is item F1.
export default function BoardPage(): ReactElement {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    notesApi.GET("/notes").then(
      ({ data }) => {
        if (!live) return;
        if (data) setCount(data.count);
        else setFailed(true);
      },
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Notes board</PageTitle.Header>
      </PageTitle>
      {failed && (
        <Alert severity="error">The board could not load. Try again in a moment.</Alert>
      )}
      {!failed && count === null && (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      )}
      {count !== null && <Typography variant="body2">{count} notes on the board.</Typography>}
    </PageContent>
  );
}
