module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  moduleNameMapper: {
    /* Because all files under the node_modules directory are not transpiled
    by Jest, we must provide a stub implementation of JS files imported from node_modules/examples/jsm/controls */
    // "three/examples/jsm/controls/(.*)$": "<rootDir>/tests/stub-modules/$1"
    // "^@/(.*)$": "<rootDir>/src/$1"
  },
  // moduleFileExtensions: ["js", "ts", "vue"],
  // transform: {
  //   "^.+\\.vue$": "vue-jest",
  //   "^.+\\.ts$": "ts-jest"
  // },
  verbose: true,
  // roots: ["<rootDir>/src", "<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  snapshotSerializers: ["<rootDir>/node_modules/jest-serializer-vue"]
  // collectCoverage: true,
  // collectCoverageFrom: ["<rootDir>/src/expression/*.ts"]
};
