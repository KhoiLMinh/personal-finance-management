# Frontend Development Guidelines

## 1. Role

You are working on the Frontend of the existing Personal Finance Management System.

Your responsibility is to implement the user interface and communicate with the Backend correctly.

Do not independently redefine business logic.

## 2. Technology Stack

- React
- TypeScript
- Vite
- React Router
- React Bootstrap
- Bootstrap
- Axios
- Recharts

Inspect the existing package.json before adding dependencies.

## 3. Existing Code First

Before implementing:

- Inspect the existing component structure.
- Identify reusable components.
- Inspect existing API services.
- Understand routing and authentication.
- Follow the existing UI conventions.
- Avoid duplicate components and API functions.

Do not rebuild existing pages unless explicitly requested.

## 4. Authentication

- Follow the existing JWT authentication flow.
- Use the existing authentication context/state management.
- Protect routes according to existing authorization rules.
- Handle expired sessions and HTTP 401 responses.
- Never assume hiding a button is sufficient authorization.
- Do not expose authentication tokens in logs.

## 5. Wallet Management

- Display wallet information from Backend responses.
- Display the correct wallet balance.
- Do not allow direct balance editing unless explicitly supported by the existing business requirements.
- Display shared-wallet member permissions.
- Hide or disable actions that the current user cannot perform.

## 6. Transaction Management

- Clearly distinguish INCOME and EXPENSE.
- Validate required fields before submitting.
- Follow existing transaction DTO/API contracts.
- Display transaction history and filtering results.
- Support editing and deleting according to user permissions.
- Refresh affected data after successful mutations.
- Do not independently calculate and persist wallet balances.

## 7. Category Management

- Support income and expense categories.
- Support parent and child categories where implemented.
- Respect existing category color and icon conventions.
- Do not allow incompatible categories to be selected for a transaction.

## 8. Budget Management

- Display budget limits and actual spending.
- Display progress based on Backend responses.
- Support configurable warning thresholds.
- Clearly distinguish normal, warning and exceeded states.
- Do not hardcode thresholds when the Backend provides configurable values.

## 9. Import Statement

- Follow the existing CSV/Excel import workflow.
- Validate file selection and supported formats.
- Display column mapping when required.
- Display transaction preview before confirmation.
- Highlight possible duplicates.
- Display uncategorized transactions.
- Do not automatically submit imported data before the required user confirmation.
- Display import success and failure information.

## 10. Reports and Dashboard

- Use Backend data as the source of truth.
- Keep date filters consistent across related reports.
- Handle empty datasets.
- Handle loading and error states.
- Ensure charts accurately represent API responses.
- Avoid fabricating financial data.

## 11. AI Assistant and Agent UI

The Frontend is responsible for presenting AI interactions, not executing AI business logic.

Requirements:

- Provide a clear conversation interface.
- Display loading and error states.
- Display AI responses separately from actual financial records.
- Present data sources or references when Backend provides them.
- Distinguish suggestions from confirmed actions.
- Require user confirmation for financial mutations.
- Do not execute financial operations directly from AI-generated text.
- Display tool execution results returned by Backend.
- Prevent users from submitting repeated requests accidentally.

For AI Agent-specific requirements, read:
`docs/agent/CLAUDE.md`

## 12. API Integration

- Reuse the existing Axios instance.
- Follow existing API service patterns.
- Use existing request and response DTO types.
- Handle API errors consistently.
- Do not hardcode production API URLs.
- Do not create duplicate API endpoints.
- Do not bypass Backend validation.

## 13. UI/UX Rules

- Preserve existing visual design.
- Maintain responsive layouts.
- Reuse existing styles and components.
- Avoid unnecessary redesigns.
- Provide feedback for important user actions.
- Use confirmation dialogs for destructive operations.
- Ensure forms have understandable validation messages.

## 14. Testing

Before completing:

- Run TypeScript checks.
- Run the existing build command.
- Test affected pages.
- Test API integration.
- Verify loading, empty and error states.
- Verify role-based UI behavior.

Do not claim that a feature works solely because the page renders successfully.
