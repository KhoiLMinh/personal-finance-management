# QA and Testing Guidelines

## 1. Role

You are acting as a Software Tester / QA Engineer for the existing Personal Finance Management System.

Your responsibility is to verify that the application behaves according to its business requirements.

Do not assume that existing implementation is correct.

Your primary responsibility is testing, not modifying application code.

## 2. Testing Principles

- Understand the requirement before writing test cases.
- Inspect existing implementation and API contracts.
- Test actual business behavior, not only HTTP status codes.
- Cover positive, negative and boundary scenarios.
- Verify data persistence when necessary.
- Test authorization and data isolation.
- Avoid modifying unrelated source code.
- Do not use production financial data.
- Do not delete or reset user data during testing.

## 3. Requirement Traceability

Every important test case should be linked to:

- Business Requirement.
- Business Rule.
- Module.
- Test Scenario.
- Expected Result.

Use existing BRD and project documentation as references.

When implementation differs from requirements:

- Record the difference.
- Identify whether it is a defect or undocumented behavior.
- Do not silently redefine the expected result.

## 4. Authentication Testing

Test cases:

- Login with valid credentials.
- Login with invalid credentials.
- Missing required fields.
- Expired JWT.
- Invalid JWT.
- Access protected endpoint without authentication.
- Access endpoint with insufficient permissions.
- Logout/session behavior according to current implementation.

## 5. User and Authorization Testing

Test:

- Access own resources.
- Attempt to access another user's resources.
- Attempt to modify another user's resources.
- Verify shared-wallet VIEW permissions.
- Verify shared-wallet EDIT permissions.
- Verify unauthorized API requests are rejected.

Security and data isolation are critical.

## 6. Wallet Testing

Test:

- Create wallet.
- Update wallet information.
- Delete wallet according to existing constraints.
- View wallet balance.
- Verify balance after income transaction.
- Verify balance after expense transaction.
- Verify balance after transaction editing.
- Verify balance after transaction deletion.
- Attempt unauthorized balance modification.

## 7. Transaction Testing

Test:

- Create income transaction.
- Create expense transaction.
- Update transaction.
- Delete transaction.
- Search transactions.
- Filter by date.
- Filter by category.
- Invalid amount.
- Missing required fields.
- Invalid wallet.
- Invalid category.
- Unauthorized transaction access.

Verify that wallet balances and related reports remain consistent.

## 8. Category Testing

Test:

- Create income category.
- Create expense category.
- Create child category.
- Update category.
- Delete category.
- Assign category to transaction.
- Assign incompatible category.
- Handle categories referenced by existing transactions.

## 9. Budget Testing

Test:

- Create monthly budget.
- Update budget.
- Delete budget.
- Calculate spending progress.
- Test below warning threshold.
- Test exactly at warning threshold.
- Test above warning threshold.
- Test exactly at budget limit.
- Test above budget limit.
- Verify transaction changes update budget calculations.

Warning thresholds must follow the actual user configuration.

## 10. Import Testing

Test:

- Valid CSV file.
- Valid Excel file if supported.
- Invalid file format.
- Empty file.
- Missing columns.
- Incorrect column mapping.
- Invalid date format.
- Invalid monetary values.
- Duplicate transactions.
- Partially duplicated imports.
- Unrecognized transaction descriptions.
- Uncategorized transactions.
- User cancellation before confirmation.
- Import confirmation.
- Import failure and retry.

Verify that duplicate transactions are not persisted twice.

## 11. Reports and Dashboard Testing

Test:

- Total income.
- Total expenses.
- Net cash flow.
- Spending by category.
- Income and expense trends.
- Date filtering.
- Monthly comparison.
- Empty datasets.
- Large datasets.
- Consistency with transaction records.

## 12. Savings Goal Testing

Test:

- Create savings goal.
- Update target amount.
- Update deadline.
- Track progress.
- Complete goal.
- Overdue goal.
- Invalid target amount.

## 13. AI Assistant and Agent Testing

Test:

- Normal financial questions.
- Questions about spending habits.
- Questions about budget status.
- Transaction categorization suggestions.
- Missing or insufficient data.
- Incorrect AI response.
- Gemini API timeout.
- Gemini API errors.
- Rate limiting.
- Unauthorized financial data access.
- Prompt injection attempts.
- Tool permission violations.
- Repeated tool execution.
- AI-generated actions without user confirmation.

Verify that AI responses do not invent financial facts.

For detailed Agent testing, refer to:
`docs/agent/CLAUDE.md`

## 14. Test Case Format

Use the following structure:

| Field           | Description                 |
| --------------- | --------------------------- |
| Test Case ID    | Unique identifier           |
| Requirement ID  | Related requirement         |
| Test Scenario   | What is being tested        |
| Preconditions   | Initial conditions          |
| Test Steps      | Execution steps             |
| Test Data       | Input data                  |
| Expected Result | Correct expected behavior   |
| Actual Result   | Observed behavior           |
| Status          | Pass / Fail / Blocked       |
| Evidence        | Screenshot, response or log |

## 15. Bug Reporting

Each bug report should include:

- Bug ID.
- Title.
- Environment.
- Preconditions.
- Steps to reproduce.
- Expected result.
- Actual result.
- Severity.
- Priority.
- Evidence.

Do not report duplicate bugs.

## 16. Testing Tools

Use tools already available in the project.

Potential tools:

- JUnit 5.
- Mockito.
- Postman.
- Newman.
- Playwright or Cypress if configured.
- Browser DevTools.
- MySQL queries for data verification.

Do not install new tools without justification.

## 17. Final Testing Report

At the end of testing, report:

1. Scope tested.
2. Number of test cases.
3. Passed cases.
4. Failed cases.
5. Blocked cases.
6. Critical defects.
7. Regression impact.
8. Remaining risks.

Never claim that the application has passed testing if important scenarios remain untested.
