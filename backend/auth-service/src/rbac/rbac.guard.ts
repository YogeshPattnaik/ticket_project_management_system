import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@task-management/interfaces';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userRoles) {
      throw new ForbiddenException('User does not have required permissions');
    }

    // Extract all permissions from user roles
    const userPermissions: Permission[] = [];
    user.userRoles.forEach((userRole: any) => {
      const rolePermissions = userRole.role.permissions as Permission[];
      userPermissions.push(...rolePermissions);
    });

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every((required) =>
      this.checkPermission(userPermissions, required)
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private checkPermission(
    userPermissions: Permission[],
    required: Permission
  ): boolean {
    return userPermissions.some((userPerm) => {
      // Check for wildcard permissions
      if (userPerm.resource === '*' && userPerm.action === '*' && userPerm.scope === '*') {
        return true;
      }

      // Check exact match
      if (
        userPerm.resource === required.resource &&
        userPerm.action === required.action &&
        userPerm.scope === required.scope
      ) {
        return true;
      }

      // Check resource and action match with wildcard scope
      if (
        userPerm.resource === required.resource &&
        userPerm.action === required.action &&
        userPerm.scope === '*'
      ) {
        return true;
      }

      return false;
    });
  }
}

