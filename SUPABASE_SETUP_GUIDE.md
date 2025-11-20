# 🚀 Supabase Database Setup Guide

## How to Create PostgreSQL Tables in Supabase

This guide will walk you through creating all database tables in your Supabase PostgreSQL database using the architecture defined in `DATABASE_ARCHITECTURE.md`.

---

## Prerequisites

1. ✅ Supabase account created
2. ✅ Supabase project created
3. ✅ Database connection string available
4. ✅ Access to Supabase SQL Editor

---

## Step-by-Step Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"** to create a new SQL script

### Step 2: Create Tables in Correct Order

**Important**: Tables must be created in dependency order (parent tables before child tables).

#### Option A: Run Complete Script (Recommended)

Copy and paste the **entire script below** into the SQL Editor and run it:

```sql
-- ============================================
-- COMPLETE DATABASE SCHEMA FOR TASK MANAGEMENT SYSTEM
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Organizations Table (No dependencies)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table (Depends on: organizations)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Roles Table (Depends on: organizations)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL,
    hierarchy INTEGER DEFAULT 0,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Roles Junction Table (Depends on: users, roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 5. Refresh Tokens Table (Depends on: users)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Projects Table (Depends on: organizations)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tasks Table (Depends on: projects, users)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Comments Table (Depends on: tasks)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Task History Table (Depends on: tasks)
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Kanban Boards Table (Depends on: projects)
CREATE TABLE IF NOT EXISTS kanban_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Board Columns Table (Depends on: kanban_boards)
CREATE TABLE IF NOT EXISTS board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    statuses JSONB NOT NULL,
    limit INTEGER,
    color VARCHAR(7) NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Workflows Table (Depends on: projects)
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    triggers JSONB NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SLAs Table (Depends on: projects)
CREATE TABLE IF NOT EXISTS slas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    response_time JSONB NOT NULL,
    resolution_time JSONB NOT NULL,
    escalation_rules JSONB NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Role-related indexes
CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);

-- Task-related indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_custom_fields ON tasks USING GIN(custom_fields);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);

-- Task history indexes
CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_created ON task_history(created_at);

-- Board indexes
CREATE INDEX IF NOT EXISTS idx_board_columns_board ON board_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_board_columns_order ON board_columns("order");

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);

-- Refresh token indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count tables (should be 13)
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

### Step 3: Execute the Script

1. **Click the "Run" button** (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for execution to complete
3. Check for any errors in the output

### Step 4: Verify Tables Were Created

Run this verification query:

```sql
-- View all created tables
SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Output**: You should see 13 tables:
- board_columns
- comments
- kanban_boards
- organizations
- projects
- refresh_tokens
- roles
- slas
- task_history
- tasks
- user_roles
- users
- workflows

### Step 5: Verify Indexes Were Created

```sql
-- View all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Alternative: Step-by-Step Creation

If you prefer to create tables one by one (useful for debugging), follow this order:

### Phase 1: Core Tables (No Dependencies)
```sql
-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2: User Management Tables
```sql
-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL,
    hierarchy INTEGER DEFAULT 0,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 5. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: Project & Task Tables
```sql
-- 6. Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Task History
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 4: Kanban & Workflow Tables
```sql
-- 10. Kanban Boards
CREATE TABLE IF NOT EXISTS kanban_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Board Columns
CREATE TABLE IF NOT EXISTS board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    statuses JSONB NOT NULL,
    limit INTEGER,
    color VARCHAR(7) NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Workflows
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    triggers JSONB NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SLAs
CREATE TABLE IF NOT EXISTS slas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    response_time JSONB NOT NULL,
    resolution_time JSONB NOT NULL,
    escalation_rules JSONB NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 5: Create Indexes
```sql
-- Run all index creation statements from the complete script above
```

---

## Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already exist. You can either:
- Drop existing tables: `DROP TABLE IF EXISTS table_name CASCADE;`
- Or use `CREATE TABLE IF NOT EXISTS` (already included in script)

### Error: "permission denied"
**Solution**: Make sure you're using the SQL Editor with proper permissions, or run as database owner.

### Error: "column does not exist"
**Solution**: Check that you're running scripts in the correct order (parent tables before child tables).

### Error: "syntax error at or near 'order'"
**Solution**: `order` is a reserved keyword in PostgreSQL. The script uses `"order"` (quoted) to handle this.

### Verify Foreign Keys
```sql
-- Check all foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## Next Steps

After creating the tables:

1. **Update Environment Variables**
   - Update `POSTGRES_URL` in your `.env` files
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

2. **Test Connection**
   ```bash
   # Test from your backend service
   npm run dev:auth
   ```

3. **Run Migrations** (if using migration service)
   ```bash
   npm run dev:migration
   ```

4. **Verify Data Access**
   - Try creating a test organization
   - Create a test user
   - Verify foreign key relationships work

---

## Quick Reference: Table Creation Order

```
1. organizations          (no dependencies)
2. users                  (depends on: organizations)
3. roles                  (depends on: organizations)
4. user_roles             (depends on: users, roles)
5. refresh_tokens         (depends on: users)
6. projects               (depends on: organizations)
7. tasks                  (depends on: projects, users)
8. comments               (depends on: tasks)
9. task_history           (depends on: tasks)
10. kanban_boards         (depends on: projects)
11. board_columns         (depends on: kanban_boards)
12. workflows             (depends on: projects)
13. slas                  (depends on: projects)
```

---

## Supabase-Specific Tips

### 1. Enable Row Level Security (RLS) - Optional
```sql
-- Enable RLS on tables (for multi-tenant security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... etc for other tables
```

### 2. View Tables in Supabase Dashboard
- Go to **"Table Editor"** in Supabase dashboard
- You should see all 13 tables listed
- Click on any table to view its structure

### 3. Test with Sample Data
```sql
-- Create a test organization
INSERT INTO organizations (name, settings) 
VALUES ('Test Company', '{"theme": "light"}'::jsonb)
RETURNING *;

-- Create a test user (you'll need to hash the password first)
-- Note: In production, use bcrypt/argon2 to hash passwords
INSERT INTO users (email, password_hash, organization_id)
VALUES (
    'test@example.com',
    '$2b$10$hashedpasswordhere',  -- Replace with actual hash
    (SELECT id FROM organizations LIMIT 1)
)
RETURNING *;
```

---

## Summary

✅ **Complete SQL script provided** - Copy and paste into Supabase SQL Editor  
✅ **All 13 tables** with proper relationships  
✅ **All indexes** for performance  
✅ **Verification queries** to confirm setup  
✅ **Troubleshooting guide** for common issues  

**Time to complete**: ~2-3 minutes

After running the script, your Supabase database will be ready to use with your application!

---

*Last Updated: 2025-11-18*

