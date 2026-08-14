# Bounded Dependency Failures with Toxiproxy

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

The starter is intentionally incomplete. The initial check reports that the
checkout request is not bounded and that the experiment does not inject its
latency toxic.

After changing `src/app.js`, rebuild and restart checkout so it loads the new
code:

```console
./scripts/restart-app
```

Run the focused experiment with:

```console
./lab08/experiment.sh
```

If the stack is stopped, run `./scripts/start-lab`. The only student-owned
deliverables are `src/app.js` and `lab08/experiment.sh`.
