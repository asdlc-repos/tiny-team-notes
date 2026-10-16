# Team notes board

## Purpose

A team member posts a short text note of at most 280 characters, and everyone on the team sees all notes, newest first.

## User Stories

- F1.1 As a team member, I post a plain-text note of up to 280 characters.
- F1.2 As a team member, I see every note from everyone on the team, newest first.
- F1.3 As a team member, my new note appears at the top of the board as soon as I post it.
- F1.4 As a team member, I see who posted each note and when. *assumed*
- F1.5 As a team member, I am stopped from posting an empty note or one over 280 characters, and told why. *assumed*

## Decisions

- A note is plain text, at most 280 characters.
- Notes are listed newest first.
- Notes are permanent: no editing and no deleting.
- A note made only of spaces counts as empty. *assumed*
- The board shows all notes on one list, with no filtering or search. *assumed*

## Out of Scope

- Notifications
- Attachments

