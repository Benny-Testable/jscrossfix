'use strict';

/**
 * Fake hard-coded credentials for the secret scanners (wb hardcoded-secret rule, gitleaks,
 * detect-secrets, trufflehog). Every value is invented for this test repository and
 * opens nothing. None of them follows a cloud or SaaS provider key format.
 */
const databasePassword = 'Zq7#vR2!mK9$wL4xT8pN';
const sessionSecret = 'f3a9c1e87b2d4605a1c8e9f07b3d5a62';
const serviceApiKey = 'h8Kd29Lq0Zx4Tm7Wc1Vb5Ns3Ry6Pj';
const adminToken = 't0kEn-93Jd82Kd0s9Lq1Zm7xC4vB2nR5';
const signingPassphrase = 'correct-horse-battery-staple-9271';

const legacyConfig = {
  password: 'Pw-81hQ!d02Lk9sZx',
  apiKey: 'x7Qm2Lp9Zc4Vb1Nk8Tw3Rj6Hy5Ds0Fg',
};

module.exports = { databasePassword, sessionSecret, serviceApiKey, adminToken, signingPassphrase, legacyConfig };
