# Senshac Web Audit Constitution

**Status:** Proposed for human ratification (not yet authoritative).

**Date:** 2026-10-09

This document records the standards referenced by the Senshac Web audit
mandate. Until a human ratifies this proposal, audits should treat its articles
as guidance, not as an authoritative basis for findings.

## Article I — Scope and truthful descriptions

Review the change against its stated intent and acceptance criteria. Report
material differences between a change's description and its actual diff. Keep
unrelated observations separate from findings about the reviewed change.

## Article III — Release observability

Published releases contain at least one consumer-observable change. Group
internal-only maintenance with the next release that has an observable
change; describe its internal scope plainly.

## Article IV — Tests verify behavior

Tests should assert behavior, contracts, and meaningful boundary cases.
Coverage totals are signals; they do not replace assertions that prove the
intended behavior.

## Article V — Comments explain intent

Use comments to record non-obvious constraints, trade-offs, and reasons that
the code cannot express directly. Do not use comments to narrate operations
that are already clear from the code.

## Article VIII — Evidence supports findings

An audit finding cites the relevant commit or pull request, file and line, and
the evidence supporting its conclusion. Label unverified observations as such;
do not report them as established facts.

## Article IX — Auditors propose; humans decide

Auditors may report findings and propose amendments. They do not apply their
own findings, amend this constitution, or change their own mandate or trigger
configuration. A human reviews and merges changes to this constitution,
auditor instructions, and audit triggers.
