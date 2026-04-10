import mongoose from 'mongoose';
import 'dotenv/config';
import AidRequest from './models/AidRequest.js';
import VolunteerTask from './models/VolunteerTask.js';
import User from './models/userModel.js';
import Shelter from './models/Shelter.js';

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database for seeding');

    // Clear existing data
    await AidRequest.deleteMany({});
    await VolunteerTask.deleteMany({});
    await Shelter.deleteMany({});

    // Create sample aid requests
    const sampleRequests = [
      {
        type: 'Medical Supplies',
        urgency: 'Critical',
        description: 'Urgent need for first aid kits and bandages in flood-affected area',
        location: 'Downtown District',
        people: 25,
        status: 'open',
        verified: true,
      },
      {
        type: 'Food & Water',
        urgency: 'High',
        description: 'Families need clean drinking water and non-perishable food items',
        location: 'Riverside Community',
        people: 15,
        status: 'in-progress',
        verified: true,
      },
      {
        type: 'Shelter',
        urgency: 'Medium',
        description: 'Temporary housing needed for displaced families',
        location: 'North End',
        people: 8,
        status: 'open',
        verified: false,
      },
    ];

    const createdRequests = await AidRequest.insertMany(sampleRequests);
    console.log('Created sample aid requests');

    // Create sample volunteer tasks
    const sampleTasks = [
      {
        title: 'Medical Supply Distribution',
        location: 'Downtown District',
        urgency: 'Critical',
        assigned: false,
        relatedRequest: createdRequests[0]._id,
      },
      {
        title: 'Food Package Delivery',
        location: 'Riverside Community',
        urgency: 'High',
        assigned: false,
        relatedRequest: createdRequests[1]._id,
      },
      {
        title: 'Shelter Setup Assistance',
        location: 'North End',
        urgency: 'Medium',
        assigned: false,
        relatedRequest: createdRequests[2]._id,
      },
      {
        title: 'Emergency Response Coordination',
        location: 'City Center',
        urgency: 'High',
        assigned: false,
      },
    ];

    await VolunteerTask.insertMany(sampleTasks);
    console.log('Created sample volunteer tasks');

    // Create sample shelters
    const sampleShelters = [
      {
        name: 'Downtown Community Center',
        location: '123 Main St, Downtown',
        capacity: 50,
        total: 50,
        facilities: ['Restrooms', 'Kitchen', 'Medical Station'],
        contact: '+1-555-0123',
        status: 'active',
      },
      {
        name: 'Riverside School Gym',
        location: '456 River Rd, Riverside',
        capacity: 30,
        total: 30,
        facilities: ['Restrooms', 'Showers'],
        contact: '+1-555-0456',
        status: 'active',
      },
    ];

    await Shelter.insertMany(sampleShelters);
    console.log('Created sample shelters');

    console.log('Database seeded successfully!');
    console.log('Sample data created:');
    console.log('- 3 Aid Requests');
    console.log('- 4 Volunteer Tasks');
    console.log('- 2 Shelters');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();