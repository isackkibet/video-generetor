module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/backend', '<rootDir>/ai', '<rootDir>/contracts', '<rootDir>/tests']
};
