# Makefile for Firestore CRUD Emulator Project

# Project variables
PROJECT_ID := "storybook-firebase-70993"
FIREBASE_CONFIG := .firebaserc
FIREBASE_JSON := firebase.json

# Makefile variables
NODE_BIN := ./node_modules/.bin

# Install dependencies
.PHONY: install
install:
	npm install

update-dependencies:
	npm install @types/jest@latest @types/node@latest jest@latest ts-jest@latest ts-node@latest typescript@latest @firebase/rules-unit-testing@latest @types/firebase@latest firebase@latest ts-node --save-dev
	npm install @firebase/rules-unit-testing@latest firebase@latest --save


watch.tsc:
	cd functions && npx tsc --watch

.PHONY: start
start:
	make watch.tsc &
	firebase emulators:start --import=.seed/blog   --inspect-functions
# firebase emulators:start  --inspect-functions --import=seed/all-products --project=${PROJECT_ID}

start.functions:
	make watch.tsc &
	cd functions && firebase emulators:start --only functions  --inspect-functions

# Run the tests using Jest
.PHONY: test
# Makefile variables
NODE_BIN := ./node_modules/.bin
test.jest:
	@$(NODE_BIN)/jest tests/blog/jest.ts

test.blog:
	$(NODE_BIN)/jest --verbose tests/blog/posts* 
# firebase emulators:exec --project=codelab --import=.seed/blog "cd functions; npm test"
test:
	$(NODE_BIN)/jest
test.functions:
	$(NODE_BIN)/jest functions/tests/repecheck/index.updateRefTemplates.spec.ts 

test-file:
	$(NODE_BIN)/jest $(file)

populate-emulator.noteapp:
	export FIRESTORE_EMULATOR_HOST=localhost:8080 && npx ts-node ./scripts/noteapp/populateEmurator.ts
populate-emulator.repecheck:
	export FIRESTORE_EMULATOR_HOST=localhost:8080 && npx ts-node ./scripts/repecheck/populateEmurator.ts

queries.repecheck:
	export FIRESTORE_EMULATOR_HOST=localhost:8080 && npx ts-node ./scripts/repecheck/queries.ts
# Set up the Firestore emulator for testing
.PHONY: setup-emulator
setup-emulator:
	firebase setup:emulators:firestore

.PHONY: deploy
deploy:
	firebase deploy --only firestore


gen.cloud:
	npx tsc 
	node dist/noteapp/emulatorTestData.js

gen:
	npx tsc 
	FIRESTORE_EMULATOR_HOST=localhost:8080 node dist/noteapp/emulatorTestData.js


deploy_func:
	cd functions && npm install && npm run build && firebase deploy --only functions --project=${PROJECT_ID}
# 仮想環境をアクティベートしてデプロイする必要がある
# gcloud auth application-default login && \
# cd functions && \
# 	source venv/bin/activate && \
# 	python -m pip install -r requirements.txt && \
# 	cd .. && \
# 	GOOGLE_APPLICATION_CREDENTIALS=$(PATH_TO_SYNC_SPANNER_KEYS) && \
# 	firebase deploy --only functions --project=${PROJECT_ID}
		
deploy_store_rules: 
	firebase deploy --only firestore:rules --project=${PROJECT_ID}

deploy_storage_rules: # storage ルールとバケットの設定が一緒に扱われるため、単に storage と指定
	firebase deploy --only storage --project=${PROJECT_ID} --debug



open_change_plan: # 無料
	open "https://console.firebase.google.com/u/0/project/${PROJECT_ID}/usage/details"
		
# Firestore、FireAuthを有効化してから行う
view_ext_stripe:
	open https://extensions.dev/extensions/stripe/firestore-stripe-payments

install_ext:
	firebase ext:install stripe/firestore-stripe-payments --project=${PROJECT_ID}

uninstall_ext:
	firebase ext:uninstall stripe/firestore-stripe-payments-fp7z --project=${PROJECT_ID}

