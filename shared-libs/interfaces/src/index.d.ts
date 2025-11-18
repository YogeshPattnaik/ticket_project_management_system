export interface Permission {
    resource: string;
    action: string;
    scope: string;
    conditions?: Record<string, unknown>;
}
export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
    hierarchy: number;
    organizationId: string;
}
export interface Workflow {
    id: string;
    name: string;
    triggers: Trigger[];
    conditions: Condition[];
    actions: Action[];
    projectId: string;
}
export interface Trigger {
    type: 'status_change' | 'field_update' | 'time_based';
    config: Record<string, unknown>;
}
export interface Condition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: unknown;
}
export interface Action {
    type: 'update_status' | 'assign_user' | 'send_notification' | 'update_field';
    config: Record<string, unknown>;
}
export interface KanbanBoard {
    id: string;
    projectId: string;
    columns: Column[];
    swimlanes?: Swimlane[];
    filters: Filter[];
    automation: WorkflowRule[];
}
export interface Column {
    id: string;
    name: string;
    limit?: number;
    statuses: string[];
    color: string;
    order: number;
}
export interface Swimlane {
    id: string;
    name: string;
    filter: Filter;
}
export interface Filter {
    field: string;
    operator: string;
    value: unknown;
}
export interface WorkflowRule {
    id: string;
    trigger: Trigger;
    action: Action;
}
export interface SLA {
    id: string;
    name: string;
    priority: Priority;
    responseTime: Duration;
    resolutionTime: Duration;
    escalationRules: EscalationRule[];
    projectId: string;
}
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export interface Duration {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'business_days';
}
export interface EscalationRule {
    id: string;
    triggerTime: Duration;
    action: 'notify' | 'reassign' | 'escalate';
    target: string;
}
export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    channels: NotificationChannel[];
    read: boolean;
    createdAt: Date;
}
export type NotificationChannel = 'websocket' | 'email' | 'push';
export interface Migration {
    id: string;
    version: string;
    name: string;
    type: 'sql' | 'nosql';
    content: string;
    status: MigrationStatus;
    executedAt?: Date;
    executionTime?: number;
    error?: string;
    rollbackContent?: string;
}
export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
export interface MigrationVersion {
    version: string;
    type: 'sql' | 'nosql';
    executedAt: Date;
    executionTime: number;
}
export interface ApiVersion {
    version: string;
    deprecated: boolean;
    deprecationDate?: Date;
    sunsetDate?: Date;
}
export interface ModuleVersion {
    name: string;
    version: string;
    dependencies: Record<string, string>;
}
//# sourceMappingURL=index.d.ts.map