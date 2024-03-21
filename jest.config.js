module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/**/*.[jt]s", "**/?(*.)+(spec|test).[jt]s"],
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "tests/helper.ts"],
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
