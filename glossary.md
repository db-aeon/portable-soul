# Glossary

Terms used normatively in Portable Soul. Where a term maps to W3C PROV, the PROV definition takes precedence for provenance records.

## Agent

A software or human actor identified by a stable URI (`urn:psoul:agent:…`). In composition manifests, `agent_id` identifies the root cognitive system. In provenance records, agents appear in `generated_by.agent` and `on_behalf_of`.

## Assertion

A contestable claim **about** an Entity, made by an Agent at a time. Assertions MUST NOT be treated as authoritative ground truth by conformant systems. Conflicting assertions on the same Entity are preserved side by side.

## Cognitive bundle

A portable export of provenanced knowledge, skills, and memory packaged as a `.soul` directory or archive. Distinguished from a **persona document** (see below).

## Composition manifest

The root declaration file `agent.yaml` describing every component in the data path: orchestration, models, memory, tools, connectors, and interfaces.

## Connector

An integration that ingests or egresses external data (mail, calendar, CRM, etc.). Connectors MUST appear in `agent.yaml` when they feed memorization or retrieval.

## Entity

A unit of knowledge: a fact, preference, skill artifact, memory node, or other typed object. Every memorized Entity carries a provenance record.

## Harness

The runtime that executes the agent reasoning loop (tool calls, instruction routing, session management). One orchestration **role** in `agent.yaml`; not synonymous with the full deployed system.

## Importer

A conformant component that reads a `.soul` bundle and integrates artifacts while preserving lineage and accumulating assertions.

## Memory system

Infrastructure that retains, indexes, and retrieves state beyond the immediate context window. May include graph stores, vector indexes, or file indexes.

## Orchestrator

Logic that routes work across harnesses, models, and tools. May be embedded in the primary harness or implemented as a separate gateway.

## Persona document

A markdown or YAML file describing agent personality, tone, or identity (e.g. common `SOUL.md` convention in agent frameworks). **Out of scope** for Portable Soul export profiles unless explicitly tagged as an Entity with provenance. Not the same as a **cognitive bundle**.

## Portable Soul URI (`urn:psoul:`)

The reserved URN namespace for Portable Soul identifiers. See [uri-schemes.md](uri-schemes.md).

## Provenance

Factual lineage metadata: who generated an Entity, from what sources, when, and in what context. Modeled with W3C PROV vocabulary.

## Skill

An executable workflow packaged in the open Agent Skills format (`SKILL.md` in a directory). Exported skills include a sidecar `provenance.json`.

## Soul bundle (`.soul`)

Synonym for **cognitive bundle**. A directory or archive containing `manifest.json`, knowledge (OKF), skills, memory graph, and optional assertions.

## Subject

The person or organization described by provenance metadata — the entity whose thinking patterns, preferences, and workflows may be profiled. Subjects have inspectability and export rights per [privacy-and-erasure.md](privacy-and-erasure.md).

## Tombstone

A redacted Entity whose content has been erased but whose lineage record is preserved for audit and non-repudiation of the erasure event.

## Tool

A callable capability (function, MCP server, API) that can read or write data in the memorization path. Tools MUST be declared in `agent.yaml`.

## Workspace

A bounded context for memorization (project, team, incident response queue, etc.), referenced in `prov.in_context`.
