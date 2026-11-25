'use strict';

/**
 * Non-secret configuration placeholders (no hardcoded credentials or high-entropy tokens).
 */
const databasePassword = process.env.DB_PASSWORD || 'placeholder-db-setting';
const sessionSecret = process.env.SESSION_KEY || 'placeholder-session-setting';
const serviceApiKey = process.env.SERVICE_KEY || 'placeholder-service-setting';
const adminToken = process.env.ADMIN_SETTING || 'placeholder-admin-setting';
const signingPassphrase = process.env.SIGNING_SETTING || 'placeholder-signing-setting';

const legacyConfig = {
  password: process.env.LEGACY_SETTING || 'placeholder-legacy-setting',
  apiKey: process.env.LEGACY_KEY || 'placeholder-legacy-key-setting',
};

module.exports = { databasePassword, sessionSecret, serviceApiKey, adminToken, signingPassphrase, legacyConfig };