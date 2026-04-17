- **Trade-offs** — What decisions did you make and why? What would you do differently with more time?
On projects with tight deadlines, I always start with the core functionality. Here, I wanted to ensure the system could register and log in a user, send an email, show the daily check-in, persist data in a DB, and be deployable with Docker. Once that was in place, I added a bit more functionality: a journal log UX with backend support, and a streak meter to encourage daily usage.
With more time, I would add richer DB records for the check-ins, an admin portal to create them, more kinds of check-ins, an AI helper, and an AI summary of check-ins through a positive-psychology lens.
- **Limitations** — What are the weaknesses of what you built? What would break first in production?
The email system is deliberately a test setup. The email cron is just an endpoint that sends to all users on demand. In production, I would move this to a proper scheduler that's sensitive to each user's timezone.
- **AI usage** — What AI tools did you use, how did you use them, and what did you have to fix or redo?
I use VS Code with the Claude Code plugin. I also use Claude CoWork for simultaneous research, usually with several tasks running concurrently.
