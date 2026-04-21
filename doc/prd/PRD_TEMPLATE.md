# Product Requirements Document Template

**How to Use This Template**

This template is the entry point for the AI agent system used to plan and build a new Micro SaaS product.
1. Copy this file to `docs/prd/PRD.md`.
2. Replace every placeholder in `[Describe your X here]` format with your actual product details.
3. Keep the content product-level only.
4. Do not add code, framework decisions, or implementation details.

The Architect agent reads the completed PRD as its primary input. After this document is filled in, the workflow continues through Architect → Designer → Engineer → QA.

> **Guidance:** A strong PRD explains the problem, users, intended behavior, required data, and success criteria clearly enough that planning agents can make consistent decisions without inventing product behavior.

## 1. Product Overview
### Product Name
[Enter your product name]

### Problem Statement
[Describe the core problem your product solves, who experiences it, how often it happens, and what user evidence supports the need for a solution]
> **Guidance:** Include observable pain points such as repeated manual work, lost revenue, user complaints, support requests, or workflow friction. Explain why this problem matters now.

### Target Audience
[Describe your target users, customer segments, industries, company sizes, or team types]
> **Guidance:** Be specific about who this product is for and who it is not for. If there are multiple user groups, list each one briefly.

### Goals and Success Metrics
- [Describe your primary business or user outcome goal]
- [Describe your secondary goal if applicable]
- [Define a measurable success metric with target value and timeframe]
- [Define another measurable success metric with target value and timeframe]
> **Guidance:** Good metrics use numbers, percentages, time saved, activation targets, retention targets, conversion targets, or revenue impact.

### Solution Overview
[Describe at a high level what the product does, how users interact with it, and why it is a good fit for the problem]
> **Guidance:** Keep this brief and product-focused. Explain user value, not implementation.

### Scope Summary
- In scope: [Describe the core capabilities included in the initial version]
- Out of scope: [Describe adjacent ideas that should not be included right now]
> **Guidance:** This helps planning agents avoid expanding into nice-to-have ideas that are not part of the intended release.

## 2. User Roles & Authentication
### User Roles
#### Role: Anonymous User
- Description: [Describe what a non-signed-in visitor can do]
- Primary goals: [Describe what this role wants to accomplish]

#### Role: Authenticated User
- Description: [Describe what a signed-in user can do]
- Primary goals: [Describe what this role wants to accomplish after signing in]

#### Role: [Enter additional role name if needed]
- Description: [Describe what this role can do]
- Primary goals: [Describe the outcomes this role cares about]
> **Guidance:** At minimum, define anonymous and authenticated users. Add more roles only when permissions or workflows differ in meaningful ways.

### Permission Levels
| Role | Can View | Can Create | Can Edit | Can Delete | Admin / Special Actions |
|------|----------|------------|----------|------------|--------------------------|
| Anonymous User | [Describe access] | [Describe access] | [Describe access] | [Describe access] | [Describe access] |
| Authenticated User | [Describe access] | [Describe access] | [Describe access] | [Describe access] | [Describe access] |
| [Enter additional role] | [Describe access] | [Describe access] | [Describe access] | [Describe access] | [Describe access] |
> **Guidance:** Be explicit about ownership rules, shared content, moderation rights, and approval flows.

### Authentication Requirements
- Authentication provider: Firebase Auth
- Sign-in methods: [Describe required sign-in methods such as email/password, Google, GitHub, magic link, or phone]
- Sign-up requirements: [Describe what a user must provide when creating an account]
- Session expectations: [Describe how long sessions should last or any re-authentication expectations]
- Account recovery needs: [Describe password reset, email verification, or account recovery behavior]
> **Guidance:** Specify which sign-in methods the product needs and any onboarding rules tied to authentication, such as invited users only or restricted domains.

### Access and Onboarding Rules
- [Describe when a user should be redirected to sign in]
- [Describe what a new user sees after first authentication]
- [Describe any onboarding checklist, setup wizard, or first-run experience]
- [Describe any gated areas or content unavailable until setup is complete]
> **Guidance:** Clarify how users move from anonymous browsing to authenticated product use.

## 3. Feature Specifications
### Feature List
#### Feature: [Enter feature name]
- Summary: [Describe what the feature does for the user]
- Primary user: [Describe which role mainly uses this feature]
- Trigger: [Describe what action or event starts this feature workflow]
- Expected outcome: [Describe what success looks like for the user]
- Priority: [Describe whether this is must-have, should-have, or nice-to-have]

