#!/usr/bin/env python3
"""Semantic validator for PageSpec instances: everything JSON Schema cannot express.

Usage:  python3 schema/semantic_validate.py page.json [more.json ...]
Exit 0 when no error-severity findings. Warnings never fail the run.

Layers, in order:
  1. Draft-07 schema (schema/pagespec.schema.json), including the required closed `mode` enum
  2. Template cross-reference: the declared template's real node list (required / repeatable /
     maxCount / order) against nodes[], plus route membership (fixed list, pattern or catch-all)
  3. Graph rules from compatibility/graph.json (each rule id implemented below)
  4. Per-instance maxWords budgets, taken from the section contracts
  5. assetRole usage against assets/asset-roles.json (usedBy)
  6. retrieval eligibility of a node against its section contract (UTILITY_NOT_RETRIEVABLE)
  7. MODE: `reference` pages may use only the reference roles of each field; `generated` pages (a new page for ANY OTHER
     brand) may use only generation-safe roles and may not contain the source brand, verbatim source copy, real people or
     companies of the source, source or other real hosts, or references to source asset files (assets/source-protected.json,
     assets/protected-assets.json, assets/asset-roles.json). See check_mode().

check_contracts(repo) validates the SECTION CONTRACTS themselves (provenance `source` vs taxonomy
`semantic`, pinned retrieval eligibility, role availability wiring). It is independent of the registry/allowlist: the pinned
utility set below is hard-coded on purpose, so flipping a contract cannot also move the pin.
"""
import glob
import json
import os
import re
import sys

import jsonschema

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load(rel):
    with open(os.path.join(DR, rel), encoding="utf-8") as f:
        return json.load(f)


