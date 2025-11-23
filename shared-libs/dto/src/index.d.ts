export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
    };
    version?: string;
}
export interface UserDto {
    id: string;
    email: string;
    profile: Record<string, unknown>;
    organizationId: string;
    roles: RoleDto[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    email: string;
    password: string;
    profile?: Record<string, unknown>;
    organizationId: string;
}
export interface UpdateUserDto {
    email?: string;
    profile?: Record<string, unknown>;
}
export interface RoleDto {
    id: string;
    name: string;
    permissions: PermissionDto[];
    hierarchy: number;
    organizationId: string;
}
export interface PermissionDto {
    resource: string;
    action: string;
    scope: string;
    conditions?: Record<string, unknown>;
}
export interface ProjectDto {
    id: string;
    name: string;
    description?: string;
    settings: Record<string, unknown>;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateProjectDto {
    name: string;
    description?: string;
    settings?: Record<string, unknown>;
    organizationId: string;
}
export interface UpdateProjectDto {
    name?: string;
    description?: string;
    settings?: Record<string, unknown>;
}
export interface TaskDto {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: number;
    customFields: Record<string, unknown>;
    projectId: string;
    assigneeId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: number;
    customFields?: Record<string, unknown>;
    projectId: string;
    assigneeId?: string;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: number;
    customFields?: Record<string, unknown>;
    assigneeId?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    organizationName?: string;
}
export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}
export interface MigrationDto {
    id: string;
    version: string;
    name: string;
    type: 'sql' | 'nosql';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
    executedAt?: Date;
    executionTime?: number;
    error?: string;
}
export interface CreateMigrationDto {
    version: string;
    name: string;
    type: 'sql' | 'nosql';
    content: string;
}
export interface ExecuteMigrationDto {
    version: string;
    type: 'sql' | 'nosql';
}
//# sourceMappingURL=index.d.ts.map