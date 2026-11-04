module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@silex/shared$': '<rootDir>/../../packages/shared/dist/index.js',
    '^@silex/contracts$': '<rootDir>/../../packages/contracts/dist/index.js',
    '^@silex/validation$': '<rootDir>/../../packages/validation/dist/index.js',
  },
};