#### Feature: [Enter feature name]
- Summary: [Describe what the feature does for the user]
- Primary user: [Describe which role mainly uses this feature]
- Trigger: [Describe what action or event starts this feature workflow]
- Expected outcome: [Describe what success looks like for the user]
- Priority: [Describe whether this is must-have, should-have, or nice-to-have]
> **Guidance:** List every user-facing capability the product needs. Each feature should describe behavior from the user perspective, not the implementation perspective.

### User Stories
**As a** [role], **I want to** [action], **so that** [benefit].
**Acceptance Criteria:**
- [ ] [Describe criterion 1]
- [ ] [Describe criterion 2]
- [ ] [Describe criterion 3]

**As a** [role], **I want to** [action], **so that** [benefit].
**Acceptance Criteria:**
- [ ] [Describe criterion 1]
- [ ] [Describe criterion 2]
- [ ] [Describe criterion 3]
> **Guidance:** Acceptance criteria should be testable, specific, and focused on user-visible behavior, permissions, validation, and edge conditions.

> **Note**: Write acceptance criteria in plain language here. The Architect agent
> will transform these into structured acceptance test cases (Given/When/Then format
> with automation hints) in `docs/specs/acceptance-tests.md`. Focus on describing
> WHAT should happen, not HOW to test it.
>
> Good: "User can create a new task with a title and description"
> Good: "Dashboard shows count of completed tasks"
> Avoid: "Click the button with data-testid='create-task'" (too implementation-specific)

> **Example of what Architect produces from your criteria**:
>
> Your PRD says: "User can create a new task with title and description"
>
> Architect produces in `acceptance-tests.md`:
> ```
> ### AT-005: Create task with title and description
> **User Story**: US-02
> **Batch**: Batch-2
>
> **Scenario**:
> Given I am logged in and on the dashboard
> When I click "New Task" and fill in title "Buy groceries" and description "Weekly shopping"
> Then a new task appears in my task list with the title "Buy groceries"
>
> **Automation Hints**:
> - API: POST /api/v1/tasks → 201
> - UI Selector: button[data-testid="new-task"]
> - UI Assertion: .task-list contains "Buy groceries"
> ```

