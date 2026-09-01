import { User } from '../models/User.js';
import { DEMO_ADMIN } from '../../shared/demoCredentials.js';

export const seedDemoAdmin = async () => {
  const email = DEMO_ADMIN.email.toLowerCase();
  let admin = await User.findOne({ email }).select('+password');

  if (!admin) {
    admin = await User.create({
      name: DEMO_ADMIN.name,
      email,
      password: DEMO_ADMIN.password,
      phone: DEMO_ADMIN.phone,
      role: DEMO_ADMIN.role,
      district: DEMO_ADMIN.district,
      badgeNumber: DEMO_ADMIN.badgeNumber
    });

    console.log(`Demo admin created in MongoDB: ${email}`);
    return admin;
  }

  admin.name = DEMO_ADMIN.name;
  admin.phone = DEMO_ADMIN.phone;
  admin.role = DEMO_ADMIN.role;
  admin.district = DEMO_ADMIN.district;
  admin.badgeNumber = DEMO_ADMIN.badgeNumber;

  if (!(await admin.matchPassword(DEMO_ADMIN.password))) {
    admin.password = DEMO_ADMIN.password;
  }

  await admin.save();
  console.log(`Demo admin ready in MongoDB: ${email}`);
  return admin;
};
