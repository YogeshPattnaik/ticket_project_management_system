import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('User does not have required permissions');
    }

    // Check if user has superadmin role
    const isSuperAdmin = user.roles.some(
      (role: any) => role.name === 'superadmin'
    );

    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super admins can perform this action');
    }

    return true;
  }
}

