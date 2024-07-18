# Tech Challenge response for Spirii

This repo contains the response for the tech challenge posed by Spirii.

## Input

See the task description in [INPUT.md]()

## Solutions

### Coding challenge

The implemented solution is a Next.JS application that exposes two endpoints:

1. `GET /ledger/:userId`, which returns the current balance of the user with the specified ID.
1. `GET /payouts`, which returns a list of payouts aggregated for each user ID.

Both behaviors are covered with low and high-level tests, thus I'd suggest running those (using `yarn test` and `yarn test:e2e`) to observe the solution.

#### Data from Transaction API

Due to the constraints on the Transaction API volume mentioned in the input, I suggest an architecture
for both `LedgerService` and `PayoutsService` that consumes the stream of transactions in some manner,
and builds a materialized view - a data store containing the aggregated data - that is then used to
serve the high volume of requests expected. Otherwise (if we'd rely on online data from the Transactions API)
the high volume of incoming traffic would soon exhaust the API limits.

With the Transaction API described in the task description, this can for example be achieved using
[Nest Scheduling](https://docs.nestjs.com/techniques/task-scheduling). The scheduled task would need to
run at a maximum interval of two minutes (in order to fulfill the requirements on data delay), store
the timestamp of the last synchronization, and request all transactions happening since.

As the Transaction API seems to be paginated, I'd suggest implementing a fetcher based on the [Generator
pattern](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator),
that'd ensure fetching all transaction items by iterating while there are more pages available.

Based on this stream of incoming Transactions, the scheduled task would be able to update the materialized view.

Storage of the materialized view should be engineered based on the constraints set by:
* expected size of the view, and
* the cost of rebuilding.

Easiest solution would be to use a shared storage (like a database instance - MySQL for example), but if
the above mentioned constraints allow, I can imagine an in-memory database being a feasible alternative.

> I spent most of my time in the coding challenge struggling with trying to set up 
> [Auto Mocking](https://docs.nestjs.com/fundamentals/testing#auto-mocking). In the absence of the real implementation
> of the TransactionsModule/Service, I couldn't figure out a way. I fell back to having the mocked transaction
> data hard-coded, which is - of course - not optimal, as the mocked data _should be_ defined in the test
> itself, in order for it to be explicite, and modifiable to match the goal of the test case at hand.
> Due to this, I needed to make simplifications, for example I disregarded the fact that the input document
> suggests that the Transactions API is paginated.

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

## Leadership Case: Technical Alignment - Handling queues

### Approach

As data services and their way of use is a fundamental part of a software system's architecture (meaning that it can be very costly to
change our minds about it late in development), I'd suggest investing the proper amount of time into understanding and discussing the needs and requirements that stem from the business requirements. For that, I'd encourage open discussion by organizing meetings or workshops where senior developers can present their opinions and approaches.

Based on the requirements and constraints identified, I'd suggest looking into different technologies, services, service-interaction models available on the market. There are a plethora of options, which need to be evaluated based on their:

* persistence/storage guarantees (where Kafka persists events, Redis PubSub is fire-and-forget)
* delivery guarantees (Kafka ensures at-least-once delivery, whereas Redis PubSub has no delivery guarantees)
* disaster recovery functionalities
* scalability
* cost of ownership (especially in case of cloud services, such as AWS MSK/SQS)

Once the available options are filtered on the needs, the remaining contestants need to be evaluated in a Proof of Concept. For the
PoC to be successful, the evaluation criteria need to be carefully designed.

With the outcome of the PoC, I'd once again invite various stakeholders, present the findings to them, and let them express their views
based on their respective expertise. For example a DevOps stakeholder might have some insights on the future maintainability, observability
and costs of the selected technology.

Once the best-fitting alternative is selected, the usage needs to be standardized on, for this, various documents, how-to's need to be
written. The developers need to be educated.

For future adaptations, one needs to consider that a Queue is inherently an external API of the System, the consumers of it are out of
our hands, thus it's contract needs to be documented, tested for, and safeguarded against backwards incompatible changes, by for example
versioning and maintaining a schema repository describing the different versions. This approach also alleviates the stress of defining
the first version of the schema, as it opens up the option for experimentation and iterative improvement. One doesn't come up with the
golden schema for the events at start.

This also means that consumers need to be prepared to receive (new) unexpected data on the queues. As consuming a Queue is inherently
an asynchronous operation, there's no channel the consumer can use to back-propagate any errors it encounters during consuming. When
implementing consumers, one needs to make sure that other means of signaling errors are in place, such as dead-letter queues, monitoring
and alerting set up on those.

Reading up on the subject might help with coming up with a shared dictionary, and thus terms to use. I'd suggest reading
[Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321)
which provides in-depth descriptions on the different database systems, the services and guarantees they provide, and even practical
guidelines on how to chose the proper technology for a specific engineering problem at hand.
