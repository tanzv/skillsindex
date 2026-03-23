# Agent Rules Design Standard

Version: 1.0
Last Updated: 2026-03-20
Owner: Repository Architecture

## Objective

Define how repository agent rules must be designed, organized, and evolved so they stay readable, composable, and enforceable.

## Scope

This standard applies to:

1. the root `AGENTS.md`
2. index files under `agents/**`
3. policy and standard documents under `agents/policies/**` and `agents/standards/**`
4. framework chapters, checklists, and future rule extensions under `agents/**`

## Rule System Design Goals

1. Keep the rule system explicit enough that an agent can determine what to read first.
2. Separate stable governance from implementation detail.
3. Make ownership visible from file paths alone.
4. Minimize contradictions, duplicated truth, and hidden overrides.
5. Prefer incremental extension over large rewrites of the entire rule tree.

## Document Taxonomy

Use the following document types consistently:

1. **Entry Point**
   - top-level read order
   - mandatory operating rules
   - pointers to deeper context
2. **Architecture Profile**
   - current project shape
   - route and module families
   - source-of-truth architecture references
3. **Policy**
   - stable governance
   - scope and ownership
   - hard constraints
4. **Standard**
   - implementation rules
   - layering, naming, design, and structure guidance
5. **Framework Chapter**
   - stack-specific interpretation of repository-wide rules
6. **Checklist**
   - operational acceptance criteria
   - review or intake gates
7. **Record**
   - historical evidence only
   - never the active source of truth

## Placement Rules

1. Put top-level navigation and read order in `AGENTS.md`.
2. Put shared architecture and project context references in root-level `agents/*.md` files.
3. Put folder-map and maintenance protocol documents in `agents/AGENTS.md`.
4. Put durable governance in `agents/policies/**`.
5. Put implementation guidance in `agents/standards/**`.
6. Put stack-specific refinements in `agents/standards/frameworks/**`.
7. Put execution and review lists in `agents/standards/checklists/**`.
8. Put historical audits and execution evidence in `agents/records/**`.

## Read Order Rules

1. Read order must move from global to specific.
2. Process and governance documents must appear before domain-specific implementation chapters.
3. Repository-wide backend or frontend rules must appear before framework-specific chapters.
4. Meta-rules for the agent rule system should appear before domain rules that depend on that structure.
5. If a new rule is mandatory for routine work, add it to the root read order in the same change set.
6. The root entrypoint should prefer task-based routing to deeper documents instead of embedding long architecture narratives.

## Writing Rules

1. Each rule document must have a clear title, version, last-updated date, and owner.
2. Start with objective and scope before detailed rules.
3. Use short sections with explicit headings.
4. Prefer declarative rules over narrative prose.
5. Write constraints as testable statements whenever practical.
6. Keep examples minimal and only when they remove ambiguity.
7. Avoid product history, status commentary, or temporary negotiation text in standards.
8. Keep entrypoint files short enough to scan quickly during task startup.

## Boundary Rules

1. A policy must not contain stack-specific implementation detail unless absolutely required to define scope.
2. A standard must not silently redefine the scope of a policy; it should refine, not replace.
3. A framework chapter must not bypass repository-wide policy or standards.
4. A checklist must not become the only place where a critical rule exists.
5. A record must never be referenced as the authoritative rule source.
6. An entrypoint must not absorb large architecture descriptions that belong in a dedicated architecture profile.

## Conflict Management Rules

1. If two rule files overlap, the more global file defines scope and the more specific file refines behavior.
2. If a new rule changes behavior, update every impacted higher-level index or dependent rule in the same change set.
3. If a contradiction cannot be resolved locally, fix the more authoritative document instead of adding another exception layer.
4. Avoid duplicate rule text across files unless the duplication is intentionally brief and pointer-based.

## Change Management Rules

1. Rule changes must be small, reviewable, and linked to a concrete problem or architecture need.
2. When adding a new rule file, update the relevant folder map and read order entrypoint immediately.
3. When replacing an old rule, remove or redirect the obsolete reference in the same change set.
4. When a rule is temporary, mark its removal condition explicitly.
5. Do not add a new rule document if an existing document can be extended cleanly without losing cohesion.
6. When project context grows, move descriptive material into a dedicated architecture profile instead of expanding the root entrypoint.

## Refactor Triggers

Refactor the rule system when any of the following become true:

1. the same requirement is duplicated across multiple active files
2. read order no longer explains which document governs a task
3. one document mixes policy, implementation, and historical evidence
4. framework-specific rules begin to override repository-wide rules by accident
5. agents cannot determine the authoritative source without reading unrelated files