def load_repo():
    sections = {}
    for f in sorted(glob.glob(os.path.join(DR, "sections", "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        sections[d["typeId"]] = d
    assets = _load("assets/asset-roles.json")
    return {
        "schema": _load("schema/pagespec.schema.json"),
        "templates": _load("templates/templates.json")["templates"],
        "graph": _load("compatibility/graph.json"),
        "assets": assets["roles"],
        "assetsDoc": assets,
        "sections": sections,
        "contractSchema": _load("schema/section-contract.schema.json"),
        "protected": _load("assets/source-protected.json"),
        "protectedAssets": _load("assets/protected-assets.json"),
    }


# Rule ids implemented below. verify_all.py asserts this set equals the ids declared in
# compatibility/graph.json, so prose and code cannot diverge.
IMPLEMENTED_RULES = {
    "NAV_FIRST", "FOOTER_LAST", "OVERLAY_LAST", "ONE_PER_PAGE", "HERO_AFTER_NAV",
    "NOT_FOUND_NO_HERO", "VIDEO_REFS_RESOLVE", "INITIAL_TAB_IN_TABS", "ROUTE_INITIAL_TAB",
    "NAV_ACTIVE_LINK", "TABS_KIND_CONTENT", "MOTION_BUDGET", "MAX_TABS_UNIQUE_IDS",
    "UTILITY_NOT_RETRIEVABLE",
    "CTA_BEFORE_FOOTER", "ROUTE_LEGAL_STYLE", "ROUTE_STORE_CATEGORY", "PAGINATION_BOUNDS",
    "PLAN_RULES", "REPEATABLE_MAX_COUNT",
    "REFERENCE_MODE_ROLE", "GENERATED_MODE_REFERENCE_ASSET", "GENERATED_MODE_ROLE", "GENERATED_MODE_ASSET_REF",
    "GENERATED_MODE_SOURCE_BRAND", "GENERATED_MODE_SOURCE_COPY", "GENERATED_MODE_SOURCE_ENTITY",
    "GENERATED_MODE_SOURCE_URL", "GENERATED_MODE_EXTERNAL_URL", "GENERATED_MODE_SOURCE_ASSET", "GENERATED_MODE_PROTECTED_VALUE",
}

# Utility / overlay sections: never retrieval chunks, never counted as page content, always trailing the page.
# Pinned here, independent of sections/*.json, so a contract edit alone cannot make an overlay eligible.
UTILITY_SECTIONS = {"shell.youtube-overlay", "shell.app-dialog", "shell.image-lightbox"}
# Any section that looks like a cookie/consent/dialog-type utility must also be ineligible.
UTILITY_KEYWORDS = re.compile(r"overlay|cookie|consent|dialog|modal|popup|lightbox", re.I)
CONVERSION_SECTIONS = {"cta.download-icon", "cta.download-compact"}  # closing conversion blocks that precede the footer
HERO_PREFIX = "hero."
ASSET_ROLE_PINNED_AVAILABILITY_KEYS = ("reference-only", "generation-safe", "blocked-for-generation")


def words(s):
    return len(re.findall(r"\S+", s))


def walk_maxwords(schema, inst, path, out):
    """Compare every string that has maxWords in its contract schema fragment."""
    if not isinstance(schema, dict):
        return
    if "oneOf" in schema and isinstance(inst, dict):
        # pick the branch whose const `kind` matches, else try all and keep the first without type errors
        for br in schema["oneOf"]:
            k = br.get("properties", {}).get("kind", {}).get("const")
            if k is None or k == inst.get("kind"):
                walk_maxwords(br, inst, path, out)
                return
        return
    if isinstance(inst, str) and "maxWords" in schema:
        n = words(inst)
        if n > schema["maxWords"]:
            out.append(("error", "MAX_WORDS", f"{path}: {n} words exceeds maxWords {schema['maxWords']}"))
    elif isinstance(inst, dict) and "properties" in schema:
        for k, v in inst.items():
            if k in schema["properties"]:
                walk_maxwords(schema["properties"][k], v, f"{path}.{k}", out)
    elif isinstance(inst, list) and "items" in schema:
        for i, v in enumerate(inst):
            walk_maxwords(schema["items"], v, f"{path}[{i}]", out)


def route_matches(tpl, route):
    kind = tpl["routeKind"]
    if kind == "catch-all":
        return route == "/*"
    if kind == "pattern":
        for pat in tpl["routes"]:
            rx = "^" + re.sub(r":[A-Za-z_]+", "[^/]+", re.escape(pat).replace(r"\:", ":")) + "$"
            if re.match(rx, route or ""):
                return True
        return False
    return route in tpl["routes"]


def check_template(doc, repo, out):
    tpl = repo["templates"].get(doc.get("template"))
    if tpl is None:
        out.append(("error", "TEMPLATE", f"unknown template {doc.get('template')!r}"))
        return None
    route = doc.get("route")
    if not route_matches(tpl, route):
        if tpl["routeKind"] == "catch-all":
            out.append(("error", "ROUTE", f"template {tpl['id']} is the catch-all; route must be '/*', got {route!r}"))
        else:
            out.append(("error", "ROUTE", f"route {route!r} is not served by {tpl['id']} (routes: {tpl['routes']})"))
    spec_nodes = [n.get("type") for n in doc.get("nodes", [])]
    tnodes = tpl["nodes"]
    allowed = {n["section"]: n for n in tnodes}
    for t in spec_nodes:
        if t not in allowed:
            out.append(("error", "TEMPLATE_NODES", f"{t} is not in {tpl['id']}'s node list"))
    for n in tnodes:
        c = spec_nodes.count(n["section"])
        if n["required"] and c == 0:
            out.append(("error", "TEMPLATE_NODES", f"required section {n['section']} missing for {tpl['id']}"))
        if not n["repeatable"] and c > 1:
            out.append(("error", "TEMPLATE_NODES", f"{n['section']} appears {c} times but is not repeatable in {tpl['id']}"))
        if n["repeatable"] and "maxCount" in n and c > n["maxCount"]:
            out.append(("error", "REPEATABLE_MAX_COUNT", f"{n['section']} appears {c} times; the template allows at most {n['maxCount']}"))
    # order: collapse repeats, then compare with the template order
    expected = [n["section"] for n in tnodes if n["section"] in spec_nodes]
    present = []
    for t in spec_nodes:
        if t in allowed and (not present or present[-1] != t):
            present.append(t)
    if present != expected:
        out.append(("error", "TEMPLATE_ORDER", f"node order {present} differs from template order {expected}"))
    # a repeated section must be contiguous
    for s in {t for t in spec_nodes if spec_nodes.count(t) > 1}:
        idx = [i for i, t in enumerate(spec_nodes) if t == s]
        if idx[-1] - idx[0] + 1 != len(idx):
            out.append(("error", "TEMPLATE_ORDER", f"repeated section {s} must be contiguous"))
    return tpl


def check_graph_rules(doc, repo, tpl, out):
    nodes = doc.get("nodes", [])
    types = [n.get("type") for n in nodes]
    by = {}
    for n in nodes:
        by.setdefault(n.get("type"), []).append(n)
    sev = {r["id"]: r["severity"] for r in repo["graph"]["rules"]}
    repeatable = {n["section"] for n in (tpl or {}).get("nodes", []) if n.get("repeatable")}

    def add(rule, msg):
        out.append((sev.get(rule, "error"), rule, msg))

    # UTILITY_NOT_RETRIEVABLE (enforced in check_retrieval; reported under this rule id)
    check_retrieval(doc, repo, out)

    # NAV_FIRST
    if not types or types[0] != "shell.navbar" or types.count("shell.navbar") != 1:
        add("NAV_FIRST", "shell.navbar must be the first node and appear once")
    # ONE_PER_PAGE (a section that its template declares repeatable may repeat)
    for t in set(types):
        if types.count(t) > 1 and t not in repeatable:
            add("ONE_PER_PAGE", f"{t} appears {types.count(t)} times")
    # OVERLAY_LAST / FOOTER_LAST: utility sections trail the page
    first_util = next((i for i, t in enumerate(types) if t in UTILITY_SECTIONS), None)
    if first_util is not None and any(t not in UTILITY_SECTIONS for t in types[first_util:]):
        add("OVERLAY_LAST", "utility sections (overlays, dialogs, lightbox) must be the final nodes")
    core = [t for t in types if t not in UTILITY_SECTIONS]
    if "shell.footer" in types and (not core or core[-1] != "shell.footer"):
        add("FOOTER_LAST", "shell.footer must be last (utility overlays may follow it)")
    # HERO_AFTER_NAV: any hero.* section directly follows the navbar
    for i, t in enumerate(types):
        if t.startswith(HERO_PREFIX) and i != 1:
            add("HERO_AFTER_NAV", f"{t} must directly follow shell.navbar")
    # NOT_FOUND_NO_HERO
    if doc.get("template") == "template.not-found":
        for t in types:
            if t.split(".")[0] in ("hero", "showcase", "features", "support", "cta", "commerce", "store"):
                add("NOT_FOUND_NO_HERO", f"{t} is not allowed on template.not-found")
    cons = (tpl or {}).get("constraints", {})
    route = doc.get("route")
    # NAV_ACTIVE_LINK
    for n in by.get("shell.navbar", []):
        want = cons.get("navActiveLinkHref")
        got = n.get("content", {}).get("activeLinkHref")
        if "navActiveLinkHref" in cons and got != want:
            add("NAV_ACTIVE_LINK", f"activeLinkHref is {got!r}; template requires {want!r}")
    # CTA_BEFORE_FOOTER: a conversion block directly precedes the footer
    if "shell.footer" in types:
        for i, t in enumerate(core):
            if t in CONVERSION_SECTIONS and (i + 1 >= len(core) or core[i + 1] != "shell.footer"):
                add("CTA_BEFORE_FOOTER", f"{t} must directly precede shell.footer")
    # video refs
    overlay = by.get("shell.youtube-overlay", [])
    ids = {v.get("id") for n in overlay for v in n.get("content", {}).get("videos", [])}
    refs = []
    for n in by.get("hero.landing-hero", []):
        c = n.get("content", {})
        refs += [c.get("introVideoId"), c.get("secondaryCta", {}).get("videoId")]
    for n in by.get("features.feature-grid", []):
        for r in n.get("content", {}).get("rows", []):
            refs += [c.get("demoVideoId") for c in r.get("cards", []) if c.get("demoVideoId")]
    refs = [r for r in refs if r]
    if refs and not overlay:
        add("VIDEO_REFS_RESOLVE", "page references videos but has no shell.youtube-overlay")
    for r in refs:
        if overlay and r not in ids:
            add("VIDEO_REFS_RESOLVE", f"videoId {r!r} has no matching videos[].id in the overlay")
    # persona tabs
    for n in by.get("showcase.persona-tabs", []):
        c = n.get("content", {})
        tabs = c.get("tabs", [])
        tids = [t.get("id") for t in tabs]
        if c.get("initialTab") not in tids:
            add("INITIAL_TAB_IN_TABS", f"initialTab {c.get('initialTab')!r} not in tab ids {tids}")
        if len(set(tids)) != len(tids):
            add("MAX_TABS_UNIQUE_IDS", f"duplicate tab ids {tids}")
        want = None
        if "routeInitialTab" in cons:
            want = cons["routeInitialTab"].get(route)
        elif "requiredInitialTab" in cons:
            want = cons["requiredInitialTab"]
        if want is not None and c.get("initialTab") != want:
            add("ROUTE_INITIAL_TAB", f"route {route} requires initialTab {want!r}, got {c.get('initialTab')!r}")
        for t in tabs:
            if t.get("kind") == "apps" and ("logos" in t or "apps" not in t):
                add("TABS_KIND_CONTENT", f"tab {t.get('id')}: kind apps needs apps[] and no logos[]")
            if t.get("kind") == "logos" and ("apps" in t or "logos" not in t):
                add("TABS_KIND_CONTENT", f"tab {t.get('id')}: kind logos needs logos[] and no apps[]")
    for n in by.get("support.faq", []):
        qs = [i.get("question") for i in n.get("content", {}).get("items", [])]
        if len(set(qs)) != len(qs):
            add("MAX_TABS_UNIQUE_IDS", "duplicate FAQ questions")
    # pricing plans: unique ids, at most one highlighted plan
    for n in by.get("commerce.pricing-plans", []):
        plans = n.get("content", {}).get("plans", [])
        pids = [p.get("id") for p in plans]
        if len(set(pids)) != len(pids):
            add("MAX_TABS_UNIQUE_IDS", f"duplicate plan ids {pids}")
        hl = [p.get("id") for p in plans if p.get("highlighted")]
        if len(hl) > cons.get("maxHighlightedPlans", 1):
            add("PLAN_RULES", f"{len(hl)} highlighted plans {hl}; the template allows {cons.get('maxHighlightedPlans', 1)}")
    # store shelves: unique titles
    for n in by.get("store.app-shelves", []):
        titles = [s.get("title") for s in n.get("content", {}).get("shelves", [])]
        if len(set(titles)) != len(titles):
            add("MAX_TABS_UNIQUE_IDS", f"duplicate shelf titles {titles}")
    # legal pages: body typography and title lines follow the route
    for n in by.get("content.legal-body", []):
        want = cons.get("routeTypography", {}).get(route)
        got = n.get("content", {}).get("typography")
        if want is not None and got != want:
            add("ROUTE_LEGAL_STYLE", f"route {route} requires legal-body typography {want!r}, got {got!r}")
    for n in by.get("content.legal-header", []):
        want = cons.get("routeTitleLines", {}).get(route)
        got = len(n.get("content", {}).get("titleLines", []))
        if want is not None and got != want:
            add("ROUTE_LEGAL_STYLE", f"route {route} requires {want} title line(s), got {got}")
    # store: the active chip is the route's category
    for n in by.get("store.category-nav", []):
        c = n.get("content", {})
        want = cons.get("routeCategory", {}).get(route)
        if want is not None and c.get("activeCategory") != want:
            add("ROUTE_STORE_CATEGORY", f"route {route} requires activeCategory {want!r}, got {c.get('activeCategory')!r}")
        if c.get("activeCategory") not in [x.get("value") for x in c.get("categories", [])]:
            add("ROUTE_STORE_CATEGORY", f"activeCategory {c.get('activeCategory')!r} is not among the chips")
    # pagination: page <= pageCount (store grid, awards entries)
    for typ in ("store.app-grid", "showcase.award-entries"):
        for n in by.get(typ, []):
            c = n.get("content", {})
            if c.get("page", 1) > c.get("pageCount", 1):
                add("PAGINATION_BOUNDS", f"{typ}: page {c.get('page')} exceeds pageCount {c.get('pageCount')}")
    node_ids = [n.get("id") for n in nodes]
    if len(set(node_ids)) != len(node_ids):
        add("MAX_TABS_UNIQUE_IDS", f"duplicate node ids {node_ids}")
    # MOTION_BUDGET
    bursts = [n for n in nodes if n.get("motion", {}).get("pattern") == "icon-press-and-burst"]
    if len(bursts) > 1:
        add("MOTION_BUDGET", f"{len(bursts)} icon-press-and-burst sections on one page")


def check_retrieval(doc, repo, out):
    for n in doc.get("nodes", []):
        if "retrievalEligible" not in n:
            continue
        sec = repo["sections"].get(n.get("type"), {})
        if n["retrievalEligible"] and (n.get("type") in UTILITY_SECTIONS or sec.get("retrievalEligible") is False):
            out.append(("error", "UTILITY_NOT_RETRIEVABLE", f"nodes[{n.get('id')}]: {n.get('type')} is a utility overlay and must not be retrievalEligible:true"))
        elif n["retrievalEligible"] != sec.get("retrievalEligible"):
            out.append(("error", "UTILITY_NOT_RETRIEVABLE", f"nodes[{n.get('id')}]: retrievalEligible {n['retrievalEligible']} differs from the section contract ({sec.get('retrievalEligible')})"))


SOURCE_ID_RX = re.compile(r"^src\.([A-Za-z0-9]+)\.([a-z][a-z0-9]*)(?:\.([0-9]+))?$")


def check_contracts(repo):
    """Findings for the section contracts: provenance vs taxonomy separation, retrieval pins, role availability wiring."""
    out = []
    v = jsonschema.Draft7Validator(repo["contractSchema"])
    seen = {}
    roles = repo["assets"]
    for tid, c in sorted(repo["sections"].items()):
        for e in sorted(v.iter_errors(c), key=lambda e: list(e.path)):
            out.append(("error", "CONTRACT_SCHEMA", f"{tid}: {'/'.join(str(p) for p in e.path) or '<root>'}: {e.message[:160]}"))
        # retrieval pin first and unconditionally: it must fire even when the contract is also schema-invalid
        pinned = tid in UTILITY_SECTIONS or bool(UTILITY_KEYWORDS.search(tid + " " + c.get("purpose", "")))
        if pinned and c.get("retrievalEligible") is not False:
            out.append(("error", "RETRIEVAL_PIN", f"{tid}: utility/overlay/dialog section must be retrievalEligible:false"))
        if not pinned and c.get("retrievalEligible") is False:
            out.append(("error", "RETRIEVAL_PIN", f"{tid}: retrievalEligible:false is reserved for utility overlays; this section is content"))
        if any(o[1] == "CONTRACT_SCHEMA" and o[2].startswith(tid + ":") for o in out):
            continue
        sem, src = c["semantic"], c["source"]
        if c["registryId"] != "section." + tid or c["id"] != c["registryId"]:
            out.append(("error", "SEMANTIC_MISMATCH", f"{tid}: id/registryId must both be section.{tid}"))
        if sem["id"] != c["registryId"] or sem["category"] != c["category"] or c["category"] != tid.split(".")[0]:
            out.append(("error", "SEMANTIC_MISMATCH", f"{tid}: semantic {sem} must equal registryId/category and the typeId prefix"))
        base = os.path.basename(src["file"]).rsplit(".", 1)[0]
        m = SOURCE_ID_RX.match(src["id"])
        if not m or m.group(1) != base or m.group(2) != src["tag"]:
            out.append(("error", "SOURCE_ID", f"{tid}: source.id {src['id']!r} must be src.<component file>.<dom tag>[.<ordinal>] = src.{base}.{src['tag']}"))
        if src["id"] in seen:
            out.append(("error", "SOURCE_ID", f"{tid}: source.id {src['id']!r} already used by {seen[src['id']]}"))
        seen[src["id"]] = tid
        # role wiring: every role a field offers exists, reference roles come first, generated roles are generation-safe
        for path, frag in _role_fields(c["contentModel"], ""):
            ref, gen = frag.get("referenceRoles", []), frag.get("generatedRoles", [])
            if sorted(frag["enum"]) != sorted(ref + gen):
                out.append(("error", "ROLE_WIRING", f"{tid}{path}: enum {frag['enum']} != referenceRoles + generatedRoles"))
            for r in ref + gen:
                if r not in roles:
                    out.append(("error", "ROLE_WIRING", f"{tid}{path}: unknown role {r}"))
            for r in gen:
                if r in roles and roles[r].get("availability") != "generation-safe":
                    out.append(("error", "ROLE_WIRING", f"{tid}{path}: generatedRoles lists {r}, which is {roles[r].get('availability')}"))
            for r in ref:
                if r in roles and roles[r].get("availability") == "generation-safe":
                    out.append(("error", "ROLE_WIRING", f"{tid}{path}: referenceRoles lists generation-safe role {r}"))
            if not gen:
                out.append(("error", "ROLE_WIRING", f"{tid}{path}: no generation-safe substitute role"))
    for t in sorted(UTILITY_SECTIONS - set(repo["sections"])):
        out.append(("error", "RETRIEVAL_PIN", f"pinned utility section {t} has no contract"))
    return out


def _role_fields(schema, path):
    """(path, fragment) for every assetRole / *AssetRole field of a contentModel fragment."""
    if isinstance(schema, dict):
        for k, v in schema.items():
            if (k == "assetRole" or k.endswith("AssetRole")) and isinstance(v, dict) and "enum" in v:
                yield f"{path}.{k}", v
            else:
                yield from _role_fields(v, f"{path}.{k}")
    elif isinstance(schema, list):
        for i, v in enumerate(schema):
            yield from _role_fields(v, f"{path}[{i}]")


def check_assets(doc, repo, out):
    def visit(node_type, x, path):
        if isinstance(x, dict):
            for k, r in x.items():
                if (k == "assetRole" or k.endswith("AssetRole")) and isinstance(r, str):
                    role = repo["assets"].get(r)
                    if role is None:
                        out.append(("error", "ASSET_ROLE", f"{path}.{k}: unknown assetRole {r!r}"))
                    elif node_type not in role["usedBy"]:
                        out.append(("error", "ASSET_ROLE", f"{path}.{k}: role {r!r} is not allowed in {node_type} (usedBy {role['usedBy']})"))
            for k, v in x.items():
                visit(node_type, v, f"{path}.{k}")
        elif isinstance(x, list):
            for i, v in enumerate(x):
                visit(node_type, v, f"{path}[{i}]")
    for n in doc.get("nodes", []):
        visit(n.get("type"), n.get("content", {}), f"nodes[{n.get('id')}]")


# ------------------------------------------------------------------ mode: reference | generated
_CACHE = {}


def _norm(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s).lower()).strip()


def _protected_index(repo):
    key = id(repo["protected"])
    if key not in _CACHE:
        p = repo["protected"]
        by_first = {}
        for ph in p["phrases"]:
            toks = _norm(ph).split()
            if len(toks) >= 3:
                by_first.setdefault(toks[0], []).append(toks)
        ents = {}
        for name in p["entities"]["people"] + p["entities"]["companies"]:
            toks = _norm(name).split()
            if toks:
                ents.setdefault(toks[0], []).append(toks)
        hosts = sorted({h.lower() for h in p["hosts"]}, key=len, reverse=True)
        pa = repo["protectedAssets"]
        names = set()
        for f in pa["files"]:
            base = f["path"].rsplit("/", 1)[-1].lower()
            names.add(base)
            stem = base.rsplit(".", 1)[0]
            if len(stem) >= 8:
                names.add(stem)
        brand_pats = []
        for x in repo["assetsDoc"].get("sourceBrand", {}).get("patterns", []):
            try:
                re.compile(x)
                brand_pats.append(x)
            except re.error:
                pass  # a pattern that does not compile is reported by verify_all.py check 7; the others still apply
        brand = re.compile("|".join(f"(?:{x})" for x in brand_pats), re.I) if brand_pats else None
        path_rx = [re.compile(x, re.I) for x in pa.get("pathPatterns", [])]
        _CACHE[key] = (by_first, ents, hosts, names, brand, path_rx)
    return _CACHE[key]


def _strings(x, path):
    """(path, key, string) for every string value of a JSON tree."""
    if isinstance(x, str):
        yield path, path.rsplit(".", 1)[-1].split("[")[0], x
    elif isinstance(x, dict):
        for k, v in x.items():
            yield from _strings(v, f"{path}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from _strings(v, f"{path}[{i}]")


def _find_seq(toks, seqs_by_first):
    """First token sequence (list of tokens) of seqs_by_first occurring in toks on word boundaries, else None."""
    for i, t in enumerate(toks):
        for seq in seqs_by_first.get(t, ()):
            if toks[i:i + len(seq)] == seq:
                return seq
    return None


RESERVED_HOST = re.compile(r"(^|\.)((example)\.(com|org|net)|example|invalid|test|localhost)$", re.I)
URL_KEY = re.compile(r"(^|[a-z])(href|url)$", re.I)
HOST_IN_TEXT = re.compile(r"(?:https?:)?//([A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,}|localhost)(?::\d+)?", re.I)
REF_KEY = re.compile(r"(^|[a-z])(assetRef|Ref)$")


def check_mode(doc, repo, out):
    """The reference | generated contract. `reference` pages use each field's reference roles; `generated` pages use only
    generation-safe roles and are scanned for source leakage (brand, copy, entities, hosts, asset files)."""
    mode = doc.get("mode")
    roles = repo["assets"]
    secs = repo["sections"]
    gen = mode == "generated"

    # ---- roles (both modes), with the field's own referenceRoles / generatedRoles
    def visit(schema, inst, path, node_type):
        if not isinstance(schema, dict):
            return
        if "oneOf" in schema and isinstance(inst, dict):
            for br in schema["oneOf"]:
                k = br.get("properties", {}).get("kind", {}).get("const")
                if k is None or k == inst.get("kind"):
                    visit(br, inst, path, node_type)
                    return
            return
        if isinstance(inst, dict) and "properties" in schema:
            for k, v in inst.items():
                frag = schema["properties"].get(k)
                if frag is None:
                    continue
                if (k == "assetRole" or k.endswith("AssetRole")) and isinstance(v, str) and "enum" in frag:
                    reg = roles.get(v)
                    if gen:
                        if reg and reg.get("availability") != "generation-safe":
                            subs = ", ".join(frag.get("generatedRoles", [])) or "none: omit it"
                            out.append(("error", "GENERATED_MODE_REFERENCE_ASSET", f"{path}.{k}: role '{v}' is {reg.get('availability')} and cannot appear in a generated page (use: {subs})"))
                        elif v not in frag.get("generatedRoles", []):
                            out.append(("error", "GENERATED_MODE_ROLE", f"{path}.{k}: role '{v}' is not a generated-mode role of this field (allowed: {', '.join(frag.get('generatedRoles', [])) or 'none'})"))
                    elif v not in frag.get("referenceRoles", []):
                        out.append(("error", "REFERENCE_MODE_ROLE", f"{path}.{k}: role '{v}' is not a reference role of this field (allowed: {', '.join(frag.get('referenceRoles', []))})"))
                elif gen and isinstance(v, str) and frag.get("blockedInGeneratedMode") and v in frag["blockedInGeneratedMode"]:
                    out.append(("error", "GENERATED_MODE_PROTECTED_VALUE", f"{path}.{k}: value '{v}' is protected source content and is blocked in a generated page"))
                else:
                    visit(frag, v, f"{path}.{k}", node_type)
        elif isinstance(inst, list) and "items" in schema:
            for i, v in enumerate(inst):
                visit(schema["items"], v, f"{path}[{i}]", node_type)
        elif isinstance(inst, str) and gen and schema.get("blockedInGeneratedMode") and inst in schema["blockedInGeneratedMode"]:
            out.append(("error", "GENERATED_MODE_PROTECTED_VALUE", f"{path}: value '{inst}' is protected source content and is blocked in a generated page"))

    for n in doc.get("nodes", []):
        c = secs.get(n.get("type"))
        if c and isinstance(n.get("content"), dict):
            visit(c["contentModel"], n["content"], f"nodes[{n.get('id')}]", n.get("type"))

    if not gen:
        return

    # ---- leakage scan over every string of the page: route, head and all node content
    by_first, ents, hosts, names, brand, path_rx = _protected_index(repo)
    pattern_ref = re.compile(repo["assetsDoc"].get("assetRefPolicy", {}).get("generatedModePattern", r"^(placeholder|user|generated):[a-z0-9][a-z0-9._-]*$"))
    items = [("route", "route", doc.get("route", ""))]
    items += list(_strings(doc.get("head", {}), "head"))
    for n in doc.get("nodes", []):
        items += list(_strings(n.get("content", {}), f"nodes[{n.get('id')}]"))
    for path, key, s in items:
        low = s.lower()
        m = brand.search(s) if brand else None
        if m:
            out.append(("error", "GENERATED_MODE_SOURCE_BRAND", f"{path} names the source brand ('{m.group(0)}')"))
        toks = _norm(s).split()
        hit = _find_seq(toks, by_first)
        if hit:
            out.append(("error", "GENERATED_MODE_SOURCE_COPY", f"{path} repeats verbatim source copy ('{' '.join(hit)}')"))
        e = _find_seq(toks, ents)
        if e:
            out.append(("error", "GENERATED_MODE_SOURCE_ENTITY", f"{path} names a real person or company of the source ('{' '.join(e)}')"))
        # URLs: any source host anywhere, and every href/url value must be relative or on a reserved domain
        for h in hosts:
            if re.search(r"(^|[^a-z0-9.-])" + re.escape(h) + r"($|[^a-z0-9-])", low):
                out.append(("error", "GENERATED_MODE_SOURCE_URL", f"{path} contains the source host '{h}'"))
                break
        if URL_KEY.search(key):
            v = s.strip()
            if v.startswith(("/", "#")) and not v.startswith("//"):
                pass
            elif v.startswith("mailto:"):
                if not RESERVED_HOST.search(v.split("@")[-1].split("?")[0]):
                    out.append(("error", "GENERATED_MODE_EXTERNAL_URL", f"{path}: mailto host is not a reserved domain"))
            else:
                m2 = HOST_IN_TEXT.match(v)
                if not m2 or not RESERVED_HOST.search(m2.group(1)):
                    out.append(("error", "GENERATED_MODE_EXTERNAL_URL", f"{path}: '{v[:60]}' must be a relative path, an anchor or a URL on a reserved .example/.invalid/.test/example.com domain"))
        else:
            for m3 in HOST_IN_TEXT.finditer(s):
                if not RESERVED_HOST.search(m3.group(1)):
                    out.append(("error", "GENERATED_MODE_EXTERNAL_URL", f"{path}: URL host '{m3.group(1)}' is not a reserved domain"))
        # asset files
        for nm in names:
            if nm in low:
                out.append(("error", "GENERATED_MODE_SOURCE_ASSET", f"{path} references the source asset file '{nm}'"))
                break
        else:
            for rx in path_rx:
                if rx.search(s):
                    out.append(("error", "GENERATED_MODE_SOURCE_ASSET", f"{path} points into the source asset folders ('{s[:50]}')"))
                    break
        if REF_KEY.search(key) and not pattern_ref.match(s):
            out.append(("error", "GENERATED_MODE_ASSET_REF", f"{path}: '{s[:50]}' must be a placeholder:, user: or generated: ref in a generated page"))


def check_head(doc, repo, out):
    h = doc.get("head")
    if doc.get("template") == "template.not-found" and h is not None and h.get("robots") != "noindex":
        out.append(("warn", "HEAD", "404 pages carry robots=noindex on the live site"))


def validate_pagespec(doc, repo=None):
    repo = repo or load_repo()
    out = []
    v = jsonschema.Draft7Validator(repo["schema"])
    for e in sorted(v.iter_errors(doc), key=lambda e: list(e.path)):
        out.append(("error", "SCHEMA", f"{'/'.join(str(p) for p in e.path) or '<root>'}: {e.message[:180]}"))
    if any(o[1] == "SCHEMA" for o in out):
        return out  # structure is unreliable; stop before semantic layers
    tpl = check_template(doc, repo, out)
    check_graph_rules(doc, repo, tpl, out)
    for n in doc["nodes"]:
        sec = repo["sections"][n["type"]]
        walk_maxwords(sec["contentModel"], n["content"], f"nodes[{n['id']}]", out)
    for fld in ("title", "description"):
        if fld in doc.get("head", {}):
            lim = repo["schema"]["definitions"]["head"]["properties"][fld]["maxWords"]
            if words(doc["head"][fld]) > lim:
                out.append(("error", "MAX_WORDS", f"head.{fld}: exceeds maxWords {lim}"))
    check_assets(doc, repo, out)
    check_mode(doc, repo, out)
    check_head(doc, repo, out)
    return out


def main(argv):
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 2
    repo = load_repo()
    bad = 0
    for f in files:
        res = validate_pagespec(json.load(open(f, encoding="utf-8")), repo)
        errs = [r for r in res if r[0] == "error"]
        for sev, rule, msg in res:
            print(f"  {sev.upper():5} {rule}: {msg}")
        print(f"{f}: {len(errs)} error(s), {len(res) - len(errs)} warning(s)")
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
