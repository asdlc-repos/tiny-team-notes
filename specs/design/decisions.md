# Technical decisions

- \[data-model\] A note stores the author's id and display name at posting time, so the board needs no people lookup. *assumed* (F1)
- \[notes-api\] The note length limit is enforced by the API as well as the screen, counted in characters after trimming. *assumed* (F1)
- \[notes-api\] The board list returns 50 notes per page, newest first. *assumed* (F1)
- \[security\] Every note is read through one every-row operation, since all team members see all notes. *assumed* (F1)