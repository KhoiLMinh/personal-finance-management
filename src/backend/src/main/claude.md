# Backend Development Guidelines

## 1. Role

You are working on the Backend of the existing Personal Finance Management System.

Your responsibility is to implement and protect the system's core business logic, data integrity, APIs, authentication, authorization and AI integrations.

Backend is the source of truth for financial data.

## 2. Technology Stack

- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL
- Flyway
- JWT
- Maven
- Gemini API

Always inspect pom.xml and existing source code before changing dependencies or architecture.

## 3. Architecture

Follow the existing project architecture.

Expected responsibilities:

- Controller: HTTP requests and responses.
- Service: Business logic.
- Repository: Database access.
- Entity: Database representation.
- DTO: Request and response data.
- Security: Authentication and authorization.
- Exception Handler: Centralized exception handling.

Rules:

- Do not put business logic in Controllers.
- Do not expose JPA Entities directly when the existing API uses DTOs.
- Reuse existing services and repositories.
- Avoid duplicate business logic.
- Do not introduce unnecessary architectural layers.

## 4. Authentication and Authorization

- Follow the existing Spring Security configuration.
- Follow the existing JWT implementation.
- Retrieve authenticated user identity from Security Context.
- Never trust userId from request parameters as proof of ownership.
- Verify ownership before accessing private resources.
- Verify shared-wallet permissions on every protected operation.
- Enforce authorization on the Backend, not only the Frontend.

### Shared Wallet

VIEW:

- May view authorized shared-wallet information.
- Cannot create, update or delete restricted financial records.

EDIT:

- May perform permitted operations.
- Must still follow ownership, validation and resource access rules.

Do not assume that VIEW and EDIT have identical permissions.

## 5. Wallet Business Logic

- A user may manage multiple wallets.
- Every transaction must be associated with a valid wallet.
- Wallet access must be checked before reading or modifying its data.
- Wallet balance must follow the existing calculation strategy.
- Do not allow arbitrary balance modification.
- Ensure transaction changes are reflected consistently in wallet balances.

## 6. Transaction Business Logic

- Every transaction must belong to a wallet.
- Every transaction must have an income or expense type.
- Every transaction must have a valid category according to current business rules.
- Validate monetary values.
- Use BigDecimal for financial calculations.
- Validate ownership and permissions before modifications.
- Editing and deleting transactions must update related calculations correctly.
- Preserve transaction history and audit requirements.

Check the effects on:

- Wallet balance.
- Budget.
- Dashboard.
- Reports.
- AI financial analysis.

## 7. Category Management

- Support income and expense categories.
- Follow the existing parent-child category structure.
- Validate category ownership and availability.
- Preserve category color and icon information.
- Prevent incompatible category assignments.
- Do not silently delete categories referenced by existing transactions.

## 8. Budget Management

- Budgets are associated with categories and periods.
- Calculate expenses for the correct budget period.
- Follow configured warning thresholds.
- Do not hardcode user-configurable warning percentages.
- Update budget calculations when related transactions are created, edited or deleted.
- Ensure consistent results across reports and dashboard APIs.

## 9. Transaction Import

Follow the existing import implementation.

Requirements:

- Validate file type and content.
- Parse and normalize transaction data.
- Support the formats currently implemented.
- Handle different column mappings.
- Detect duplicate transactions.
- Keep import batches traceable.
- Support preview and confirmation where required.
- Assign unmatched transactions to Uncategorized.
- Prevent duplicate persistence.
- Handle partial failures according to existing import behavior.
- Maintain database consistency.

Do not change duplicate detection rules without understanding the current implementation.

## 10. Financial Reports

- Use database records as the source of truth.
- Aggregate income and expenses accurately.
- Apply date filters consistently.
- Respect wallet and user access permissions.
- Avoid double-counting transactions.
- Ensure reports remain consistent after transaction modifications.
- Consider query performance with large transaction datasets.

## 11. Savings Goals

- Follow the existing savings goal model.
- Validate target amounts and deadlines.
- Calculate progress using the existing business rules.
- Handle completed and overdue goals correctly.
- Do not fabricate progress values.

## 12. Audit and Data Integrity

- Follow existing audit mechanisms.
- Record relevant changes to transactions and budgets.
- Use database transactions when multiple operations must succeed or fail together.
- Preserve referential integrity.
- Avoid destructive schema changes.
- Use Flyway for database migrations.

## 13. AI Integration

- Follow the existing Gemini integration.
- Reuse existing AI services when appropriate.
- Separate AI-generated content from verified financial records.
- Validate AI responses before using them.
- Handle API errors, timeouts and rate limits.
- Never expose API keys.
- Do not allow AI responses to bypass business validation.

For AI Agent implementation, follow:
`docs/agent/CLAUDE.md`

## 14. API Design

- Preserve existing endpoint conventions.
- Maintain compatibility with Frontend DTOs.
- Use appropriate HTTP status codes.
- Validate incoming requests.
- Handle exceptions consistently.
- Do not change API contracts without checking Frontend dependencies.
- Document breaking changes.

## 15. Testing

Use the existing test structure.

Expected testing:

- Unit tests for Service business logic.
- Mockito for dependencies.
- Integration tests for important API workflows.
- Security tests for ownership and permissions.
- Boundary tests for monetary calculations.
- Regression tests for existing functionality.

Do not modify tests just to hide implementation defects.

## 16. Performance and Security

- Avoid unnecessary database queries.
- Avoid N+1 query problems.
- Use pagination where appropriate.
- Validate uploaded files.
- Prevent unauthorized data access.
- Do not expose sensitive financial information in logs.
- Do not execute arbitrary SQL from AI-generated content.

### AI Agent Tool Integration

- AI Tools must act as adapters between the Agent and existing Backend Services.
- Tools must not duplicate existing business logic.
- Tools must not access JPA Repositories directly when an existing Service provides the required capability.
- Every tool execution must validate the authenticated user's permissions.
- Tool arguments must be validated before execution.
- Tool outputs should use structured DTOs.
- Do not expose internal Entity objects directly to the LLM.
- Do not trust user identity, permissions, or ownership claims generated by the LLM.
- Keep the initial Agent read-only.
- Apply execution limits and safe error handling to tool calls.
