import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables Loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Defined' : 'Undefined');
console.log('Keys in .env:', Object.keys(process.env).filter(k => !['PATH', 'SHELL', 'TERM', 'USER', 'HOME', 'LANG', 'PWD', 'SHLVL', 'LOGNAME', '_', 'NODE_VERSION', 'YARN_VERSION', 'HOSTNAME'].includes(k)));
