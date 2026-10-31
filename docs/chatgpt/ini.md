I'd build this as a self-hosted WhatsApp Automation & Management Platform, with `evolution-go` as the underlying WhatsApp connectivity engine.

The goal is to make it work like a multi-account WhatsApp Web management server:

1. Open your web dashboard.
2. Create a WhatsApp instance.
3. Scan its QR code using WhatsApp on your phone.
4. Establish and persist the session.
5. Start sending and receiving messages through APIs.
6. Create automated messaging workflows.
7. Manage multiple WhatsApp accounts independently.

Important architectural decision: Don't build the WhatsApp protocol yourself. Treat `evolution-go` as the connectivity layer and build your own API, dashboard, automation engine and persistence around it.

The repository already provides much of the infrastructure you need: QR pairing, instance management, REST APIs, WebSockets, webhooks, media handling and PostgreSQL persistence. It uses Go, Gin, whatsmeow and GORM. It also has an existing Manager UI and a license-activation requirement. Don't unnecessarily duplicate these features.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## Copy this prompt into Gemini



Ready to use

Agentic coding task



# PROJECT: WhatsApp Automation & Multi-Instance Management Platform

## ROLE

Act as a Principal Software Architect, Senior Go Backend Engineer, Full-Stack Engineer, and DevOps Engineer.

You are working inside an already-cloned repository:

`evolution-foundation/evolution-go`

Your task is to transform this repository into a complete, self-hosted WhatsApp Automation and Management Platform.

Do not build a WhatsApp protocol implementation from scratch. Evolution Go is the underlying WhatsApp connectivity engine. Build upon its existing capabilities.

Think of the product as a self-hosted alternative to a WhatsApp Business messaging management platform, where users can connect their WhatsApp accounts by scanning QR codes and subsequently manage messaging, automation, integrations, and multiple WhatsApp instances from one dashboard.

---

# 1. PRODUCT VISION

Build a platform that allows an administrator to:

1. Access a web-based administration dashboard.
2. Create multiple WhatsApp instances.
3. Connect each instance by scanning a WhatsApp Web-style QR code.
4. Maintain authenticated sessions persistently.
5. Send and receive WhatsApp messages.
6. Create automated messaging workflows.
7. Schedule messages.
8. Manage contacts and message history.
9. Configure webhooks and external API integrations.
10. Monitor all connected WhatsApp instances.
11. Generate API credentials for external applications.
12. Manage everything from one centralized dashboard.

The platform should be modular, scalable, maintainable and deployable using Docker.

# 2. CRITICAL FIRST STEP: REPOSITORY AUDIT

Before writing any code, inspect the ENTIRE existing repository.

Study:

- README.md
- go.mod
- .env.example
- Makefile
- Dockerfile
- docker-compose files
- cmd/evolution-go/
- pkg/
- manager/
- docs/
- Existing API routes
- Existing database models
- Existing migrations
- Instance management implementation
- QR pairing implementation
- WhatsApp connection lifecycle
- Event handling
- Webhook and WebSocket implementation
- Authentication and authorization
- Existing license activation mechanism

Understand how the existing application works.

IMPORTANT:

- Do not replace working implementations.
- Do not create duplicate WhatsApp connection managers.
- Do not introduce a second WhatsApp protocol library.
- Do not remove existing functionality.
- Do not bypass license activation or existing security controls.
- Do not assume that documented endpoints work exactly as described. Verify their actual implementation.
- Preserve upstream Evolution Go compatibility wherever practical.
- Review LICENSE and TRADEMARKS before redistributing or modifying branding.

First produce a concise architecture assessment and implementation plan. Then proceed with implementation without waiting for approval unless an essential decision genuinely requires clarification.

# 3. ARCHITECTURE

Build the application around the existing Evolution Go engine.

Separate responsibilities into logical modules:

A. WhatsApp Engine

- Existing Evolution Go implementation.
- WhatsApp authentication and session lifecycle.
- QR generation and device pairing.
- Sending and receiving messages.
- Media processing.
- Connection events.

B. Application Backend

- Platform authentication.
- User and workspace management.
- WhatsApp instance administration.
- Contact management.
- Automation engine.
- Scheduler.
- API key management.
- Analytics.
- Webhook management.

C. Frontend Dashboard

- Modern responsive administration interface.
- Instance management.
- QR pairing interface.
- Automation builder.
- Contacts and conversations.
- API documentation.
- Logs and analytics.

D. Infrastructure

- PostgreSQL.
- Redis where useful for queues, caching and scheduling.
- Docker and Docker Compose.
- Persistent session and media storage.
- Structured logging.

