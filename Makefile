list:
	@awk -F':' '/^[a-zA-Z0-9_.-]+:.*$$/ { if ($$1 != "list") print $$1 ": " $$2 }' Makefile


### Firestore Location: nam5 (us-central)
export PROJECT_ID=storybook-firebase-70993
export REGION=us-central
NODE_BIN := ./node_modules/.bin


# Download the Configurations file from Firebase Console
init:
	firebase init
install:
	npm install
flutter_connect:
	flutterfire configure -y --project=${PROJECT_ID}

start:
	firebase emulators:start --project=${PROJECT_ID}
# firebase emulators:start  --inspect-functions --import=seed/all-products --project=${PROJECT_ID}

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

test-rules:
	@echo "Running Firestore rules tests..."
	@$(NODE_BIN)/jest tests/firestore.rules.spec.ts