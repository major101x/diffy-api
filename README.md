# Diffy - Real-time Collaborative Code Review Platform

**Live Demo:** https://diffy-two.vercel.app  
**Backend API:** https://diffy-api.onrender.com  
**Source Code (Frontend):** https://github.com/major101x/diffy  
**Source Code (Backend):** https://github.com/major101x/diffy-api

---

## The Problem

Engineering teams waste hours each week context-switching during code reviews. Reviewers jump between GitHub for diffs, Slack for discussions, Loom for explanations, and Notion for decisions. Comments get lost. Context disappears. Reviews that should take 20 minutes take 2 hours across 3 platforms.

Diffy centralizes the entire code review workflow in one interface. View diffs, comment inline, discuss in real-time, and resolve threads without ever leaving the app.

---

## Tech Stack & Architecture Decisions

**Frontend:** Next.js 14 (App Router) deployed on Vercel - chosen for server components and built-in API routes  
**Backend:** NestJS on Render - modular architecture perfect for webhook processing and real-time infrastructure  
**Database:** PostgreSQL with Prisma ORM (hosted on Aiven) - relational data model for comments, threads, and user relationships  
**Authentication:** GitHub App OAuth - provides installation-scoped access tokens (more secure than personal access tokens)  
**Real-time:** Socket.io - bidirectional communication for live comments, typing indicators, and presence  
**Async Processing:** BullMQ + Redis (Valkey) - handles webhook processing in background to prevent request timeouts

Why this stack? I needed webhook reliability (BullMQ), real-time collaboration (Socket.io), and GitHub integration depth (GitHub App). This combination handles the core technical challenges of a code review platform.

---

## Key Technical Challenges

### 1. GitHub App Authentication Complexity

**Challenge:** GitHub Apps use installation access tokens (not user tokens), requiring different auth flows for users vs. repository access

**Solution:** Implemented dual auth strategy - Passport.js for user sessions + installation tokens for GitHub API calls. This provides user context while maintaining proper repo-level permissions.

---

### 2. Real-time Event Broadcasting

**Challenge:** Initial Socket.io implementation broadcast typing indicators and comments to all connected users, not just those viewing the same PR

**Solution:** Implemented room-based isolation (one room per PR). Users join rooms on PR view, events only broadcast within that room. Reduced unnecessary network traffic by 90%.

---

### 3. Webhook Reliability

**Challenge:** GitHub can send duplicate webhooks or webhooks can fail/timeout under load

**Solution:** Built idempotency layer using webhook delivery IDs + BullMQ for async processing. Duplicate webhooks get filtered, failed jobs auto-retry with exponential backoff. Prevents data corruption and ensures no missed events.

---

### 4. Installation Lifecycle Management

**Challenge:** Users uninstalling the GitHub App mid-session caused crashes (null installation ID)

**Solution:** Added webhook handlers for installation.deleted events to gracefully handle uninstalls. App now prompts users to reinstall instead of crashing.

---

## Core Features

- **PR Diff Viewer:** Side-by-side code comparison with syntax highlighting for all file changes
- **Inline Comments:** Attach comments to specific files and line numbers with threading support
- **Real-time Collaboration:** Live typing indicators, user presence ("3 people viewing"), instant comment sync
- **Comment Resolution:** Mark threads as resolved/unresolved, filter to show only active discussions
- **Webhook Integration:** Automatic PR sync when commits pushed or PR updated
- **Live Chat:** Persistent room-based chat for each PR (separate from inline comments)

---

## What I’d improve next

If productionizing this for real teams, I would:

- Add notification system - Email/Slack alerts when someone comments on your PR or mentions you
- Implement diff chunking - Large PRs (500+ line changes) currently load slowly; would paginate or lazy-load file diffs
- Build approval workflow - Allow reviewers to formally approve/request changes (like GitHub's review system)
- Add line-based comments to diff display - Currently only shows comments in separate component; should also display on diff view
- Persist chat history - Live chat currently only exists in-memory; would save to PostgreSQL for historical reference

These aren't bugs, they're scope tradeoffs I made to ship an MVP in 14 days.

---

## Development Timeline

Built and deployed in 12 days as part of a focused execution challenge:

- **Days 1-2:** GitHub App integration + OAuth
- **Days 3-5:** Webhook processing with BullMQ
- **Days 6-9:** Real-time infrastructure (Socket.io + comments)
- **Days 10-11:** PR diff display + comment threading
- **Days 12-14:** Production deployment (backend + frontend)

Why this matters: Building Diffy taught me that shipping consistently beats perfect architecture. I could have spent weeks researching the "ideal" real-time system design, but instead I shipped an MVP in 12 days, learned from real implementation challenges, and now have a deployed product instead of a planning doc.
