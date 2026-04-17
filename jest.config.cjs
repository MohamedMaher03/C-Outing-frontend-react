/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  restoreMocks: true,
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/src/test/__mocks__/fileMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/**/index.ts",
    "!src/**/mocks/**",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
  ],
};
