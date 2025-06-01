/**
 * Environment Variable Validation for DigiClick AI
 * Ensures all required environment variables are properly configured
 */

const requiredEnvVars = {
  development: [
    'PORT',
    'JWT_SECRET',
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS'
  ],
  production: [
    'PORT',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'REDIS_URL',
    'EMAIL_USER',
    'EMAIL_PASS',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_URL',
    'CORS_ORIGIN'
  ],
  test: [
    'JWT_SECRET',
    'MONGODB_URI'
  ]
};

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'SENTRY_DSN',
  'REDIS_PASSWORD'
];

/**
 * Validates environment variables for the current environment
 * @param {string} environment - The current environment (development, production, test)
 * @returns {Object} Validation result with missing variables and warnings
 */
function validateEnvironment(environment = process.env.NODE_ENV || 'development') {
  const missing = [];
  const warnings = [];
  const required = requiredEnvVars[environment] || requiredEnvVars.development;

  console.log(`🔍 Validating environment variables for: ${environment}`);

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else if (process.env[varName].includes('<') || process.env[varName].includes('your-')) {
      warnings.push(`${varName} appears to contain placeholder values`);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Optional variable ${varName} is not set - some features may be disabled`);
    }
  });

  // Specific validations
  validateSpecificVars(warnings);

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    environment
  };
}

/**
 * Validates specific environment variable formats and values
 * @param {Array} warnings - Array to add warnings to
 */
function validateSpecificVars(warnings) {
  // MongoDB URI validation
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    warnings.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
  }

  // Redis URL validation
  if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
    warnings.push('REDIS_URL should start with redis://');
  }

  // Email validation
  if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@')) {
    warnings.push('EMAIL_USER should be a valid email address');
  }

  // JWT Secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Port validation
  if (process.env.PORT && (isNaN(process.env.PORT) || process.env.PORT < 1 || process.env.PORT > 65535)) {
    warnings.push('PORT should be a valid port number (1-65535)');
  }

  // URL validation
  if (process.env.NEXT_PUBLIC_API_URL && !isValidUrl(process.env.NEXT_PUBLIC_API_URL)) {
    warnings.push('NEXT_PUBLIC_API_URL should be a valid URL');
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !isValidUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    warnings.push('NEXT_PUBLIC_APP_URL should be a valid URL');
  }
}

/**
 * Validates if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Prints validation results to console
 * @param {Object} result - Validation result object
 */
function printValidationResults(result) {
  console.log('\n📋 Environment Validation Results:');
  console.log('=====================================');

  if (result.isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required environment variables:');
    result.missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }

  console.log('\n📝 Environment Configuration:');
  console.log(`   Environment: ${result.environment}`);
  console.log(`   Port: ${process.env.PORT || 'Not set'}`);
  console.log(`   Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`   Redis: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
  console.log(`   Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`   Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  console.log('=====================================\n');
}

/**
 * Generates a sample .env file with current configuration
 * @param {string} environment - Target environment
 * @returns {string} Sample .env file content
 */
function generateSampleEnv(environment = 'development') {
  const required = requiredEnvVars[environment] || requiredEnvVars.development;
  const all = [...required, ...optionalEnvVars];
  
  let content = `# DigiClick AI Environment Variables - ${environment.toUpperCase()}\n\n`;
  
  all.forEach(varName => {
    const currentValue = process.env[varName] || '';
    const isRequired = required.includes(varName);
    const comment = isRequired ? '# REQUIRED' : '# OPTIONAL';
    
    content += `${comment}\n${varName}=${currentValue}\n\n`;
  });
  
  return content;
}

/**
 * Main validation function - validates and exits if critical errors
 */
function validateAndExit() {
  const result = validateEnvironment();
  printValidationResults(result);

  if (!result.isValid) {
    console.error('💥 Critical environment variables are missing. Please check your .env file.');
    console.error('📖 Refer to .env.example for required variables.');
    process.exit(1);
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Production environment has warnings. Please review configuration.');
  }
}

module.exports = {
  validateEnvironment,
  printValidationResults,
  generateSampleEnv,
  validateAndExit,
  requiredEnvVars,
  optionalEnvVars
};
