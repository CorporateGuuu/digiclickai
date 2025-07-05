#!/usr/bin/env node

/**
 * This script runs all the tests in the tests directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all test files
const testDir = path.join(__dirname);
const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'));

console.log('Running tests...');

// Run each test file
let allTestsPassed = true;
for (const testFile of testFiles) {
  const testPath = path.join(testDir, testFile);
  console.log(`\nRunning ${testFile}...`);
  
  try {
    execSync(`jest ${testPath}`, { stdio: 'inherit' });
    console.log(`✅ ${testFile} passed!`);
  } catch (error) {
    console.error(`❌ ${testFile} failed!`);
    allTestsPassed = false;
  }
}

// Run E2E tests with Cypress
console.log('\nRunning E2E tests with Cypress...');
try {
  execSync('cypress run', { stdio: 'inherit' });
  console.log('✅ E2E tests passed!');
} catch (error) {
  console.error('❌ E2E tests failed!');
  allTestsPassed = false;
}

if (allTestsPassed) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.error('\n❌ Some tests failed!');
  process.exit(1);
}
