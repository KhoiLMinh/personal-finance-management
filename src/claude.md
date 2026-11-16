# CLAUDE.md

## 1. Project Overview

Project: Personal Finance Management System
Repository: https://github.com/KhoiLMinh/personal-finance-management

Đây là dự án đã có mã nguồn và đang trong quá trình phát triển, không phải dự án mới.

Mục tiêu:

- Quản lý tài khoản, ví và giao dịch thu/chi.
- Quản lý danh mục thu/chi.
- Import sao kê ngân hàng CSV/Excel.
- Tự động phân loại và khử trùng lặp giao dịch.
- Quản lý ngân sách và mục tiêu tiết kiệm.
- Phân tích tài chính và trực quan hóa dữ liệu.
- Quản lý ví chia sẻ.
- Mở rộng hệ thống với Personal Finance AI Agent.

## 2. Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- React Bootstrap / Bootstrap
- Axios
- Recharts

### Backend

- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL
- Flyway
- JWT
- Maven

### AI

- Gemini API
- AI-powered financial analysis
- AI transaction categorization
- Personal Finance AI Agent (định hướng mở rộng)

Lưu ý: Luôn kiểm tra package.json, pom.xml và mã nguồn thực tế trước khi sử dụng hoặc đề xuất thay đổi công nghệ.

## 3. Core Development Principles

### 3.1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State assumptions explicitly.
- If multiple interpretations exist, present them.
- Ask when requirements are unclear.
- Identify existing functionality before implementing new functionality.
- Prefer the simplest solution that satisfies the requirement.
- Do not silently change business rules.

### 3.2. Simplicity First

Minimum code that solves the problem.

- No features beyond what was requested.
- No unnecessary abstractions.
- No speculative architecture.
- No unnecessary dependencies.
- Avoid overengineering.
- Prefer existing utilities and services.

### 3.3. Surgical Changes

Touch only what is necessary.

- Do not refactor unrelated code.
- Do not modify existing APIs without understanding their consumers.
- Preserve existing coding conventions.
- Do not delete existing functionality without permission.
- Remove only unused code introduced by your changes.
- Check the impact of modifications across modules.

### 3.4. Goal-Driven Execution

For multi-step tasks:

1. Inspect existing implementation.
2. Identify affected modules.
3. Define expected behavior.
4. Implement the smallest necessary changes.
5. Run relevant tests.
6. Report modified files and verification results.

Do not claim completion without verification.

## 4. Existing Project First

This is an existing software project.

Before implementing:

- Inspect the relevant source code.
- Understand existing Entity, DTO, Controller, Service and Repository.
- Check existing API contracts.
- Check existing database schema and Flyway migrations.
- Reuse existing components and services.
- Understand current authentication and authorization mechanisms.

STRICT RULES:

- Do not recreate existing features.
- Do not create duplicate services or components.
- Do not replace the existing architecture without approval.
- Do not introduce another database or AI provider without justification and approval.
- Do not assume that documentation is always synchronized with the source code.
- When documentation conflicts with actual implementation, report the difference before making changes.

## 5. Global Business Rules

The following rules are derived from the project BRD. Verify implementation details before changing existing behavior.

### BR-01: Transaction Ownership

- Every transaction must belong to a wallet/account.
- Every transaction must have an income or expense type.
- Every transaction must have an appropriate category.

### BR-02: Transaction Balance

- Income and expense transactions must affect the corresponding wallet balance correctly.
- Editing or deleting a transaction must update related financial calculations consistently.

### BR-03: Transaction Import

- Support the import formats implemented by the project.
- Detect duplicate transactions before saving.
- Allow users to review and confirm imported transactions.
- Transactions that cannot be categorized must be assigned to "Uncategorized".

### BR-04: Budget

- Budgets are associated with categories and specific periods.
- Expenses must be calculated against the corresponding budget period.
- Warning thresholds must follow the configured policy.

### BR-05: Authorization

- Only wallet owners and authorized shared-wallet members may access wallet data.
- VIEW members cannot modify data.
- EDIT members can modify data within their permissions.
- Backend authorization is mandatory.

### BR-06: Audit

- Changes to transactions and budgets must be recorded according to the existing audit mechanism.

### BR-07: Data Isolation

- Users must not access another user's private financial information.
- AI features must follow the same data isolation rules.

### BR-08: Financial Accuracy

- Financial calculations must use the existing backend business logic.
- Monetary values must use BigDecimal on the backend.
- Do not use floating-point arithmetic for financial calculations.

## 6. Cross-Module Rules

When modifying a module, inspect its dependencies.

Examples:

Transaction changes may affect:

- Wallet balance.
- Budget progress.
- Reports.
- Dashboard.
- AI financial analysis.

Category changes may affect:

- Transactions.
- Import categorization.
- Budget.
- Reports.
- AI categorization.

Wallet changes may affect:

- Transactions.
- Shared wallet permissions.
- Financial reports.
- User data isolation.

Never assume a feature is independent without checking its dependencies.

## 7. AI and Agent Development Principles

- AI must not be the source of truth for financial data.
- Financial facts must come from authorized backend data.
- AI-generated explanations must be distinguishable from actual financial records.
- AI must not access data outside the authenticated user's permissions.
- Do not expose API keys, prompts containing secrets, or private financial data in logs.
- Do not allow an LLM to execute arbitrary SQL or access the database directly.
- All AI tools must go through controlled backend services.
- Any operation that changes financial data must require appropriate authorization and user confirmation.
- AI output must not be treated as verified financial advice.

Refer to `docs/agent/CLAUDE.md` when working on the AI Agent.

## 8. Database Rules

- Use existing MySQL database structure.
- Follow the existing Flyway migration strategy.
- Never modify production data during development.
- Do not delete existing migrations.
- Do not reset the database to solve a migration problem without approval.
- Check foreign keys, constraints and relationships before changing schemas.
- Ensure data consistency when modifying financial records.

## 9. Security Rules

- Never hardcode API keys or credentials.
- Use environment variables.
- Never trust userId supplied directly by the frontend.
- Use authenticated identity from Spring Security.
- Validate all incoming requests.
- Enforce authorization on the backend.
- Do not expose stack traces or sensitive information in API responses.
- Protect personal financial data.

## 10. Testing Requirements

Before completing changes:

- Run relevant backend tests.
- Run relevant frontend checks.
- Verify API compatibility.
- Test authorization and data isolation when affected.
- Test boundary conditions for financial calculations.
- Report tests that could not be executed.

Do not modify or remove tests merely to make a failing implementation pass.

## 11. Git Rules

- Do not commit without explicit permission.
- Do not push changes without explicit permission.
- Do not overwrite user changes.
- Do not force push.
- Do not modify unrelated files.
- Keep changes focused and reviewable.

## 12. Final Response

After completing a task, report:

1. What was changed.
2. Why the changes were necessary.
3. Which files were modified.
4. Tests executed and their results.
5. Known limitations or unresolved issues.

Do not claim that untested functionality works.
