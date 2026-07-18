# Project Overview

## What We're Building

An LMS (Learning Management System) built as a **public course marketplace** — independent
instructors create and sell courses, students browse, enroll, and pay for them. Same shape
as Udemy: multi-sided (student / instructor / admin), not a single-tenant corporate or
school LMS.

This is a **learning project**: the goal is to build and understand full-stack patterns
well (auth, validation, data modeling, payments) rather than hit a ship deadline. Favor
correct, well-understood solutions over speed; it's fine to slow down and get a pattern
right rather than patch around it.

## For Whom

- **Students** — browse/search courses, enroll, pay, track progress, leave reviews.
- **Instructors** — author courses (sections, subsections/lessons), publish, get paid
  (an earnings dashboard exists; see Current State — no real bank payout yet).
- **Admins** — full CRUD on Tags, and can list every user and change roles. Course
  moderation (acting on courses you don't own) and platform-wide analytics do not exist
  yet — see Not Yet Decided below.

## Current State (as of 2026-07-18)

Every domain in the original data model — Auth, Tag, Course, Section, SubSection,
Payment/Enrollment, CourseProgress, Profile, and Review — is functionally complete
end-to-end, backend **and** frontend. This is well past the original three-item scope
below; see `progress-tracker.md`'s Current Phase and Completed sections for the full,
up-to-date list — don't treat this file's snapshot as more current than that one when
they'd ever disagree.

## Scope Boundaries — What's Next

The original three-item build-out (course browsing/enrollment, course creation,
payments & checkout) is done. Remaining and possible-future work lives in
`progress-tracker.md`'s Next Up section, not duplicated here, to avoid this file
drifting out of sync the way it previously did.

Not yet decided / not addressed by any model or discussion:

- Course moderation (an admin acting on a course they don't own — unpublish, delete) and
  platform-wide analytics (revenue, signups, usage). User management (list users, change
  roles) exists; the rest of "admin-specific features" doesn't yet.
- Notifications beyond transactional email (OTP, password reset) — e.g. "you're
  enrolled," "new lesson added."
- Real payouts to instructors (current earnings feature is a dashboard only — see
  `architecture-context.md` Payment Model for why real bank transfer is out of reach
  right now).

If a request falls outside what's described as done above and isn't listed here, treat
it as out of scope until confirmed — add it to Open Questions in `progress-tracker.md`
rather than assuming.

## Success Criteria

This is a learning project, not a deadline-driven MVP:

- Prioritize correctness and understanding the pattern over shipping fast.
- It's still handling real-shaped concerns (auth, payments, PII) so don't skip security
  basics (hashing, validation, authz checks) to save time — those are the point of the
  exercise, not overhead to cut.
- No fixed launch date. Depth over speed when the two trade off.
