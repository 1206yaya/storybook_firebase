# Makefile for Firestore CRUD Emulator Project

# Project variables
PROJECT_ID := storybook-firebase-70993
FIREBASE_CONFIG := .firebaserc
FIREBASE_JSON := firebase.json

# Makefile variables
NODE_BIN := ./node_modules/.bin

# Install dependencies
.PHONY: install
install:
	npm install

update-dependencies:
	npm install @types/jest@latest @types/node@latest jest@latest ts-jest@latest ts-node@latest typescript@latest @firebase/rules-unit-testing@latest @types/firebase@latest firebase@latest --save-dev
	npm install @firebase/rules-unit-testing@latest firebase@latest --save

# Build the TypeScript project
.PHONY: build
build:
	$(NODE_BIN)/tsc

# Start the Firestore emulator
.PHONY: start-emulator
start-emulator:
	firebase emulators:start --only firestore

# Run the tests using Jest
.PHONY: test
# Makefile variables
NODE_BIN := ./node_modules/.bin

test:
	$(NODE_BIN)/jest

test-file:
	$(NODE_BIN)/jest $(file)
	
test-rules:
	@echo "Running Firestore rules tests..."
	@$(NODE_BIN)/jest tests/userProfile.rules.spec.ts

# Set up the project
.PHONY: setup
setup: install build start-emulator

# Clean the project
.PHONY: clean
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage

# Set up the Firestore emulator for testing
.PHONY: setup-emulator
setup-emulator:
	firebase setup:emulators:firestore

# Run the Firestore emulator in the background
.PHONY: start-emulator-bg
start-emulator-bg:
	firebase emulators:start --only firestore &

# Run tests with coverage
.PHONY: test-coverage
test-coverage:
	$(NODE_BIN)/jest --coverage

# Deploy to Firebase (not applicable for emulator but included for completeness)
.PHONY: deploy
deploy:
	firebase deploy --only firestore

# Default command
default: setup

# Include Firebase configuration files in the clean command
clean: clean-firebase-config

.PHONY: clean-firebase-config
clean-firebase-config:
	rm -f $(FIREBASE_CONFIG)
	rm -f $(FIREBASE_JSON)
