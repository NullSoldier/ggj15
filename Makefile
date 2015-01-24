.PHONY: all
all: node_modules/.stamp
	node_modules/grunt-cli/bin/grunt build

node_modules/.stamp: package.json
	npm install
	@touch $@
