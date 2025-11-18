import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleDto, PermissionDto } from '@task-management/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(
    @Body('name') name: string,
    @Body('permissions') permissions: PermissionDto[],
    @Body('hierarchy') hierarchy: number,
    @Body('organizationId') organizationId: string
  ): Promise<RoleDto> {
    return this.rolesService.create(name, permissions, hierarchy, organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async findAll(@Query('organizationId') organizationId?: string): Promise<RoleDto[]> {
    return this.rolesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string): Promise<RoleDto> {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('permissions') permissions?: PermissionDto[],
    @Body('hierarchy') hierarchy?: number
  ): Promise<RoleDto> {
    return this.rolesService.update(id, name, permissions, hierarchy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post(':roleId/assign/:userId')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  @Delete(':roleId/assign/:userId')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  async removeRole(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }
}

