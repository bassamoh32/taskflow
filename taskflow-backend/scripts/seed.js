import dotenv from 'dotenv';
import dns from 'dns';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import Task from '../src/models/Task.js';
import { hashPassword } from '../src/utils/auth.js';

// Set DNS servers early
dns.setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: await hashPassword('Admin@123'),
      role: 'admin'
    });

    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@taskflow.com',
      password: await hashPassword('User@1234'),
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@taskflow.com',
      password: await hashPassword('User@5678'),
      role: 'user'
    });

    console.log('Users created:', [adminUser.email, user1.email, user2.email]);

    // Create tasks
    const tasks = await Task.create([
      {
        title: 'Design database schema',
        description: 'Create MongoDB schema for task management system',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2026-01-10'),
        createdBy: user1._id,
        assignee: user1._id,
        tags: ['design', 'database']
      },
      {
        title: 'Build REST API',
        description: 'Implement Express.js REST API with CRUD operations',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2026-01-20'),
        createdBy: user1._id,
        assignee: user1._id,
        tags: ['backend', 'api']
      },
      {
        title: 'Create React frontend',
        description: 'Build React SPA with routing and forms',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2026-01-25'),
        createdBy: user1._id,
        assignee: user2._id,
        tags: ['frontend', 'react']
      },
      {
        title: 'Setup authentication',
        description: 'Implement JWT-based authentication',
        status: 'todo',
        priority: 'urgent',
        dueDate: new Date('2026-01-18'),
        createdBy: user1._id,
        assignee: user1._id,
        tags: ['security', 'auth']
      },
      {
        title: 'Deploy to Render',
        description: 'Deploy backend API to Render',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-02-01'),
        createdBy: user1._id,
        tags: ['deployment', 'backend']
      },
      {
        title: 'Deploy to Vercel',
        description: 'Deploy frontend to Vercel',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-02-05'),
        createdBy: user1._id,
        tags: ['deployment', 'frontend']
      },
      {
        title: 'Write documentation',
        description: 'Create comprehensive API and setup documentation',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2026-02-10'),
        createdBy: user2._id,
        assignee: user2._id,
        tags: ['documentation']
      },
      {
        title: 'Fix login bug',
        description: 'User reported issue with password reset flow',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2026-01-17'),
        createdBy: user2._id,
        tags: ['bug', 'auth']
      }
    ]);

    // Add comments to tasks
    tasks[1].comments.push({
      userId: user2._id,
      content: 'We should add validation for input fields'
    });

    tasks[1].comments.push({
      userId: user1._id,
      content: 'Good point, I will add comprehensive input validation'
    });

    await tasks[1].save();

    console.log('Tasks created:', tasks.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n--- Test Credentials ---');
    console.log('Admin: admin@taskflow.com / Admin@123');
    console.log('User 1: john@taskflow.com / User@1234');
    console.log('User 2: jane@taskflow.com / User@5678');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
