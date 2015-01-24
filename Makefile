.DELETE_ON_ERROR:

GRUNT = node_modules/grunt-cli/bin/grunt --no-color

.PHONY: all
all: build

.PHONY: build
build: node_modules/.stamp
	$(GRUNT) build

.PHONY: server
server: node_modules/.stamp
	$(GRUNT) server

node_modules/.stamp: package.json
	npm install
	@touch $@
