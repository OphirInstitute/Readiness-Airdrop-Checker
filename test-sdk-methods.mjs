#!/usr/bin/env node

/**
 * Test SDK Methods - Check what methods are actually available
 */

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { readFileSync } from 'fs';

// Load API key
let API_KEY;
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEYNAR_API_KEY=')) {
      API_KEY = line.split('=')[1].trim().replace(/"/g, '');
      break;
    }
  }
} catch (error) {
  console.error('Could not read .env.local file');
}

const config = new Configuration({
  apiKey: API_KEY,
});

const client = new NeynarAPIClient(config);

console.log('🔍 Available Neynar SDK Methods:\n');

// List all available methods
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  .filter(name => typeof client[name] === 'function' && name !== 'constructor')
  .sort();

console.log('📋 Client Methods:');
methods.forEach((method, i) => {
  console.log(`  ${i + 1}. ${method}`);
});

console.log(`\n📊 Total Methods: ${methods.length}`);

// Test specific methods we need
console.log('\n🧪 Testing Key Methods:\n');

// Test 1: lookupUserByUsername
console.log('1. Testing lookupUserByUsername...');
try {
  if (typeof client.lookupUserByUsername === 'function') {
    console.log('   ✅ Method exists');
    // Try with a simple username
    const response = await client.lookupUserByUsername({ username: 'test' });
    console.log('   ✅ Method callable');
  } else {
    console.log('   ❌ Method does not exist');
  }
} catch (error) {
  console.log(`   ⚠️ Method exists but failed: ${error.message}`);
}

// Test 2: Check for address lookup methods
console.log('\n2. Checking address lookup methods...');
const addressMethods = methods.filter(m => m.toLowerCase().includes('address') || m.toLowerCase().includes('ethereum'));
if (addressMethods.length > 0) {
  console.log('   ✅ Found address-related methods:');
  addressMethods.forEach(method => console.log(`      - ${method}`));
} else {
  console.log('   ❌ No address-related methods found');
}

// Test 3: Check for user lookup methods
console.log('\n3. Checking user lookup methods...');
const userMethods = methods.filter(m => m.toLowerCase().includes('user') && m.toLowerCase().includes('lookup'));
if (userMethods.length > 0) {
  console.log('   ✅ Found user lookup methods:');
  userMethods.forEach(method => console.log(`      - ${method}`));
} else {
  console.log('   ❌ No user lookup methods found');
}

// Test 4: Check for quality score methods
console.log('\n4. Checking quality score methods...');
const qualityMethods = methods.filter(m => m.toLowerCase().includes('quality') || m.toLowerCase().includes('score'));
if (qualityMethods.length > 0) {
  console.log('   ✅ Found quality score methods:');
  qualityMethods.forEach(method => console.log(`      - ${method}`));
} else {
  console.log('   ❌ No quality score methods found');
}

console.log('\n🎯 RECOMMENDATIONS:');
console.log('1. Use the correct method names from the list above');
console.log('2. Check Neynar documentation for parameter formats');
console.log('3. Test with known working usernames');
console.log('4. Consider API key limitations');