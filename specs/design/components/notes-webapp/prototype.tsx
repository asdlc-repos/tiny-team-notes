import { useState, type ReactNode } from "react";
import {
  Alert, AppShell, Button, Detail, EmptyState, Field, Form, Heading, Screen, Section, Table, Text,
  ValidationSummary, defineApp, useCollection, useDisplayState, useToday,
} from "@wso2/prototype-kit";

interface Note { id: string; body: string; author: string; postedAt: string }

const notes: Note[] = [
  { id: "note.1", body: "Retro moves to Thursday 3pm, same room.", author: "Ana Silva", postedAt: "2026-01-15 09:12" },
  { id: "note.2", body: "Staging is back up after the morning restart.", author: "Ravi Perera", postedAt: "2026-01-14 16:40" },
  { id: "note.3", body: "Bringing cake on Friday for Maya's last day!", author: "Dan Okafor", postedAt: "2026-01-14 11:05" },
  { id: "note.4", body: "Reminder: release notes are due before standup.", author: "Maya Fernando", postedAt: "2026-01-13 14:20" },
];

const user = { name: "Maya Fernando", email: "maya@acme.example" };
const LIMIT = 280;

function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      id="shell"
      user={user}
      nav={[{ id: "nav.board", label: "Notes board", to: "screen.board" }]}
      account="screen.account"
      signOut="screen.signed-out"
    >
      {children}
    </AppShell>
  );
}

function Board() {
  const state = useDisplayState();
  const today = useToday();
  const all = useCollection<Note>("notes");
  const [text, setText] = useState("");
  const shown = state === "state.empty" ? [] : [...all.items].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
  const tooLong = text.length > LIMIT;
  const blank = text.trim().length === 0;
  const issues =
    state === "state.validation-error"
      ? ["A note cannot be empty.", `A note cannot be longer than ${LIMIT} characters.`]
      : [];
  const post = () => {
    if (blank || tooLong) return;
    all.create({ body: text.trim(), author: user.name, postedAt: `${today} 12:00` });
    setText("");
  };
  return (
    <Shell>
      <Heading id="heading.board" text="Notes board" />
      {state === "state.failed" && (
        <Alert id="alert.failed" tone="error" title="Notes unavailable" text="The board could not load. Try again in a moment." />
      )}
      <Section id="section.post" title="Post a note" subtitle={`Plain text, up to ${LIMIT} characters. Notes cannot be edited or deleted.`}>
        <Form
          id="form.note"
          onSubmit={post}
          actions={<Button id="btn.post" label="Post note" emphasis="primary" submit />}
        >
          {issues.length > 0 && <ValidationSummary id="summary.note" issues={issues} />}
          <Field
            id="field.note"
            label="Note"
            type="textarea"
            required
            value={text}
            onChange={setText}
            pattern={`[\\s\\S]{1,${LIMIT}}`}
            patternMessage={`A note cannot be longer than ${LIMIT} characters`}
            error={tooLong ? `A note cannot be longer than ${LIMIT} characters` : state === "state.validation-error" ? "A note cannot be empty" : undefined}
          />
          <Text id="text.count" text={`${text.length} / ${LIMIT} characters`} />
        </Form>
      </Section>
      <Section id="section.notes" title="All notes" count={shown.length} subtitle="Newest first, from everyone on the team.">
        <Table
          id="table.notes"
          columns={["Note", "Author", "Posted"]}
          rows={shown.map((n) => ({ id: `note.${n.id}`, cells: [n.body, n.author, n.postedAt] }))}
          empty={<EmptyState id="empty.notes" title="No notes yet" text="Post the first note for your team." />}
        />
      </Section>
    </Shell>
  );
}

function Account() {
  return (
    <Shell>
      <Heading id="heading.account" text="Account" />
      <Detail id="detail.account" fields={[{ label: "Name", value: user.name }, { label: "Email", value: user.email }]} />
    </Shell>
  );
}

function SignedOut() {
  return (
    <Screen>
      <Heading id="heading.signed-out" text="You are signed out" />
      <Button id="btn.sign-in" label="Sign in" emphasis="primary" to="screen.board" />
    </Screen>
  );
}

export default defineApp({
  screens: {
    "screen.board": Board,
    "screen.account": Account,
    "screen.signed-out": SignedOut,
  },
  data: { notes },
});
