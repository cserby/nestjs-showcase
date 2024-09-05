### Testing Strategy

A newly created NestJS project has two levels of testing auto-generated and pre-configured. I find this
encouraging the good approach.

#### Low-level / Unit tests / White-box tests

Logic implemented in `Controllers` and `Services` should be covered by low-level (unit-test level) coverage
in their respecive `.spec.ts` files.

I added some examples to [src/ledger/ledger.controller.spec.ts]() and [src/ledger/payouts.controller.spec.ts]().

These tests have the advantage of:
* having extreme low startup / teardown costs (thus allowing running them with `--watch`, probably with IDE integration support)
* allow mocking, altering, interacting with, or spying on the code under test in almost any imaginable ways

#### High-level / E2E tests / Black-box tests

Higher level logic, that maybe rely on complex interactions between Services, and maybe Modules as well, shall
be covered in the [test/app.e2e-spec.ts]() file.

These test cases also open up the opportunity to test for HTTP layer interactions, such as Header, Body parsing,
input and output validations.

It might be easier to capture user-facing behaviors of the system in these test cases.

On the other hand, these tests are:
* relatively costly to start / stop, as the whole Nest framework needs to be started, bound to a port, etc.
* offer a limited interface for mocking / interacting with the code under test

#### CI

No matter how many tests are added on no matter what level, if those tests are not run in a *mandatory periodical*
fashion.

For this reason I [instrumented](.github/workflows/test.yaml) this repository with a CI configuration for GitHub Actions, that runs:
* Static Code Analysis
* Low-level tests
* High-level tests

If any of the mandatory quality gates defined in the CI configuration fails, merging to the `main` branch would be
impossible.

In the current setup there's one detail lacking, one needs to protect the `main` branch for direct pushes, as that'd
allow pushing untested code. That functionality is only available on GitHub Enterprise repositories, thus I could
set it up on this repository, but it's not enforced. Were that rule enforced, one could only push code to `main`
via submitting a Pull Request for review, get all the CI checks run towards the changes, as described in [CONTRIBUTING.md]().

#### Continuous Improvements

To disallow pushing new code parts that are not sufficiently covered with tests, thus maintain an increasing trend in
test coverage, I'd suggest implementing coverage measurements hand-in-hand with
[Betterer](https://phenomnomnominal.github.io/betterer/) ran in CI. This tool implements an idea called 
[Ratcheting](https://robertgreiner.com/continuous-code-improvement-using-ratcheting/), which basically enforces the
Boy Scout Rule about leaving the camping site in an even or better state than it was found in.
