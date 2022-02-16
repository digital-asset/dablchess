DIT_NAME=$(shell ddit targetname)
BASENAME=$(shell ddit targetname --basename)
VERSION=$(shell ddit ditversion)


# Development

dar_version := $(shell grep "^version" daml.yaml | sed 's/version: //g')


state_dir := .dev
daml_build_log = $(state_dir)/daml_build.log
daml_codegen_log := $(state_dir)/daml_codegen.log
sandbox_pid := $(state_dir)/sandbox.pid
sandbox_log := $(state_dir)/sandbox.log

operator_bot_dir := operator_bot/bot.egg-info
operator_pid := $(state_dir)/operator.pid
operator_log := $(state_dir)/operator.log

yarn_build_log := $(state_dir)/yarn_build.log
yarn_pid := $(state_dir)/yarn.pid
yarn_log := $(state_dir)/yarn.log

js_bindings_dir := daml-ts
target_dir := target

.PHONY: all package publish
all: package

publish: package
	ddit release

package: ${DIT_NAME}

### DAML server
.PHONY: clean stop_daml_server stop_operator stop_yarn_server

$(state_dir):
	mkdir $(state_dir)

$(daml_build_log): |$(state_dir)
	daml build > $(daml_build_log)

$(js_bindings_dir):
	daml codegen js -o $(js_bindings_dir) .daml/dist/chess-$(dar_version).dar > $(daml_codegen_log)

$(sandbox_pid): |$(daml_build_log)
	daml start --start-navigator "no" > $(sandbox_log) & echo "$$!" > $(sandbox_pid)

start_daml_server: $(sandbox_pid)

stop_daml_server:
	pkill -F $(sandbox_pid) && rm -f $(sandbox_pid) $(sandbox_log)

### Operator bot

$(operator_bot_dir):
	cd operator_bot && poetry install && poetry build

$(operator_pid): |$(state_dir) $(operator_bot_dir)
	cd operator_bot && (DAML_LEDGER_URL=localhost:6865 poetry run python bot/operator_bot.py > ../$(operator_log) & echo "$$!" > ../$(operator_pid))

start_operator: $(operator_pid)

stop_operator:
	pkill -F $(operator_pid) && rm -f $(operator_pid) $(operator_log)

### UI server

$(yarn_build_log): |$(daml_build_log) $(js_bindings_dir)
	cd ui && (yarn install --force --frozen-lockfile > ../$(yarn_build_log))

$(yarn_pid): |$(state_dir) $(yarn_build_log)
	cd ui && (yarn start > ../$(yarn_log) & echo "$$!" > ../$(yarn_pid))

start_ui_server: $(yarn_pid)

stop_ui_server:
	pkill node && rm -f $(yarn_pid) $(yarn_log)

start_all: start_daml_server start_operator start_ui_server

stop_all: stop_daml_server stop_operator stop_ui_server


# Release

dar := $(target_dir)/damlchess-model-$(dar_version).dar
bot := $(target_dir)/damlchess-bot-$(VERSION).tar.gz
ui := $(target_dir)/damlchess-ui-$(VERSION).zip


$(target_dir):
	mkdir $@

${DIT_NAME}: $(target_dir) $(bot) $(dar) $(ui)
	ddit build --skip-dar-build \
		--subdeployment $(bot) $(dar) $(ui)

$(dar): $(target_dir) $(daml_build_log)
	cp .daml/dist/chess-$(dar_version).dar $@

$(bot): $(target_dir) $(operator_bot_dir)
	cp operator_bot/dist/bot-1.0.0.tar.gz $@

$(ui): $(target_dir) $(yarn_build_log)
	cd ui && yarn build
	cd ui && zip -r damlchess-ui-$(VERSION).zip build
	mv ui/damlchess-ui-$(VERSION).zip $@

.PHONY: clean
clean:
	rm -rf $(state_dir) $(operator_bot_dir) $(js_bindings_dir) $(target_dir) *.dit *.dar

.PHONY: prettier
prettier:
	npx prettier --write .
