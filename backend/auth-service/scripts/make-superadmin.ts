import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { UserRole } from '../src/entities/user-role.entity';
import { Organization } from '../src/entities/organization.entity';
import { RefreshToken } from '../src/entities/refresh-token.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function makeSuperAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.POSTGRES_URL,
    entities: [User, Role, UserRole, Organization, RefreshToken],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);
    const organizationRepository = dataSource.getRepository(Organization);

    // Find user
    const user = await userRepository.findOne({
      where: { email: 'yogi@gmail.com' },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      console.error('❌ User yogi@gmail.com not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Organization ID: ${user.organizationId}`);

    // Find or create superadmin role for the organization
    let superadminRole = await roleRepository.findOne({
      where: { name: 'superadmin', organizationId: user.organizationId },
    });

    if (!superadminRole) {
      console.log('⚠️  Superadmin role not found, creating...');
      
      // Check if organization exists
      const organization = await organizationRepository.findOne({
        where: { id: user.organizationId },
      });

      if (!organization) {
        console.error('❌ Organization not found');
        process.exit(1);
      }

      // Create superadmin role
      superadminRole = roleRepository.create({
        name: 'superadmin',
        permissions: [{ resource: '*', actions: ['*'] }],
        hierarchy: 100,
        organizationId: user.organizationId,
      });
      superadminRole = await roleRepository.save(superadminRole);
      console.log('✅ Created superadmin role');
    } else {
      console.log('✅ Found superadmin role');
    }

    // Check if user already has superadmin role
    const hasSuperAdmin = user.userRoles?.some(
      (ur) => ur.role.name === 'superadmin'
    );

    if (hasSuperAdmin) {
      console.log('✅ User already has superadmin role');
    } else {
      // Remove existing roles
      if (user.userRoles && user.userRoles.length > 0) {
        await userRoleRepository.delete({ userId: user.id });
        console.log('✅ Removed existing roles');
      }

      // Assign superadmin role
      const userRole = userRoleRepository.create({
        userId: user.id,
        roleId: superadminRole.id,
      });
      await userRoleRepository.save(userRole);
      console.log('✅ Assigned superadmin role to user');
    }

    console.log('✅ Successfully made yogi@gmail.com a super admin');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

makeSuperAdmin();

