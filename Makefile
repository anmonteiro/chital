TESTS = test/*.js
REPORTER = spec
MOCHA = ./node_modules/mocha/bin/mocha
ISTANBUL = ./node_modules/.bin/istanbul
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
COVERAGE_DIR = ./coverage
COVERAGE_REPORT = $(COVERAGE_DIR)/lcov.info

test: test-mocha

test-mocha:
	@NODE_ENV=test $(MOCHA) \
	  --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: test-istanbul

test-istanbul:
	$(ISTANBUL) cover \
		./node_modules/mocha/bin/_mocha \
		--report lcovonly -- -R spec $(TESTS)

coveralls:
	cat $(COVERAGE_REPORT) | $(COVERALLS)

clean:
	rm -rf $(COVERAGE_DIR)