Do not introduce microservices unnecessarily. Prefer a modular monolith initially, with clean boundaries that permit future extraction.

# 4. WHATSAPP INSTANCE MANAGEMENT

This is the most important module.

Users should be able to create and manage multiple WhatsApp instances.

Each instance must have:

- Unique instance ID.
- Human-readable instance name.
- Description.
- Connected phone number when available.
- Connection status.
- QR pairing status.
- Authentication/session state.
- Creation timestamp.
- Last connected timestamp.
- Last activity timestamp.

Supported statuses:

- CREATED
- CONNECTING
- QR_REQUIRED
- CONNECTED
- DISCONNECTED
- RECONNECTING
- LOGGED_OUT
- ERROR

Required functionality:

1. Create instance.
2. Generate QR code.
3. Display QR code in the dashboard.
4. Automatically refresh QR when expired.
5. Detect successful device pairing.
6. Update connection status in real time.
7. Persist authentication sessions.
8. Reconnect after server restarts where supported.
9. Disconnect an instance.
10. Delete an instance.
11. Logout a WhatsApp device.
12. Reconnect an existing instance.

The dashboard must not require manual page refreshes to display connection changes.

Use the existing Evolution Go QR and connection event mechanisms.

Never store QR codes as permanent credentials. Protect session data and never expose authentication secrets to the frontend.

# 5. MESSAGING MODULE

Implement a centralized messaging interface.

Supported operations:

- Send text messages.
- Send images.
- Send documents.
- Send videos.
- Send audio.
- Send supported media with captions.
- Receive incoming messages.
- Track delivery/read status where available.
- Retrieve message history where persistence is enabled.
- Handle message failures.
- Retry eligible failed messages safely.

Every message must be associated with:

- Instance ID.
- Recipient.
- Message type.
- Message content or media reference.
- Status.
- Timestamp.
- External message ID when available.

Implement sensible validation, rate limits and error handling.

Do not assume that WhatsApp supports every message operation in every connection state. Respect actual engine capabilities.

# 6. AUTOMATION ENGINE

Build a flexible rule-based automation engine.

Users should be able to create automations without writing code.

Each automation must support:

TRIGGERS:

- Incoming WhatsApp message.
- Incoming message containing a keyword.
- Incoming message matching configured conditions.
- New contact interaction.
- Scheduled date and time.
- Recurring schedule.
- External webhook event.
- API-triggered event.

CONDITIONS:

- Message contains keyword.
- Message matches exact text.
- Sender matches a contact.
- Instance matches a selected instance.
- Current time falls within a configured window.
- Custom logical AND/OR conditions.

ACTIONS:

- Send text message.
- Send media message.
- Wait for a configured duration.
- Call an external HTTP API.
- Trigger a webhook.
- Execute another automation.
- Assign a tag to a contact.
- Stop workflow.

Example automation:

Trigger: Incoming message contains "PRICE".

Action:

1. Wait 2 seconds.
2. Send: "Thank you for contacting us!"
3. Send: "Please tell us which product you are interested in."
4. Record the interaction.

Another example:

Trigger: Scheduled event.

Action:

1. Select WhatsApp instance.
2. Select contacts.
3. Send a predefined message.
4. Record delivery results.

AUTOMATION REQUIREMENTS:

- Enable/disable automation.
- Edit and duplicate automation.
- Execution history.
- Success/failure tracking.
- Retry configuration.
- Execution logs.
- Prevent infinite automation loops.
- Avoid duplicate executions through idempotency.
- Handle time zones correctly.
- Provide a visual workflow builder.

Never implement unrestricted bulk messaging or unsolicited spam. Include consent/opt-in tracking, opt-out handling, suppression lists, per-instance rate limits and compliance safeguards.

# 7. CONTACT MANAGEMENT

Create a contacts module.

Features:

- Add contact manually.
- Import CSV.
- Export contacts.
- Contact name.
- WhatsApp number.
- Email (optional).
- Tags.
- Custom attributes.
- Consent status and consent source.
- Opt-out status.
- Last interaction.
- Associated WhatsApp instance.

Allow contact filtering and segmentation.

A contact can belong to multiple tags.

Support duplicate detection and phone-number normalization.

# 8. SCHEDULER

Build a persistent message scheduling system.

Features:

- Schedule a message for a specific date and time.
- Schedule recurring messages.
- Select WhatsApp instance.
- Select one or more eligible contacts.
- Select message template.
- View pending messages.
- Cancel scheduled messages.
- Retry eligible failed messages.
- View execution history.

The scheduler must survive application restarts.

