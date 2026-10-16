import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Chip,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { notesApi } from "../api";
import type { components } from "../generated/notes-api";

type Note = components["schemas"]["Note"];

const LIMIT = 280;
const PAGE = 100;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function BoardPage(): ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [text, setText] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [postFailed, setPostFailed] = useState(false);

  const load = useCallback(async (offset: number): Promise<void> => {
    try {
      const { data } = await notesApi.GET("/notes", { params: { query: { limit: PAGE, offset } } });
      if (!data) throw new Error("load failed");
      setNotes((prev) => (offset === 0 ? data.data : [...prev, ...data.data]));
      setTotal(data.count);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    load(0).finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [load]);

  const blank = text.trim().length === 0;
  const tooLong = text.length > LIMIT;
  const reason = tooLong
    ? `A note cannot be longer than ${LIMIT} characters.`
    : attempted && blank
      ? "A note cannot be empty."
      : null;

  const post = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setServerError(null);
    setPostFailed(false);
    setAttempted(true);
    if (blank || tooLong || posting) return;
    setPosting(true);
    try {
      const { data, error } = await notesApi.POST("/notes", { body: { body: text.trim() } });
      if (data) {
        setNotes((prev) => [data, ...prev]);
        setTotal((n) => n + 1);
        setText("");
        setAttempted(false);
      } else if (error) {
        setServerError(error.description ?? error.message);
      } else {
        setPostFailed(true);
      }
    } catch {
      setPostFailed(true);
    } finally {
      setPosting(false);
    }
  };

  const loadMore = async (): Promise<void> => {
    setLoadingMore(true);
    await load(notes.length);
    setLoadingMore(false);
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Notes board</PageTitle.Header>
      </PageTitle>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader
          title="Post a note"
          subheader={`Plain text, up to ${LIMIT} characters. Notes cannot be edited or deleted.`}
        />
        <CardContent>
          <Box component="form" onSubmit={post} noValidate>
            <Stack spacing={2}>
              {(serverError || postFailed) && (
                <Alert severity="error">
                  <AlertTitle>Note not posted</AlertTitle>
                  {serverError ?? "The note could not be posted. Try again in a moment."}
                </Alert>
              )}
              <TextField
                label="Note"
                multiline
                minRows={3}
                required
                value={text}
                onChange={(ev) => setText(ev.target.value)}
                error={reason !== null}
                helperText={reason ?? `${text.length} / ${LIMIT} characters`}
                slotProps={{ htmlInput: { "aria-label": "Note" } }}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button type="submit" variant="contained" disabled={posting}>
                  Post note
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6">All notes</Typography>
        {!loading && !failed && <Chip size="small" label={total} />}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Newest first, from everyone on the team.
      </Typography>

      {failed && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void load(0)}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Notes unavailable</AlertTitle>
          The board could not load. Try again in a moment.
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress aria-label="Loading notes" />
        </Stack>
      ) : (
        !failed && (
          <>
            <ListingTable.Container>
              <ListingTable>
                <ListingTable.Head>
                  <ListingTable.Row>
                    <ListingTable.Cell>Note</ListingTable.Cell>
                    <ListingTable.Cell>Author</ListingTable.Cell>
                    <ListingTable.Cell>Posted</ListingTable.Cell>
                  </ListingTable.Row>
                </ListingTable.Head>
                <ListingTable.Body>
                  {notes.length === 0 ? (
                    <ListingTable.Row>
                      <ListingTable.Cell colSpan={3}>
                        <ListingTable.EmptyState
                          title="No notes yet"
                          description="Post the first note for your team."
                        />
                      </ListingTable.Cell>
                    </ListingTable.Row>
                  ) : (
                    notes.map((n) => (
                      <ListingTable.Row key={n.id}>
                        <ListingTable.Cell sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {n.body}
                        </ListingTable.Cell>
                        <ListingTable.Cell>{n.authorName}</ListingTable.Cell>
                        <ListingTable.Cell>
                          <Typography component="time" variant="body2" dateTime={n.createdAt}>
                            {formatTime(n.createdAt)}
                          </Typography>
                        </ListingTable.Cell>
                      </ListingTable.Row>
                    ))
                  )}
                </ListingTable.Body>
              </ListingTable>
            </ListingTable.Container>
            {notes.length < total && (
              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => void loadMore()} disabled={loadingMore}>
                  Load more notes
                </Button>
              </Stack>
            )}
          </>
        )
      )}
    </PageContent>
  );
}
