TESTS = test/*.js
REPORTER = spec
MOCHA = node_modules/mocha/bin/mocha

test: test-mocha

test-mocha:
	@NODE_ENV=test $(MOCHA) \
	    --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)