Do not rely exclusively on in-memory timers.

Use a persistent job queue or database-backed scheduling mechanism.

# 9. MESSAGE TEMPLATES

Allow administrators to create reusable templates.

Support variables:

{{name}}\
{{phone}}\
{{company}}\
{{custom_field}}

Example:

Hello {{name}}, thank you for contacting {{company}}.

Implement safe variable substitution and missing-variable handling.

# 10. WEBHOOKS AND DEVELOPER API

The platform must be API-first.

Expose documented REST APIs for:

- Instance creation.
- Instance deletion.
- QR retrieval.
- Connection status.
- Sending text messages.
- Sending media.
- Retrieving contacts.
- Managing templates.
- Creating automations.
- Triggering automations.
- Scheduling messages.
- Retrieving execution logs.

Implement:

- API key authentication.
- Key revocation.
- Permission scopes.
- Request validation.
- Rate limiting.
- Webhook subscriptions.
- Webhook signature verification.
- Retry mechanism for failed webhook delivery.
- OpenAPI/Swagger documentation.

Use the existing Evolution Go API wherever appropriate. Do not duplicate existing endpoints unnecessarily.

# 11. DASHBOARD UI/UX

Build a professional SaaS-style dashboard.

Suggested sidebar:

OVERVIEW

- Dashboard
- Analytics

WHATSAPP

- Instances
- Conversations
- Contacts

AUTOMATION

- Automations
- Scheduled Messages
- Templates

DEVELOPER

- API Keys
- Webhooks
- API Documentation

SYSTEM

- Activity Logs
- Settings

Dashboard overview should show:

- Total instances.
- Connected instances.
- Disconnected instances.
- Messages sent.
- Messages received.
- Successful automations.
- Failed executions.
- Recent activity.

INSTANCE MANAGEMENT PAGE:

Show instances in a table or card layout.

Each instance should have:

- Name.
- Phone number.
- Status indicator.
- Last activity.
- Connect/reconnect action.
- Settings action.
- Delete action.

Create Instance should open a clean dialog.

After creation, show a dedicated QR pairing screen with:

- QR code.
- Pairing instructions.
- Connection status.
- Automatic QR refresh.
- Successful connection state.

AUTOMATION BUILDER:

Build an intuitive visual workflow editor.

Users should be able to:

- Select a trigger.
- Add conditions.
- Add actions.
- Connect workflow nodes.
- Configure each node.
- Save and activate workflows.

Use a proper visual node editor if compatible with the existing frontend stack.

DESIGN DIRECTION:

- Modern, minimal, professional SaaS interface.
- Light theme by default.
- Neutral backgrounds.
- Clear typography.
- Consistent spacing.
- Subtle shadows and borders.
- Responsive layouts.
- Excellent empty states.
- Loading skeletons.
- Toast notifications.
- Confirmation dialogs.
- Accessible components.

Avoid making it look like a generic admin template.

# 12. SECURITY

Security is mandatory.

Implement:

- Secure authentication.
- Role-based authorization.
- Password hashing.
- Secure session handling.
- API key hashing at rest.
- Encrypted sensitive credentials where appropriate.
- Input validation.
- SQL injection prevention.
- CSRF protection where applicable.
- CORS configuration.
- Rate limiting.
- Audit logs.
- Secure webhook verification.
- Protection against unauthorized instance access.

Never expose:

- WhatsApp session credentials.
- Database passwords.
- API secrets.
- Internal authentication tokens.

Ensure every user can only access their authorized instances and resources.

# 13. DATABASE DESIGN

Inspect the existing PostgreSQL schema before introducing new models.

Design the necessary application entities:

- Users
- Workspaces
- WorkspaceMembers
- Roles
- WhatsAppInstances
- Contacts
- ContactTags
- ContactConsent
- Messages
- MessageTemplates
- Automations
- AutomationTriggers
- AutomationConditions
- AutomationActions
- AutomationExecutions
- ScheduledJobs
- APIKeys
- WebhookSubscriptions
- WebhookDeliveries
- AuditLogs

Adapt these entities to existing models where appropriate.

Requirements:

- Proper foreign keys.
- Appropriate indexes.
- Timestamps.
- Unique constraints.
- Transactional operations.
- Database migrations.
- Workspace-level data isolation.

Do not create redundant tables or conflicting models.

# 14. DOCKER AND DEPLOYMENT

Provide a complete Docker-based deployment.

Include:

- Application container.
- PostgreSQL.
- Redis if required.
- Persistent volumes.
- Environment configuration.
- Health checks.
- Restart policies.
- Production configuration.
- Reverse proxy guidance.

