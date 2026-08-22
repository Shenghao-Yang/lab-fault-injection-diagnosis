# Fault Experiments with Toxiproxy

This repository contains the starter services and deterministic tooling for
Lab 8. Open it in the provided devcontainer and follow the tasks on the course
website.

The devcontainer starts a small Docker Compose stack with:

* Checkout at <http://localhost:3000/checkout>
* The Toxiproxy administration API at <http://localhost:8474>
* A pricing service reached by checkout through the `pricing` proxy

Establish the expected failing baseline before making changes:

```console
./scripts/check-lab
```

The checkout service already returns a bounded failure when pricing is delayed.
The initial check reports that the experiment does not yet inject its latency
toxic.

Run the focused experiment with:

```console
./lab08/experiment.sh
```

If the stack is stopped, run `./scripts/start-lab`.
The only student-owned file is `lab08/experiment.sh`.
