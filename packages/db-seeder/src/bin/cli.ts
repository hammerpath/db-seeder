#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args[0] === 'run') {
  const serverPath = path.join(__dirname, '../server.js');
  const child = spawn('node', [serverPath], {
    stdio: 'inherit'
  });
} else {
  console.log('Unknown command. Use: db-seeder run');
}
