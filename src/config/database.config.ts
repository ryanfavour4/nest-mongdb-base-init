import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri:
    process.env.MONGODB_URI ||
    'mongodb+srv://mrcharles:<db_password>@cluster0.0i6agvs.mongodb.net/test-db?retryWrites=true&w=majority',
  dbName: process.env.MONGODB_DB_NAME || 'test-db',
}));
