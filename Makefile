BASENAME=$(shell yq -r '.catalog.name' < dabl-meta.yaml)
VERSION=$(shell yq -r '.catalog.version' < dabl-meta.yaml)

TAG_NAME=${BASENAME}-v${VERSION}
NAME=${BASENAME}-${VERSION}
DAR_NAME=${BASENAME}.dar

# Development

# It would be nice to keep these versions in sync.
dar_version := $(shell grep "^version" daml.yaml | sed 's/version: //g')
bot_version := $(shell cd operator_bot && poetry version | cut -f 2 -d ' ')
ui_version := $(shell cd ui && node -p "require(\"./package.json\").version")

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
	git tag -f "${TAG_NAME}"
	ghr -replace "${TAG_NAME}" "$(target_dir)/${NAME}.dit"

package: $(target_dir)/${NAME}.dit

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

dar := $(target_dir)/dablchess-model-$(dar_version).dar
bot := $(target_dir)/dablchess-bot-$(bot_version).tar.gz
ui := $(target_dir)/dablchess-ui-$(ui_version).zip
dabl_meta := $(target_dir)/dabl-meta.yaml
icon := $(target_dir)/dabl-chess.png

$(target_dir):
	mkdir $@

$(target_dir)/${NAME}.dit: $(target_dir) $(bot) $(dar) $(ui) $(dabl_meta) $(icon)
	cd $(target_dir) && zip ${NAME}.dit *

$(icon): $(target_dir) dabl-chess.png
	cp dabl-chess.png $@

$(dabl_meta): $(target_dir) dabl-meta.yaml
	cp dabl-meta.yaml $@

$(dar): $(target_dir) $(daml_build_log)
	cp .daml/dist/chess-$(dar_version).dar $@

$(bot): $(target_dir) $(operator_bot_dir)
	cp operator_bot/dist/bot-$(bot_version).tar.gz $@

$(ui): $(target_dir) $(yarn_build_log)
	cd ui && yarn build
	cd ui && zip -r dablchess-ui-$(ui_version).zip build
	mv ui/dablchess-ui-$(ui_version).zip $@

.PHONY: clean
clean:
	rm -rf $(state_dir) $(operator_bot_dir) $(js_bindings_dir) $(target_dir)
