.DELETE_ON_ERROR:

GRUNT = node_modules/grunt-cli/bin/grunt --no-color

.PHONY: all
all: node_modules/.stamp
	$(GRUNT) build

node_modules/.stamp: package.json
	npm install
	@touch $@
