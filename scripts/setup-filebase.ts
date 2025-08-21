#!/usr/bin/env bun

/**
 * Filebase Setup Script
 *
 * This script helps set up Filebase for the Festos application.
 * It validates configuration and tests connectivity.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getFilebaseClient } from '../src/lib/filebase/client';

async function setupFilebase() {
  console.log('🚀 Setting up Filebase for Festos...\n');

  try {
    // Step 1: Check environment variables
    console.log('1. Checking environment configuration...');

    const requiredVars = [
      'FILEBASE_ACCESS_KEY_ID',
      'FILEBASE_SECRET_ACCESS_KEY',
      'FILEBASE_BUCKET',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('\n📝 Please add these to your .env.local file:');
      console.log('   FILEBASE_ACCESS_KEY_ID=your_access_key_id');
      console.log('   FILEBASE_SECRET_ACCESS_KEY=your_secret_access_key');
      console.log('   FILEBASE_BUCKET=your_bucket_name');
      console.log('   FILEBASE_ENDPOINT=https://s3.filebase.com (optional)');
      console.log('   FILEBASE_REGION=us-east-1 (optional)\n');

      console.log(
        '🔗 Get your credentials from: https://filebase.com/account/keys'
      );
      process.exit(1);
    }

    console.log('✅ Environment variables found\n');

    // Step 2: Test Filebase connection
    console.log('2. Testing Filebase connection...');

    try {
      const client = getFilebaseClient();
      console.log('✅ Filebase client created successfully\n');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log('❌ Failed to create Filebase client:', errorMessage);
      console.log('   Please check your credentials and bucket name\n');
      process.exit(1);
    }

    // Step 3: Test upload
    console.log('3. Testing upload functionality...');

    try {
      const client = getFilebaseClient();
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Filebase test upload from Festos',
      };

      const result = await client.uploadMetadata(
        'test/festos-setup.json',
        testData
      );
      console.log('✅ Test upload successful!');
      console.log(`   File URL: ${result.url}`);
      console.log(`   File Size: ${result.size} bytes\n`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log('❌ Test upload failed:', errorMessage);
      console.log('   Please check your bucket permissions\n');
      process.exit(1);
    }

    // Step 4: Update environment file
    console.log('4. Updating environment configuration...');
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }

    // Add Filebase configuration if not present
    const filebaseConfig = `
# Filebase Configuration
FILEBASE_ACCESS_KEY_ID=${process.env.FILEBASE_ACCESS_KEY_ID}
FILEBASE_SECRET_ACCESS_KEY=${process.env.FILEBASE_SECRET_ACCESS_KEY}
FILEBASE_BUCKET=${process.env.FILEBASE_BUCKET}
FILEBASE_ENDPOINT=${process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com'}
FILEBASE_REGION=${process.env.FILEBASE_REGION || 'us-east-1'}
`;

    if (!envContent.includes('FILEBASE_ACCESS_KEY_ID=')) {
      envContent += filebaseConfig;
      writeFileSync(envPath, envContent);
      console.log('✅ Environment file updated\n');
    } else {
      console.log('✅ Environment file already configured\n');
    }

    // Step 5: Summary
    console.log('🎉 Filebase setup complete!');
    console.log('\n📋 Summary:');
    console.log(
      `   Access Key ID: ${process.env.FILEBASE_ACCESS_KEY_ID?.substring(0, 8)}...`
    );
    console.log(`   Bucket: ${process.env.FILEBASE_BUCKET}`);
    console.log(
      `   Endpoint: ${process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com'}`
    );
    console.log(`   Region: ${process.env.FILEBASE_REGION || 'us-east-1'}`);

    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your development server');
    console.log('   2. Test event creation in the app');
    console.log('   3. Check that files are uploaded to Filebase');

    console.log('\n📚 Documentation:');
    console.log('   - Filebase: https://docs.filebase.com/');
    console.log('   - S3 API: https://docs.filebase.com/api-docs/');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Setup failed:', errorMessage);
    process.exit(1);
  }
}

// Run the setup
setupFilebase();
