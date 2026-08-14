FROM ghcr.io/shopify/toxiproxy:2.12.0@sha256:9378ed52a28bc50edc1350f936f518f31fa95f0d15917d6eb40b8e376d1a214e AS toxiproxy

FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm@sha256:0d29e5fdc64f8397cd502223e0c4679f1e60877ca0fd2db4f2e2e0028e4271af

COPY --from=toxiproxy /toxiproxy-cli /usr/local/bin/toxiproxy-cli

RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl jq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