Ensure WhatsApp sessions survive container recreation.

Provide:

- .env.example
- docker-compose.yml
- Deployment documentation.
- Backup and restore instructions.
- Local development instructions.

Never commit actual secrets.

# 15. TESTING

Implement meaningful tests for:

- Instance creation.
- QR pairing lifecycle.
- Connection state transitions.
- Message sending.
- Incoming message processing.
- Automation triggers.
- Automation execution.
- Scheduler persistence.
- API authentication.
- Workspace isolation.
- Webhook delivery.

Mock WhatsApp engine dependencies for automated tests.

Include integration tests where practical.

# 16. DEVELOPMENT METHODOLOGY

Work in incremental phases.

PHASE 1: Repository audit and architecture.

PHASE 2: Backend application foundation and database.

PHASE 3: Multi-instance management and QR pairing.

PHASE 4: Messaging and contact management.

PHASE 5: Automation engine.

PHASE 6: Scheduling and templates.

PHASE 7: Webhooks and developer APIs.

PHASE 8: Dashboard frontend.

PHASE 9: Security, testing and optimization.

PHASE 10: Docker deployment and documentation.

At the end of every phase:

- Verify the implementation.
- Run formatting and linting.
- Run relevant tests.
- Fix compilation errors.
- Update documentation.
- Report completed and pending functionality.

Do not generate a huge amount of disconnected boilerplate.

Write production-quality, maintainable code.

# 17. NON-NEGOTIABLE RULES

1. Inspect before modifying.
2. Reuse existing Evolution Go functionality.
3. Do not rewrite working upstream modules.
4. Do not break existing API compatibility.
5. Do not hardcode credentials.
6. Do not use fake QR codes or simulated connection states in production.
7. Do not mark an instance connected until the actual WhatsApp engine confirms it.
8. Do not use in-memory storage for persistent sessions or scheduled jobs.
9. Do not leave critical functionality as TODOs or placeholders.
10. Do not claim that a feature works without testing it.
11. Maintain clear separation between the WhatsApp engine and the application layer.
12. Follow applicable WhatsApp policies and user-consent requirements.
13. Preserve applicable open-source licensing and attribution obligations.

# 18. FIRST EXECUTION INSTRUCTION

Start by auditing the repository.

Return:

1. Existing architecture.
2. Existing features that can be reused.
3. Missing features.
4. Potential architectural conflicts.
5. Recommended implementation architecture.
6. Proposed directory structure.
7. Database changes required.
8. Phased implementation plan.

Then begin implementing Phase 1 and proceed incrementally.

You have access to the cloned repository. Work directly with the existing source code rather than merely generating code snippets or theoretical instructions.

The final objective is a fully functional, self-hosted WhatsApp automation management platform that can be started locally and deployed on a VPS using Docker.

## My recommended implementation decisions

| Component         | Recommendation          |
| ----------------- | ----------------------- |
| WhatsApp engine   | Evolution Go (existing) |
| Backend           | Go + Gin (existing)     |
| Database          | PostgreSQL              |
| Queue / Scheduler | Redis + persistent jobs |
| Frontend          | React + TypeScript      |
| UI                | Tailwind + shadcn/ui    |
| Real-time updates | WebSockets              |
| Deployment        | Docker Compose          |
| API documentation | Swagger / OpenAPI       |

## A few important things before running Gemini

1. Don't fork the WhatsApp engine unnecessarily. Build your product around its existing APIs and events.
2. License activation: Evolution Go documents a license activation requirement. Verify that your deployment is properly licensed; don't instruct the agent to bypass it.
3. WhatsApp restrictions: QR-based connectivity through whatsmeow is an unofficial WhatsApp Web integration. It can carry account restriction risks. For critical production business messaging, evaluate the official WhatsApp Business Platform as well.
4. Multi-tenancy: Design workspace isolation from day one, even if you're initially the only administrator.

## How I'd execute this with Gemini

Use the prompt in your repository's coding-agent environment with access to the complete project.

My biggest recommendation: don't let Gemini generate the entire platform in one shot. Make it audit first, then implement one phase at a time. This will significantly reduce architectural inconsistencies and broken integrations.

Your first milestone should be extremely simple:

## Milestone 1 — Working WhatsApp Server

1. Start the server locally.
2. Open your dashboard.
3. Create a WhatsApp instance.
4. Display a genuine QR code.
5. Scan it using your phone.
6. Show CONNECTED status.
7. Send a test message through your own API.

First working deliverable

Once this works, build the automation engine on top of it.

That's the foundation I'd prioritize before building all the other features.