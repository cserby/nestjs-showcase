# The Challenge

Please refer to [INPUT.md]() for the description of the challenge.

# Coding Exercise

## How to run

This repository is instrumented with CI using [GitHub Actions](../../.github/workflows/test.yaml), which describes how one is supposed to set up a local environment, and execute the tests, that exercise the implemented functionalities.

## Backend Framework

The solution is built upon [Nest.JS](https://docs.nestjs.com/).

## Data persistence

For data persistence, I picked [@nestjs/typeorm](https://docs.nestjs.com/techniques/database) with a [PostgreSQL](https://www.postgresql.org/) backend.

The database is run as a Docker container, and lifecycle is managed by using the `yarn db:start` and `yarn db:stop` commands.
The E2E tests manage the DB lifecycle automatically, in order to allow execution in CI.

## Interface towards the devices

In real-world IIoT systems there are two common choices for the technology selected for upstream interfaces connecting the devices to the IIoT backend:
MQTT and/or WebSockets.

In this example I went for WebSockets/Socket.IO for the following reasons:
* [Nest MQTT](https://docs.nestjs.com/microservices/mqtt) implements a client rather than a broker. That means that I would've needed to host a 3rd
party broker ([Mosquitto](https://mosquitto.org/) for example), but that would've meant extra complexity due to:
  * lifecycle management of the upstream service,
  * propagating information about connection / disconnection events from the broker to Nest (disconnection information would have been possible to propagate using [Will messages](https://www.emqx.com/en/blog/use-of-mqtt-will-message))
* Based on the understanding of the target domain, compute power, or network bandwidth is not a concern, thus WS/Socket.io would be a viable alternative to MQTT

For handling WebSocket connections, I went for using a [Nest Websocket Gateway](https://docs.nestjs.com/websockets/gateways), implemented in [websocket/iiot.gateway.ts]().

The underlying [Socket.IO](https://socket.io/) library allows for [distributed deployments](https://socket.io/docs/v4/using-multiple-nodes/) using a Redis
instance for the sake of routing requests between the backend nodes.

### Auth middleware

In order to demonstrate the possibility for doing Auth on the device interface, I implemented a [middleware](iiotAuth.wsMiddleware.ts), that extracts a
`deviceId` (in real-life this would be a persistent, unique identifier of the device, such as the primary network interface card's MAC address) from the authentication fields of the WebSocket connection. This place would allow more sophisticated interactions with e.g. the data persistency layer, in order to allow secure authentication of the devices.

### Tracking connection states

The Nest WebSocket gateway exposes connection lifecycle hooks, that allows for persisting information about connection states.

I went for storing the last connection, and last disconnection states, but storing the whole history of connection / disconnection events would also be
feasible, following the pattern implemented for storing Telemetry data.

### Ingesting Telemetry data

The solution demonstrates type-safe communications over the WebSocket interface. The protocols for the messages exchanged are described in [websocket/websocket.interface.ts](). These are formulated as [Zod](https://zod.dev/) schemas, which allows runtime shape validation if received messages.

See [websocket/iiot.gateway.ts:L67]() and [pipes/zodvalidation.pipe.ts]() for the implementation.

Telemetry data are persisted in the database using the [IIOTDeviceTelemetry Entity](entities/iiotDeviceTelemetry.entity.ts), linked as a time series to the [IIOTDevice Entity](entities/iiotDevice.entity.ts).

## HTTP API

The solution exposes persisted data about the IIoT devices:
* their device IDs
* their current connection state
* the last time connected
* the last time disconnected
* Telemetry data received from the devices
in the form of an HTTP API: `GET /iiot`, implemented in [iiot.controller.ts]().

The endpoint `POST /iiot/:deviceId` allows HTTP users to request configuration changes from the device.
The communication channel between the HTTP Controller and the WebSocket Gateway is an RxJS Observable.

# IIoT Platform Architecture

## Services

In my eyes, a comprehensive IIoT Platform shall provide the following services to its users:

### Secure Provisioning

This service is about connecting a device the first time to the platform. The outcome shall be the establishment of a device identity, issuing the credentials that allow for subsequent connections to the platform to be securely authenticated.

As a side-effect of this service, the device entity will be created, and all related data entities will be properly initialized.

### Device State tracking

In this service, the devices uses the authenticated, secure connection in order to communicate information about its state to the Platform. This state is then persisted on the Backend. This data might contain e.g.:
* hardware identifiers
* hardware attributes
* network interface states
* software versions
* software component states (running / stopped)
* applied configuration
* etc.

The backend enriches the data with some metadata, including the device identity, a timestamp of the information being received.

### Telemetry ingestion

This service allows the device to push (and optionally the platform to request a push) telemetry data to the platform. The platform stores these data in a time-series format (each data point being tagged with a timestamp of the measurement being made).

### Configuration push

The platform shall allow for changes to the device's configuration to be pushed. A push shall trigger a state update event to be sent by the device, and thus allow for monitoring if the configuration was successfully applied.

### Log ingestion

Having the platform ingest and persist log entries from the devices provides a very high level of observability of the whole system, thus can be a hugely valuable asset in all kinds of debugging.

A standard technology for implementing this would be [rsyslogd](https://www.rsyslog.com/) and the [ELK stack](https://www.elastic.co/elastic-stack).

### Debug access (SSH, remote command execution)

In order to easy debugging and remote management of devices, the platform should expose services that allow for remote code execution on the devices.

### Monitoring & Alerting

The users of the service would most probably find a service that allows monitoring the behavior of their devices based on the telemetry data that's made available by the devices themselves. This service would allow creating dashboards, and probably setting up alerting on unexpected data points, or even trends.

One could use for example [Grafana](https://grafana.com/) for both exposing dashboards, and configuring alerting.

### Multi-tenancy and AAA on the human interfaces

A very important aspect of such a platform would be managing the data from the devices, and access to the devices themselves secure.

Multiple customers would have devices attached to the platform, it's of utmost importance that customers are only allowed to interact with their own devices, and the data from their own devices.

### Scaling & Robustness

The need for scalability of such a platform needs to be carefully analysed.

If there is a need for scaling the backend due to the high volume of devices being connected, one needs to make sure that the following services are available:
* Device connection lookup - finding the backend instance that holds the established connection for a certain device, in order to allow backend to device (downstream) communications
* Data consistency - even in case of network connections being unreliable, and devices frequently reconnecting - most probably to different backend nodes each time - the consistency of their data needs to be maintained

# Engineering practices

## Software Config Management, git flow, PRs, reviews

Based on my previous experiences, I formulated a few suggestions around how the Engineering team shall collaborate using `git` as the configuration management system in [../../CONTRIBUTING.md]().

## CI/CD, test automation, build automation, deployment automation

When a small engineering team is tasked with development and maintenance of a complicated software system providing a high value to the business, automation is of utmost importance.

Confidence in delivering new features, doing refactoring, while keeping the system functional can only be achieved with a _proper_ amount of automated test coverage.

Not only the automated tests need to be implemented, but they need to be executed frequently as well. Here, having them as part of the CI/CD pipeline is a must.

This repository is set up with CI/CD, please refer to [GitHub Actions](../../.github/workflows/test.yaml).

I formulated some suggestions around how to implement a healthy Test Strategy in [../../TESTING.md]().

## Monitoring & Alerting

Last, but not least, one needs to invest (of development effort and infrastructure) into instrumenting the software system with proper monitoring and alerting.

This entails exposing metrics from the backend, collecting and aggregating them, displaying them on dashboards, and implementing alerting based on unexpected values being reported, or even on unexpected trends being identified.

All this, hand-in-hand with a proper SLA and out-of-hours standby policy ensures that any issues arising during operation of the system can be identified and acted upon in a timely manner.