### Core Workflows
#### Workflow: [Enter workflow name]
1. [Describe the first user step]
2. [Describe the next user step]
3. [Describe the system response from the user's point of view]
4. [Describe the completion state]

#### Workflow: [Enter workflow name]
1. [Describe the first user step]
2. [Describe the next user step]
3. [Describe the system response from the user's point of view]
4. [Describe the completion state]
> **Guidance:** Focus on the main paths users follow through the product, especially the flows most important to activation, retention, or value delivery.

### Business Rules
- [Describe validation logic that must always be enforced]
- [Describe permission logic that limits who can take certain actions]
- [Describe workflow rules such as approval, status transitions, or prerequisites]
- [Describe limits such as plan restrictions, usage caps, quotas, or ownership rules]
- [Describe notification or reminder rules if they affect product behavior]
> **Guidance:** Business rules should capture the non-negotiable rules of the product, including exceptions, visibility rules, and ordering rules.

### Edge Cases and Failure Scenarios
- [Describe an important empty state]
- [Describe a validation failure or blocked action]
- [Describe what should happen when a user lacks permission]
- [Describe what should happen when required third-party data is unavailable]
> **Guidance:** Include product behavior for cases that users are likely to hit so planning and QA do not have to infer it later.

## 4. Data Model / Schema
### Data Entity Overview
[Describe all objects that need persistence, why they exist, and how they relate to the user experience]
> **Guidance:** Include every persistent object the product depends on, such as users, organizations, projects, subscriptions, tasks, uploads, reports, settings, or activity records.

### Entity Inventory
- [Enter data entity name]
- [Enter data entity name]
- [Enter data entity name]
> **Guidance:** This quick list helps planning agents identify the full set of data entities before reading detailed definitions.

### Entity: [Name]
Purpose: [Describe why this entity exists and what role it plays in the product]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [Enter field name] | [Enter field type] | [Yes or No] | [Describe what this field stores] |
| [Enter field name] | [Enter field type] | [Yes or No] | [Describe what this field stores] |
Relationships:
- [Describe how this entity relates to another entity]
- [Describe ownership, parent-child, or many-to-many relationships if applicable]
Lifecycle Notes:
- [Describe when this entity is created]
- [Describe when this entity is updated]
- [Describe whether it can be archived, deleted, or restored]

### Entity: [Name]
Purpose: [Describe why this entity exists and what role it plays in the product]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [Enter field name] | [Enter field type] | [Yes or No] | [Describe what this field stores] |
| [Enter field name] | [Enter field type] | [Yes or No] | [Describe what this field stores] |
Relationships:
- [Describe how this entity relates to another entity]
- [Describe ownership, parent-child, or many-to-many relationships if applicable]
Lifecycle Notes:
- [Describe when this entity is created]
- [Describe when this entity is updated]
- [Describe whether it can be archived, deleted, or restored]

### Data Rules
- [Describe uniqueness rules]
- [Describe required relationships]
- [Describe retention or archival expectations]
- [Describe data visibility constraints between users or teams]
> **Guidance:** Keep this section focused on product-level data needs. Do not describe database engines, ORM models, migrations, or implementation details.

## 5. API Endpoints
### API Needs Overview
[Describe all backend capabilities and external API interactions the product requires]
> **Guidance:** Think in terms of product actions that require backend support, such as account setup, content creation, search, reporting, billing sync, notifications, or integrations.

### Endpoint Inventory
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| [GET or POST or PUT or PATCH or DELETE] | [/example-path] | [Describe what this endpoint enables] | [Yes or No] |
| [GET or POST or PUT or PATCH or DELETE] | [/example-path] | [Describe what this endpoint enables] | [Yes or No] |
| [GET or POST or PUT or PATCH or DELETE] | [/example-path] | [Describe what this endpoint enables] | [Yes or No] |

### Endpoint Details
#### Endpoint: [Method] [Path]
- Purpose: [Describe why the product needs this endpoint]
- Triggered by: [Describe which page, workflow, or user action uses it]
- Auth required: [Describe whether authentication is required and which role can use it]
- Request data: [Describe the information the client must send]
- Response data: [Describe the information the user or interface expects back]
- Failure states: [Describe notable error cases or blocked states]

#### Endpoint: [Method] [Path]
- Purpose: [Describe why the product needs this endpoint]
- Triggered by: [Describe which page, workflow, or user action uses it]
- Auth required: [Describe whether authentication is required and which role can use it]
- Request data: [Describe the information the client must send]
- Response data: [Describe the information the user or interface expects back]
- Failure states: [Describe notable error cases or blocked states]

### External API Needs
- [Describe any external service the backend must call]
- [Describe what information is exchanged]
- [Describe any rate limits, retries, or dependency concerns at the product level]
> **Guidance:** Include every backend endpoint and external API dependency needed for the intended product behavior. This section is about capability requirements, not implementation contracts.

## 6. Page Structure & Navigation
### Page Inventory
| Page Name | Route | Audience | Rendering Preference | Purpose |
|-----------|-------|----------|----------------------|---------|
| [Enter page name] | [/example-route] | [Describe target role] | [SSR or CSR] | [Describe why this page exists] |
| [Enter page name] | [/example-route] | [Describe target role] | [SSR or CSR] | [Describe why this page exists] |
| [Enter page name] | [/example-route] | [Describe target role] | [SSR or CSR] | [Describe why this page exists] |
> **Guidance:** Marketing and public discovery pages usually prefer SSR. Authenticated product pages usually prefer CSR. If a page is an exception, explain why.

### Navigation Structure
- Primary navigation: [Describe the main navigation items and where they appear]
- Secondary navigation: [Describe tabs, sub-navigation, settings areas, or account menus]
- Entry points: [Describe how users enter the product from public pages, invitations, emails, or direct links]
- Exit points: [Describe sign-out, cancellation, or completion paths]
> **Guidance:** Explain how users move between pages and which paths matter most.

### Page Details
#### Page: [Enter page name]
- Route: [Enter route]
- Audience: [Describe which role should access this page]
- Rendering preference: [SSR or CSR]
- Key content: [Describe the most important information or actions on the page]
- Main actions: [Describe what users can do here]
- States: [Describe empty, loading, success, and error states]
- Component needs: [Describe the kinds of product components or sections needed on this page]

#### Page: [Enter page name]
- Route: [Enter route]
- Audience: [Describe which role should access this page]
- Rendering preference: [SSR or CSR]
- Key content: [Describe the most important information or actions on the page]
- Main actions: [Describe what users can do here]
- States: [Describe empty, loading, success, and error states]
- Component needs: [Describe the kinds of product components or sections needed on this page]

### Content and Access Flow
- [Describe which pages are public]
- [Describe which pages require authentication]
- [Describe any setup flow, invite-only route, onboarding route, or role-based route restrictions]
> **Guidance:** This section should give the Designer agent enough clarity to map pages, navigation, and major interface states without inventing product behavior.

## 7. Third-party Integrations
### Integration Overview
[Describe all external services the product depends on and why they are needed]
> **Guidance:** Include services for authentication, billing, email, file storage, notifications, analytics, AI features, calendar sync, or other external capabilities.

### Required Integrations
#### Integration: Firebase Auth
- Purpose: User authentication and identity management
- Product usage: [Describe how users sign in and how authentication supports the experience]
- Required configuration: [Describe any providers, domains, or verification expectations]

#### Integration: [Enter service name]
- Purpose: [Describe what this service provides]
- Product usage: [Describe where and why the product uses it]
- Required configuration: [Describe required accounts, API keys, webhooks, domains, or settings]

#### Integration: [Enter service name]
- Purpose: [Describe what this service provides]
- Product usage: [Describe where and why the product uses it]
- Required configuration: [Describe required accounts, API keys, webhooks, domains, or settings]

### Integration Rules and Constraints
- [Describe any dependency the product has on external availability]
- [Describe any fallback behavior if an integration fails]
- [Describe any user consent, account linking, or permission requirement]
- [Describe any environment or region constraints that matter at the product level]
> **Guidance:** Focus on what the product expects from each service and what the user experience should be when a service succeeds, fails, or is not connected.

## 8. Non-functional Requirements
### Performance Requirements
- [Describe acceptable page load expectations]
- [Describe acceptable response time expectations for key user actions]
- [Describe any throughput, batch size, or scaling expectations at a product level]
> **Guidance:** Use practical targets where possible, such as first content visible within a certain time, a search result returned within a certain time, or a report generated within a certain time.

### Security Requirements
- [Describe authentication and authorization expectations]
- [Describe data privacy or tenant isolation expectations]
- [Describe sensitive actions that require extra protection]
- [Describe auditability or logging expectations if relevant]
> **Guidance:** Keep this at the requirement level. Describe what must be protected and what controls are expected from the product perspective.

### Browser and Device Support
- Supported browsers: [Describe required browsers and versions if known]
- Supported devices: [Describe desktop, tablet, and mobile expectations]
- Responsive behavior: [Describe whether full functionality must be available on smaller screens]

### Reliability and Support Expectations
- [Describe uptime or availability expectations if important]
- [Describe backup, recovery, or continuity expectations at a product level]
- [Describe support expectations for failed jobs, missed notifications, or retriable actions]

### Technical Considerations
- [Describe product-level technical constraints or preferences]
- [Describe compliance, region, integration, or data residency constraints]
- [Describe any compatibility requirements with existing systems or customer environments]
- [Describe any migration, import, export, or interoperability needs]
> **Guidance:** Include constraints that shape planning decisions, but avoid implementation instructions. This is where you capture requirements that the Architect agent must preserve while designing the solution.

### Deployment Notes
- [Describe any hosting, environment, or rollout expectations at a product level]
- [Describe whether staged rollout, private beta, or invite-only launch is required]
- [Describe any monitoring or operational expectations that affect product readiness]
> **Guidance:** Only include deployment expectations that affect product planning, launch sequencing, or release readiness. Do not include infrastructure implementation steps.

## Design Reference (Optional)

Provide ONE of the following design sources (in order of preference). The Designer agent uses this to extract design tokens and map components.

1. **Local HTML file**: Path to an HTML mockup or export
   - Path: `designs/mockup.html`
2. **Stitch prompt**: Describe the desired UI for AI generation
   - Prompt: "[describe the UI appearance and style]"
3. **Figma URL**: Link to existing Figma designs
   - URL: `https://figma.com/design/...`
4. **None**: Designer will generate component suggestions from the PRD descriptions above

> **Guidance:** This section is optional. If you have a local HTML mockup from a previous design tool export, that provides the highest fidelity for the Designer. If you have none, the Designer agent can still produce a design system from the PRD's UI/UX Requirements section.
