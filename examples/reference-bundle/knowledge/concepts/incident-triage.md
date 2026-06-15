---
type: Playbook
title: "Infrastructure Incident Root Cause Analysis"
description: "Generalized methodology for tracing container memory leaks."
prov_entity_id: "urn:psoul:entity:3607810065c1af98"
prov_entity_type: abstract_concept
prov_content_hash: "sha256:9e92c864f7160ce2fe39d8ff10dff48ff09ee64bfc42d8dc15de1db9f50c062e"
prov_generated_at: "2026-04-02T11:14:00Z"
prov_generated_by_activity: "urn:psoul:activity:knowledge.generalize"
prov_generated_by_agent: "urn:psoul:agent:core-principal-09e"
prov_derived_from:
  - "urn:psoul:workspace:incident-response"
prov_in_context: "urn:psoul:workspace:incident-response"
---
# Memory Leak Triage

When addressing container OOM (Out of Memory) kills:

1. Check `kubectl describe pod` for OOMKilled exit code 137
2. Review memory limits vs working set growth
3. Inspect heap dumps if JVM; check for connection pool leaks
4. Correlate with deployment timeline and traffic spikes
5. Document root cause in workspace playbook
