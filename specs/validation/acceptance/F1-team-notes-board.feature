Feature: F1 Team notes board

  @story-F1.1 @story-F1.3
  Rule: A team member can post a plain-text note and it appears at once

    Scenario: Posting a note
      Given Maya the team member is signed in and sees the board
      When Maya posts the note "Retro moves to Thursday 3pm"
      Then "Retro moves to Thursday 3pm" is the first note on the board

    Scenario: A note of exactly 280 characters is accepted
      Given Maya the team member is signed in and sees the board
      When Maya posts a note of exactly 280 characters
      Then that note is on the board

  @story-F1.1 @story-F1.5
  Rule: A note may not be empty or longer than 280 characters

    @negative
    Scenario: A note of 281 characters is refused
      Given Maya the team member is signed in and sees the board
      And Maya notes how many notes the board has
      When Maya posts a note of 281 characters
      Then the board has the same number of notes as before

    @negative
    Scenario: A note of only spaces is refused
      Given Maya the team member is signed in and sees the board
      And Maya notes how many notes the board has
      When Maya posts a note containing only spaces
      Then the board has the same number of notes as before

  @story-F1.2 @story-F1.4
  Rule: Everyone on the team sees every note, newest first, with author and time

    Scenario: A teammate sees another member's note
      Given Maya has posted the note "Staging is back up"
      When Ravi the team member opens the board
      Then "Staging is back up" appears with Maya as author and the time it was posted

    Scenario: Newest note comes first
      Given Maya posted "First note of the day" and then Ravi posted "Second note of the day"
      When Dan the team member opens the board
      Then "Second note of the day" is listed above "First note of the day"

  @story-F1.1 @story-F1.2
  Rule: Only a signed-in team member may see or post notes

    @negative
    Scenario: A visitor who is not signed in
      Given a visitor who has not signed in
      When the visitor opens the board
      Then no notes are shown

  @story-F1.1 @story-F1.2
  Rule: Notes cannot be edited or deleted

    @negative
    Scenario: A posted note has no edit or delete
      Given Maya has posted the note "Cake on Friday"
      When Maya looks at that note on the board
      Then she has no way to change or remove it
