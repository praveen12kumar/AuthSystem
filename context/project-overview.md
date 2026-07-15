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
- **Instructors** — author courses (sections, subsections/lessons), publish, get paid.
- **Admins** — implied by the `role` enum (`ADMIN`/`INSTRUCTOR`/`STUDENT`) on the User
  model, though no admin-specific features exist yet.

## Current State (as of 2026-07-15)

Auth is functionally complete end-to-end (signup, email verification via OTP, signin,
forgot/reset/change password) for both backend and frontend. Mongoose models exist for
Course, Section, SubSection, Tag, Review, Payment, and CourseProgress, but none of them
have repositories, services, controllers, or routes wired up yet — User is the only domain
with the full stack built.

## Scope Boundaries — What's Next

In scope for the current build-out (in no particular priority order — not yet sequenced):

- **Course browsing & enrollment** — students can search/filter courses, view details,
  enroll.
- **Course creation** — instructors can author courses with sections and subsections,
  publish them.
- **Payments & checkout** — wire up the existing `Payment` model into an actual purchase
  flow.

Not yet decided / not addressed by any model or discussion:

- Admin-specific features (moderation, analytics, user management).
- Course content delivery format (video hosting? `cloudinary`/`multer` are installed but
  unused — likely for this, unconfirmed).
- Notifications beyond transactional email (OTP, password reset).

If a request falls outside the three areas above and isn't listed here, treat it as
out of scope until confirmed — add it to Open Questions in `progress-tracker.md` rather
than assuming.

## Success Criteria

This is a learning project, not a deadline-driven MVP:

- Prioritize correctness and understanding the pattern over shipping fast.
- It's still handling real-shaped concerns (auth, payments, PII) so don't skip security
  basics (hashing, validation, authz checks) to save time — those are the point of the
  exercise, not overhead to cut.
- No fixed launch date. Depth over speed when the two trade off.
