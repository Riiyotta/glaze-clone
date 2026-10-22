#!/usr/bin/env python3
"""Semantic validator for PageSpec instances: everything JSON Schema cannot express.

Usage:  python3 schema/semantic_validate.py page.json [more.json ...]
Exit 0 when no error-severity findings. Warnings never fail the run.

Layers, in order:
  1. Draft-07 schema (schema/pagespec.schema.json)
  2. Template cross-reference: the declared template's real node list (required /
     repeatable / order) against nodes[], plus route membership
  3. Graph rules from compatibility/graph.json (each rule id implemented below)
  4. Per-instance maxWords budgets, taken from the section contracts
  5. assetRole usage against assets/asset-roles.json
"""
import glob
import json
import os
import re
import sys

import jsonschema

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load(rel):
    with open(os.path.join(DR, rel)) as f:
        return json.load(f)


def load_repo():
    sections = {}
    for f in sorted(glob.glob(os.path.join(DR, "sections", "*.json"))):
        d = json.load(open(f))
        sections[d["typeId"]] = d
    return {
        "schema": _load("schema/pagespec.schema.json"),
        "templates": _load("templates/templates.json")["templates"],
        "graph": _load("compatibility/graph.json"),
        "assets": _load("assets/asset-roles.json")["roles"],
        "sections": sections,
    }


# Rule ids implemented in check_graph_rules. verify_all.py asserts this set equals
# the ids declared in compatibility/graph.json, so prose and code cannot diverge.
IMPLEMENTED_RULES = {
    "NAV_FIRST", "FOOTER_LAST", "OVERLAY_LAST", "ONE_PER_PAGE", "HERO_AFTER_NAV",
    "NOT_FOUND_NO_HERO", "VIDEO_REFS_RESOLVE", "INITIAL_TAB_IN_TABS", "ROUTE_INITIAL_TAB",
    "NAV_ACTIVE_LINK", "TABS_KIND_CONTENT", "MOTION_BUDGET", "MAX_TABS_UNIQUE_IDS",
}


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
    t = schema.get("type")
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


def check_template(doc, repo, out):
    tpl = repo["templates"].get(doc.get("template"))
    if tpl is None:
        out.append(("error", "TEMPLATE", f"unknown template {doc.get('template')!r}"))
        return None
    route = doc.get("route")
    if tpl["routeKind"] == "catch-all":
        if route != "/*":
            out.append(("error", "ROUTE", f"template {tpl['id']} is the catch-all; route must be '/*', got {route!r}"))
    elif route not in tpl["routes"]:
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
    expected = [n["section"] for n in tnodes if n["section"] in spec_nodes]
    present = [t for t in spec_nodes if t in allowed]
    if present != expected:
        out.append(("error", "TEMPLATE_ORDER", f"node order {present} differs from template order {expected}"))
    return tpl


def check_graph_rules(doc, repo, tpl, out):
    nodes = doc.get("nodes", [])
    types = [n.get("type") for n in nodes]
    by = {}
    for n in nodes:
        by.setdefault(n.get("type"), []).append(n)
    sev = {r["id"]: r["severity"] for r in repo["graph"]["rules"]}

    def add(rule, msg):
        out.append((sev.get(rule, "error"), rule, msg))

    # NAV_FIRST
    if not types or types[0] != "shell.navbar" or types.count("shell.navbar") != 1:
        add("NAV_FIRST", "shell.navbar must be the first node and appear once")
    # ONE_PER_PAGE
    for t in set(types):
        if types.count(t) > 1:
            add("ONE_PER_PAGE", f"{t} appears {types.count(t)} times")
    # OVERLAY_LAST / FOOTER_LAST
    if "shell.youtube-overlay" in types and types[-1] != "shell.youtube-overlay":
        add("OVERLAY_LAST", "shell.youtube-overlay must be the final node")
    core = [t for t in types if t != "shell.youtube-overlay"]
    if "shell.footer" in types and (not core or core[-1] != "shell.footer"):
        add("FOOTER_LAST", "shell.footer must be last (the overlay may follow it)")
    # HERO_AFTER_NAV
    if "hero.landing-hero" in types and types.index("hero.landing-hero") != 1:
        add("HERO_AFTER_NAV", "hero.landing-hero must directly follow shell.navbar")
    # NOT_FOUND_NO_HERO
    if doc.get("template") == "template.not-found":
        for t in types:
            if t.split(".")[0] in ("hero", "showcase", "features", "support", "cta"):
                add("NOT_FOUND_NO_HERO", f"{t} is not allowed on template.not-found")
    cons = (tpl or {}).get("constraints", {})
    # NAV_ACTIVE_LINK
    for n in by.get("shell.navbar", []):
        want = cons.get("navActiveLinkHref")
        got = n.get("content", {}).get("activeLinkHref")
        if "navActiveLinkHref" in cons and got != want:
            add("NAV_ACTIVE_LINK", f"activeLinkHref is {got!r}; template requires {want!r}")
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
            want = cons["routeInitialTab"].get(doc.get("route"))
        elif "requiredInitialTab" in cons:
            want = cons["requiredInitialTab"]
        if want is not None and c.get("initialTab") != want:
            add("ROUTE_INITIAL_TAB", f"route {doc.get('route')} requires initialTab {want!r}, got {c.get('initialTab')!r}")
        for t in tabs:
            if t.get("kind") == "apps" and ("logos" in t or "apps" not in t):
                add("TABS_KIND_CONTENT", f"tab {t.get('id')}: kind apps needs apps[] and no logos[]")
            if t.get("kind") == "logos" and ("apps" in t or "logos" not in t):
                add("TABS_KIND_CONTENT", f"tab {t.get('id')}: kind logos needs logos[] and no apps[]")
    for n in by.get("support.faq", []):
        qs = [i.get("question") for i in n.get("content", {}).get("items", [])]
        if len(set(qs)) != len(qs):
            add("MAX_TABS_UNIQUE_IDS", "duplicate FAQ questions")
    node_ids = [n.get("id") for n in nodes]
    if len(set(node_ids)) != len(node_ids):
        add("MAX_TABS_UNIQUE_IDS", f"duplicate node ids {node_ids}")
    # MOTION_BUDGET
    bursts = [n for n in nodes if n.get("motion", {}).get("pattern") == "icon-press-and-burst"]
    if len(bursts) > 1:
        add("MOTION_BUDGET", f"{len(bursts)} icon-press-and-burst sections on one page")


def check_assets(doc, repo, out):
    def visit(node_type, x, path):
        if isinstance(x, dict):
            r = x.get("assetRole")
            if isinstance(r, str):
                role = repo["assets"].get(r)
                if role is None:
                    out.append(("error", "ASSET_ROLE", f"{path}: unknown assetRole {r!r}"))
                elif node_type not in role["usedBy"]:
                    out.append(("error", "ASSET_ROLE", f"{path}: role {r!r} is not allowed in {node_type} (usedBy {role['usedBy']})"))
            for k, v in x.items():
                visit(node_type, v, f"{path}.{k}")
        elif isinstance(x, list):
            for i, v in enumerate(x):
                visit(node_type, v, f"{path}[{i}]")
    for n in doc.get("nodes", []):
        visit(n.get("type"), n.get("content", {}), f"nodes[{n.get('id')}]")


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
        res = validate_pagespec(json.load(open(f)), repo)
        errs = [r for r in res if r[0] == "error"]
        for sev, rule, msg in res:
            print(f"  {sev.upper():5} {rule}: {msg}")
        print(f"{f}: {len(errs)} error(s), {len(res) - len(errs)} warning(s)")
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
