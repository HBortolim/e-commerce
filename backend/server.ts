import env from 'mandatoryenv';
import app from './src/app';

// Load .env Environment Variables to process.env
env.load([
  'DB_HOST',
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD',
  'PORT',
  'SECRET'
]);

const { PORT } = process.env;

// Open Server on configured Port
app.listen(PORT, () => {
  console.info('Server listening on port', PORT);
});
