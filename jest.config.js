const {compilerOptions} = require('./tsconfig.json')
const {pathsToModuleNameMapper} = require("ts-jest");

module.exports = {
  preset: "ts-jest",
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  collectCoverage: true,
  coverageReporters: [
    "text",
    "cobertura"
  ],
  coveragePathIgnorePatterns: ['<rootDir>/dist'],
};
