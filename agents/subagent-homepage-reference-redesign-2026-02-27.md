# Homepage Reference-First Redesign Report (2026-02-27)

## Scope
- File: `prototypes/skillsindex_framework/skillsindex_framework.pen`
- Pages:
  - `j0pbU` (dark homepage)
  - `EbJ9a` (light homepage)
- Strategy: keep existing page topology, prioritize style/text hierarchy rearrangement.

## Key Changes

### 1) Search-first information architecture
- Moved search containers to top priority position (right below top bar):
  - Dark: `HSLpj` moved to child index `1` of `j0pbU`
  - Light: `Z8xkk` moved to child index `1` of `EbJ9a`
- Expanded search interaction area for stronger first action affordance:
  - Query input width: `640`
  - Semantic input width: `470`
  - Search button width: `210`

### 2) Skills cards as absolute main body
- Converted results cards into dense 2-column grid rows (3 rows x 2 cards):
  - Dark rows: `UEbCS`, `oY0AB`, `nltfd`
  - Light rows: `FVd4P`, `JBxZD`, `sDpXg`
- Upgraded results panel width and reduced side panel dominance:
  - Results panel width: `1126`
  - Side filter panel width: `220`
- Updated toolbar text to reinforce card browsing mode:
  - `Grid view | 24/page | Relevance`

### 3) Visual simplification and restraint
- Reduced hero visual dominance (height reduced to `170`, toned background, smaller title typography).
- Search and chip blocks are flatter and cleaner, with reduced decorative contrast.
- Blue accent retained as brand action color; multi-color noise reduced.

### 4) Selection and boundary clarity
- Chip selected state is explicit via solid blue fill:
  - Dark selected chip: `NxQfB` fill `#1D4ED8`
  - Light selected chip: `SnDhs` fill `#2563EB`
- Unselected chips maintain clear boundaries through neutral contrast fills:
  - Dark unselected: `#172033`
  - Light unselected: `#F8FAFC`
- Card selected emphasis:
  - Dark selected card: `d3B1H` fill `#1E3A8A`
  - Light selected card: `vggQH` fill `#EFF6FF`
- Unselected cards keep explicit separations by neutral blocks and grid spacing.

## Reference Trait Alignment
Aligned to shared traits from LobeHub Skills / skillsmp / skills.homes:
- Search-first landing interaction
- Compact chip filters under search
- High-density card browsing area with clear scan lines
- Restrained, modern, low-decoration visual language
- Controlled blue-centric brand accenting
- Clear selected vs unselected readability

## Topology Safety
- No page deletion.
- No destructive removal of root sections.
- Existing top-level homepage structure preserved, with in-place reordering and style/content updates.

## Verification Snapshot Note
- Screenshots validated after changes:
  - Dark page: `j0pbU`
  - Light page: `EbJ9a`
- Visual checks confirm:
  - search-first hierarchy
  - dense card grid
  - reduced decoration
  - blue-accent restraint
