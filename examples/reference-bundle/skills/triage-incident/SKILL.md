---
name: triage-incident
description: Triage infrastructure incidents using workspace playbook and retained preferences.
version: 1.0.0
---

# Triage Incident

Load this skill when the user reports production incidents, OOM kills, or requests incident root-cause analysis.

## Steps

1. Recall workspace playbook from `knowledge/concepts/incident-triage.md`
2. Check retained preferences in memory graph
3. Gather pod events and memory metrics from sandbox tools
4. Document findings in workspace context
5. Propose remediation with provenance-linked sources

## References

See `references/standard_operating_procedure.md` for escalation paths.
