# Versioning Strategy

## API Versioning

All APIs use URL-based versioning:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.

### Version Deprecation Policy
- APIs are deprecated for 6 months before removal
- Deprecation notices are included in response headers
- Migration guides are provided for breaking changes

## Database Schema Versioning

Database migrations use sequential integer versioning:
- Format: `V1`, `V2`, `V3`, etc.
- Stored in migration files: `V1__initial_schema.sql`
- Tracked in `schema_migrations` table

## Module Versioning

All modules use semantic versioning (SemVer):
- Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Package Versions
- `@backend/auth-service`: 1.0.0
- `@backend/project-service`: 1.0.0
- `@backend/notification-service`: 1.0.0
- `@backend/migration-service`: 1.0.0
- `@frontend/shell-app`: 1.0.0
- `@frontend/auth-mfe`: 1.0.0
- `@frontend/workspace-mfe`: 1.0.0
- `@frontend/analytics-mfe`: 1.0.0
- `@frontend/admin-mfe`: 1.0.0
- `@shared-ui/components`: 1.0.0
- `@shared-libs/dto`: 1.0.0
- `@shared-libs/interfaces`: 1.0.0
- `@shared-libs/utils`: 1.0.0

## Version Management

Use the VersionManager utility from `@shared-libs/utils`:
```typescript
import { VersionManager } from '@shared-libs/utils';

const currentVersion = VersionManager.parseVersion('v1.0.0');
const nextVersion = VersionManager.getNextVersion('v1.0.0', 'minor'); // v1.1.0
```

