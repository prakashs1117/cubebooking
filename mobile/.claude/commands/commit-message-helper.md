# Conventional Commit Helper

## Purpose

Create a commit message with body and footer following GMS's conventional commit format by executing below command to see the changes:

`git diff`

**Important**:Do not add claude co-authorship line or anything related to claude in the commit message.

## Format

<type>(scope): <description> (GMS-123)

[Required body with more details]

[Required footer with references]

## Breaking Changes

For breaking changes (major version bump), add "!" after scope:
feat(userhub)!: remove legacy authentication API (GMS-123)

## Example Commit Message With Body and Footer

feat(userhub): add user role management (GMS-123)

Implement hierarchical role system with granular permissions.

Closes GMS-123
Relates to GMS-124, GMS-125

## Jira Integration

- **Required for feat/fix commits**: Include Jira ticket number
- **Format**: `feat(scope): description (GMS-123)`
- **Footer references**: `Closes GMS-123` or `Relates to GMS-456`
