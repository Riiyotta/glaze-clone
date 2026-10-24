"""Whole-page-wrapper quality gate (pure function, no I/O).

A section that swallows the whole page (a HERO that wraps every other block, say) makes
retrieval chunks and section contracts meaningless. Measured heights come from
extraction/measured-values.json -> sectionHeights (recorded by measure_section_heights.mjs).

  HERO-category section, measured height > WARN_PX   -> warning
  HERO-category section, measured height > FAIL_PX   -> error, unless listed in
      sectionHeights.wrapperWhitelist with a justification and maxHeightPx >= measured
      (a whitelisted hit is still reported as a warning)
  any section holding > MAJORITY of a page's in-flow height (pages with >= MIN_SECTIONS
      in-flow sections) -> warning. A repeated node (post card, release entry) counts once per instance:
      its section height is the first instance (`heightPx`), the page total uses `totalHeightPx` (the sum of all instances)
  missing / malformed measurements, stale or unjustified whitelist entries -> error

`majorityAccepted` (optional list of {template, section, reviewedBy, justification}) marks a majority warning as reviewed: the long-form
body of a legal document or an article legitimately is most of its page (the text is one continuous column; the header, cover, footer and
CTA are separate sections). An accepted majority is still reported as a warning; an entry that names an unknown template or section, lacks
a reviewer or a justification of >= MIN_JUSTIFICATION_CHARS characters, or is for a non-content section, is an error.
"""
WARN_PX = 1800
FAIL_PX = 3000
MAJORITY = 0.5
MIN_SECTIONS = 3
MIN_JUSTIFICATION_CHARS = 30


def evaluate(heights, categories, templates):
    """heights: measured-values['sectionHeights']; categories: {typeId: category};
    templates: {templateId: {'nodes': [{'section': typeId, ...}]}}. Returns (errors, warnings)."""
    errors, warnings = [], []
    if not isinstance(heights, dict) or "pages" not in heights:
        return ["sectionHeights.pages is missing from extraction/measured-values.json"], warnings
    wl = {}
    for i, e in enumerate(heights.get("wrapperWhitelist", [])):
        s = e.get("section") if isinstance(e, dict) else None
        if s not in categories:
            errors.append(f"wrapperWhitelist[{i}] names unknown section {s!r}")
        elif categories[s] != "hero":
            errors.append(f"wrapperWhitelist[{i}] {s} is not a hero-category section (whitelist is hero-only)")
        elif not isinstance(e.get("maxHeightPx"), int) or e["maxHeightPx"] <= FAIL_PX:
            errors.append(f"wrapperWhitelist[{i}] {s}: maxHeightPx must be an integer > {FAIL_PX}")
        elif len(str(e.get("justification", "")).strip()) < MIN_JUSTIFICATION_CHARS or not e.get("reviewedBy"):
            errors.append(f"wrapperWhitelist[{i}] {s}: needs reviewedBy and a justification of >= {MIN_JUSTIFICATION_CHARS} characters")
        else:
            wl[s] = e
    accepted = {}
    for i, e in enumerate(heights.get("majorityAccepted", [])):
        ok = isinstance(e, dict) and e.get("template") in templates and e.get("section") in [n["section"] for n in templates[e["template"]]["nodes"]]
        if not ok:
            errors.append(f"majorityAccepted[{i}] names an unknown template or a section that is not in it")
        elif categories.get(e["section"]) not in ("content", "store"):
            errors.append(f"majorityAccepted[{i}] {e['section']}: only content/store sections may be accepted (a hero or shell taking the page is a defect)")
        elif len(str(e.get("justification", "")).strip()) < MIN_JUSTIFICATION_CHARS or not e.get("reviewedBy"):
            errors.append(f"majorityAccepted[{i}] {e['section']}: needs reviewedBy and a justification of >= {MIN_JUSTIFICATION_CHARS} characters")
        else:
            accepted[(e["template"], e["section"])] = e
    for tid, t in templates.items():
        rec = heights["pages"].get(tid)
        if rec is None:
            errors.append(f"{tid}: no measured section heights")
            continue
        flow, flow_total = {}, {}
        for n in t["nodes"]:
            s = n["section"]
            m = rec.get("sections", {}).get(s)
            if m is None or "inFlow" not in m or "heightPx" not in m:
                errors.append(f"{tid}/{s}: section height not recorded")
                continue
            h = m["heightPx"]
            if h is not None and (not isinstance(h, (int, float)) or h < 0):
                errors.append(f"{tid}/{s}: invalid heightPx {h!r}")
                continue
            if m["inFlow"] and h is not None:
                flow[s] = h
                flow_total[s] = m.get("totalHeightPx", h)
            if categories.get(s) == "hero" and h is not None:
                if h > FAIL_PX:
                    if s in wl and wl[s]["maxHeightPx"] >= h:
                        warnings.append(f"{tid}/{s}: hero height {h}px > {FAIL_PX}px, accepted by reviewed whitelist ({wl[s]['reviewedBy']})")
                    else:
                        errors.append(f"{tid}/{s}: hero is {h}px tall (> {FAIL_PX}px): a whole-page wrapper. Split it, or add a reviewed wrapperWhitelist entry with justification")
                elif h > WARN_PX:
                    warnings.append(f"{tid}/{s}: hero is {h}px tall (> {WARN_PX}px); check it is not wrapping other sections")
        total = sum(flow_total.values())
        if len(flow) >= MIN_SECTIONS and total > 0:
            for s, h in flow.items():
                if h / total > MAJORITY:
                    acc = accepted.get((tid, s))
                    warnings.append(f"{tid}/{s}: one section holds {h / total:.0%} of the page's in-flow height ({h}px of {total}px)" + (f"; accepted by review ({acc['reviewedBy']})" if acc else ""))
    return errors, warnings
