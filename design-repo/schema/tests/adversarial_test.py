#!/usr/bin/env python3
"""Adversarial suite: every mutation must be REJECTED, every control must PASS.

Run: python3 schema/tests/adversarial_test.py   (exit 0 only if all behave)
Mutations start from the real example PageSpecs and break exactly one rule, so a
rejection proves that rule (and not some unrelated error) is what fires: each case
names the rule/layer that must appear among the findings.
"""
import copy
import glob
import json
import os
import sys

DR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(DR, "schema"))
import semantic_validate as SV  # noqa: E402
sys.path.insert(0, os.path.join(DR, "extraction"))
import wrapper_gate as WG  # noqa: E402

REPO = SV.load_repo()
J = lambda rel: json.load(open(os.path.join(DR, rel)))
LANDING = J("schema/example.pagespec.json")
PERSONA = J("schema/examples/persona.pagespec.json")
NOTFOUND = J("schema/examples/not-found.pagespec.json")


def node(doc, typ):
    return next(n for n in doc["nodes"] if n["type"] == typ)


def mut(base, fn):
    d = copy.deepcopy(base)
    fn(d)
    return d


def drop(typ):
    return lambda d: d.__setitem__("nodes", [n for n in d["nodes"] if n["type"] != typ])


def swap(a, b):
    def f(d):
        t = [n["type"] for n in d["nodes"]]
        i, j = t.index(a), t.index(b)
        d["nodes"][i], d["nodes"][j] = d["nodes"][j], d["nodes"][i]
    return f


def dup(typ):
    def f(d):
        n = copy.deepcopy(node(d, typ))
        n["id"] += "-copy"
        d["nodes"].insert(len(d["nodes"]) - 2, n)
    return f


def setp(typ, path, value):
    def f(d):
        t = node(d, typ)
        for k in path[:-1]:
            t = t[k]
        t[path[-1]] = value
    return f


def delp(typ, path):
    def f(d):
        t = node(d, typ)
        for k in path[:-1]:
            t = t[k]
        del t[path[-1]]
    return f


NAV, HERO, TABS, FEAT, FAQ, CTA, FOOT, OVER, NF = ("shell.navbar", "hero.landing-hero", "showcase.persona-tabs", "features.feature-grid",
                                                  "support.faq", "cta.download-icon", "shell.footer", "shell.youtube-overlay", "content.not-found-block")
LONG = " ".join(["word"] * 40)

# (name, base, mutation, rule that must be among the findings)
MUTATIONS = [
    # schema layer
    ("unknown template enum", LANDING, lambda d: d.__setitem__("template", "template.pricing"), "SCHEMA"),
    ("theme not in enum", LANDING, lambda d: d.__setitem__("theme", "light"), "SCHEMA"),
    ("invented node type alias", LANDING, lambda d: node(d, HERO).__setitem__("type", "hero.landing"), "SCHEMA"),
    ("missing required content field", LANDING, delp(HERO, ["content", "headline"]), "SCHEMA"),
    ("missing reducedMotionFallback", LANDING, delp(HERO, ["motion", "reducedMotionFallback"]), "SCHEMA"),
    ("invented motion field", LANDING, setp(HERO, ["motion", "inventedAnimation"], "spin"), "SCHEMA"),
    ("invented node property", LANDING, setp(HERO, ["style"], {"color": "red"}), "SCHEMA"),
    ("invented content field", LANDING, setp(HERO, ["content", "inventedField"], "x"), "SCHEMA"),
    ("motion pattern not allowed for section", LANDING, setp(HERO, ["motion", "pattern"], "none"), "SCHEMA"),
    ("motion delay not a real delay", LANDING, setp(HERO, ["motion", "delayMs"], 250), "SCHEMA"),
    ("invented assetRole value", LANDING, setp(HERO, ["content", "video", "assetRole"], "video.invented"), "SCHEMA"),
    ("assetRole of the wrong kind in a field", LANDING, setp(CTA, ["content", "icon", "assetRole"], "logo.partner"), "SCHEMA"),
    ("persona tab of both kinds", LANDING, lambda d: node(d, TABS)["content"]["tabs"][0].__setitem__("logos", []), "SCHEMA"),
    ("five apps in a tab", LANDING, lambda d: node(d, TABS)["content"]["tabs"][0]["apps"].append(copy.deepcopy(node(d, TABS)["content"]["tabs"][0]["apps"][0])), "SCHEMA"),
    ("three feature cards in a row", LANDING, lambda d: node(d, FEAT)["content"]["rows"][1]["cards"].append(copy.deepcopy(node(d, FEAT)["content"]["rows"][1]["cards"][0])), "SCHEMA"),
    ("two pillars instead of three", LANDING, lambda d: node(d, HERO)["content"]["pillars"].pop(), "SCHEMA"),
    ("six nav links", LANDING, lambda d: node(d, NAV)["content"]["links"].extend(copy.deepcopy(node(d, NAV)["content"]["links"])), "SCHEMA"),
    ("raw colour smuggled as a style prop on content", LANDING, setp(CTA, ["content", "backgroundColor"], "#ff0000"), "SCHEMA"),
    ("head robots outside enum", PERSONA, lambda d: d["head"].__setitem__("robots", "all"), "SCHEMA"),
    # structural
    ("duplicate one-per-page section (faq)", LANDING, dup(FAQ), "ONE_PER_PAGE"),
    ("duplicate navbar", LANDING, lambda d: d["nodes"].insert(1, copy.deepcopy(node(d, NAV)) | {"id": "nav-2"}), "NAV_FIRST"),
    ("mandatory section removed (footer)", LANDING, drop(FOOT), "TEMPLATE_NODES"),
    ("mandatory section removed (hero)", LANDING, drop(HERO), "TEMPLATE_NODES"),
    ("mandatory section removed (navbar)", NOTFOUND, drop(NAV), "NAV_FIRST"),
    ("fixed-position section reordered (footer before cta)", LANDING, swap(CTA, FOOT), "TEMPLATE_ORDER"),
    ("navbar not first", LANDING, swap(NAV, HERO), "NAV_FIRST"),
    ("overlay not last", LANDING, swap(FOOT, OVER), "OVERLAY_LAST"),
    ("hero in the 404 template", NOTFOUND, lambda d: d["nodes"].insert(1, copy.deepcopy(node(LANDING, HERO)) | {"id": "hero-x"}), "NOT_FOUND_NO_HERO"),
    ("404 template carrying landing nodes", LANDING, lambda d: d.__setitem__("template", "template.not-found"), "ROUTE"),
    ("persona template with the not-found node list", NOTFOUND, lambda d: d.__setitem__("template", "template.persona"), "TEMPLATE_NODES"),
    ("landing template with a persona route", LANDING, lambda d: d.__setitem__("route", "/designers"), "ROUTE"),
    ("persona template with a route it does not serve", PERSONA, lambda d: d.__setitem__("route", "/pricing"), "ROUTE"),
    ("category slug rendered as a persona route", PERSONA, lambda d: d.__setitem__("route", "/design"), "ROUTE"),
    ("404 template on a real route", NOTFOUND, lambda d: d.__setitem__("route", "/designers"), "ROUTE"),
    ("persona route with the wrong initial tab", PERSONA, setp(TABS, ["content", "initialTab"], "personal"), "ROUTE_INITIAL_TAB"),
    ("landing with a non-default initial tab", LANDING, setp(TABS, ["content", "initialTab"], "design"), "ROUTE_INITIAL_TAB"),
    ("initial tab not among the tabs", LANDING, setp(TABS, ["content", "initialTab"], "missing"), "INITIAL_TAB_IN_TABS"),
    ("duplicate tab ids", LANDING, lambda d: node(d, TABS)["content"]["tabs"][1].__setitem__("id", "personal"), "MAX_TABS_UNIQUE_IDS"),
    ("apps tab without apps", LANDING, lambda d: node(d, TABS)["content"]["tabs"][0].__delitem__("apps"), "SCHEMA"),
    ("landing navbar not marking Home", LANDING, setp(NAV, ["content", "activeLinkHref"], None), "NAV_ACTIVE_LINK"),
    ("persona navbar marking a link active", PERSONA, setp(NAV, ["content", "activeLinkHref"], "/"), "NAV_ACTIVE_LINK"),
    ("hero video id with no overlay entry", LANDING, setp(HERO, ["content", "introVideoId"], "ghost"), "VIDEO_REFS_RESOLVE"),
    ("feature demo id with no overlay entry", LANDING, lambda d: node(d, FEAT)["content"]["rows"][0]["cards"][0].__setitem__("demoVideoId", "ghost"), "VIDEO_REFS_RESOLVE"),
    ("videos referenced but overlay removed", LANDING, drop(OVER), "TEMPLATE_NODES"),
    ("duplicate node ids", LANDING, lambda d: node(d, FAQ).__setitem__("id", "hero-1"), "MAX_TABS_UNIQUE_IDS"),
    ("duplicate faq questions", LANDING, lambda d: node(d, FAQ)["content"]["items"][1].__setitem__("question", node(d, FAQ)["content"]["items"][0]["question"]), "MAX_TABS_UNIQUE_IDS"),
    # runtime maxWords
    ("hero headline over budget", LANDING, setp(HERO, ["content", "headline"], LONG), "MAX_WORDS"),
    ("faq answer over budget", LANDING, lambda d: node(d, FAQ)["content"]["items"][0].__setitem__("answer", " ".join(["w"] * 61)), "MAX_WORDS"),
    ("nested app name over budget", LANDING, lambda d: node(d, TABS)["content"]["tabs"][0]["apps"][0].__setitem__("name", "one two three four five"), "MAX_WORDS"),
    # assets
    ("role not allowed in this section (usedBy)", NOTFOUND, lambda d: node(d, NF)["content"]["icon"].__setitem__("assetRole", "particle.app-icon"), "SCHEMA"),
]
# retrieval eligibility: a utility overlay flipped to eligible must be rejected (PageSpec layer)
MUTATIONS += [
    ("utility overlay node flipped to retrievalEligible:true", LANDING, setp(OVER, ["retrievalEligible"], True), "SCHEMA"),
    ("content section node claiming retrievalEligible:false", LANDING, setp(HERO, ["retrievalEligible"], False), "SCHEMA"),
    ("retrievalEligible as a string", LANDING, setp(HERO, ["retrievalEligible"], "yes"), "SCHEMA"),
]
MUTATIONS.append(("head title over budget (word count, not schema)", PERSONA, lambda d: d["head"].__setitem__("title", " ".join(["w"] * 19)), "MAX_WORDS"))

# warn-severity rules must be reported as warnings, not errors
WARN_CASES = [
    ("404 head without noindex", NOTFOUND, lambda d: d["head"].__setitem__("robots", "max-image-preview:large"), "HEAD"),
]


def motion_budget_case():
    """MOTION_BUDGET cannot be reached by a schema-valid doc (patterns are per-section enums),
    so call the graph-rule layer directly with two burst nodes."""
    d = copy.deepcopy(LANDING)
    node(d, FAQ)["motion"]["pattern"] = "icon-press-and-burst"
    out = []
    SV.check_graph_rules(d, REPO, REPO["templates"]["template.landing"], out)
    return any(r[1] == "MOTION_BUDGET" and r[0] == "warn" for r in out)


def contract_cases():
    """Section-contract mutations (provenance/taxonomy separation, retrieval pins, wrapper gate).
    Each starts from the real contracts, breaks one thing and must raise the named rule."""
    def repo_with(fn):
        r = copy.deepcopy(REPO)
        fn(r["sections"])
        return r
    S = lambda t: (lambda secs: secs[t])
    cases = [
        ("overlay contract flipped to retrievalEligible:true", lambda x: x[OVER].__setitem__("retrievalEligible", True), "RETRIEVAL_PIN"),
        ("overlay contract flipped AND reason removed", lambda x: (x[OVER].__setitem__("retrievalEligible", True), x[OVER].pop("retrievalIneligibleReason")), "RETRIEVAL_PIN"),
        ("overlay contract missing retrievalEligible", lambda x: x[OVER].pop("retrievalEligible"), "CONTRACT_SCHEMA"),
        ("overlay ineligible without a reason", lambda x: x[OVER].pop("retrievalIneligibleReason"), "CONTRACT_SCHEMA"),
        ("dialog-type section disguised as eligible content (new cookie banner contract)", lambda x: x.__setitem__("shell.cookie-banner", {**copy.deepcopy(x[FOOT]), "id": "section.shell.cookie-banner", "typeId": "shell.cookie-banner", "registryId": "section.shell.cookie-banner", "purpose": "Cookie consent banner.", "semantic": {"id": "section.shell.cookie-banner", "category": "shell"}, "source": {"id": "src.Footer.footer", "file": "src/components/Footer.jsx", "tag": "footer", "domSelector": "footer", "citation": "jsx.footer.root"}}), "RETRIEVAL_PIN"),
        ("content section marked ineligible", lambda x: x[FAQ].update({"retrievalEligible": False, "retrievalIneligibleReason": "x" * 40}), "RETRIEVAL_PIN"),
        ("retrievalEligible not a boolean", lambda x: x[HERO].__setitem__("retrievalEligible", "true"), "CONTRACT_SCHEMA"),
        ("semantic id diverges from registryId", lambda x: x[HERO]["semantic"].__setitem__("id", "section.hero.other"), "SEMANTIC_MISMATCH"),
        ("semantic category diverges from category", lambda x: x[HERO]["semantic"].__setitem__("category", "features"), "SEMANTIC_MISMATCH"),
        ("semantic category outside the closed enum", lambda x: x[HERO]["semantic"].__setitem__("category", "landing"), "CONTRACT_SCHEMA"),
        ("source and semantic merged (source carries category)", lambda x: x[HERO]["source"].__setitem__("category", "hero"), "CONTRACT_SCHEMA"),
        ("semantic carries a source field", lambda x: x[HERO]["semantic"].__setitem__("file", "src/components/Hero.jsx"), "CONTRACT_SCHEMA"),
        ("source missing", lambda x: x[HERO].pop("source"), "CONTRACT_SCHEMA"),
        ("semantic missing", lambda x: x[HERO].pop("semantic"), "CONTRACT_SCHEMA"),
        ("source id not derived from component file + tag", lambda x: x[HERO]["source"].__setitem__("id", "src.Hero.div"), "SOURCE_ID"),
        ("source id taken from the taxonomy", lambda x: x[HERO]["source"].__setitem__("id", "section.hero.landing-hero"), "CONTRACT_SCHEMA"),
        ("two sections claiming one source element", lambda x: x[FAQ]["source"].update({"id": x[CTA]["source"]["id"]}), "SOURCE_ID"),
        ("source citation id not a cite id", lambda x: x[HERO]["source"].__setitem__("citation", "Hero line 30"), "CONTRACT_SCHEMA"),
    ]
    return [(n, repo_with(fn), rule) for n, fn, rule in cases]


def gate_cases():
    """Wrapper-gate cases on the pure function, using the real recorded heights as the base."""
    mv = json.load(open(os.path.join(DR, "extraction", "measured-values.json")))
    cats = {t: s["category"] for t, s in REPO["sections"].items()}
    def run(fn):
        h = copy.deepcopy(mv["sectionHeights"])
        fn(h)
        return WG.evaluate(h, cats, REPO["templates"])
    L = lambda h: h["pages"]["template.landing"]["sections"][HERO]
    wl = {"section": HERO, "maxHeightPx": 3600, "reviewedBy": "design-review", "justification": "Hero intentionally wraps the full pinned scroll story on this page."}
    return [
        ("control: real recorded heights pass the gate", run(lambda h: None), 0, 0),
        ("hero 1900px is a warning, not an error", run(lambda h: L(h).__setitem__("heightPx", 1900)), 0, 1),
        ("hero 3100px with no whitelist fails", run(lambda h: L(h).__setitem__("heightPx", 3100)), 1, 0),
        ("hero 3100px, whitelisted + justified, passes with a warning", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [wl]))), 0, 1),
        ("hero 3700px exceeds the whitelist maxHeightPx", run(lambda h: (L(h).__setitem__("heightPx", 3700), h.__setitem__("wrapperWhitelist", [wl]))), 1, 0),
        ("whitelist entry without justification", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [{**wl, "justification": "ok"}]))), 2, 0),
        ("whitelist entry without reviewer", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [{k: v for k, v in wl.items() if k != "reviewedBy"}]))), 2, 0),
        ("whitelist naming a non-hero section", run(lambda h: h.__setitem__("wrapperWhitelist", [{**wl, "section": FEAT}])), 1, 0),
        ("non-hero section over 3000px only warns for majority", run(lambda h: h["pages"]["template.landing"]["sections"][FEAT].__setitem__("heightPx", 9000)), 0, 1),
        ("one section holding most of the page warns", run(lambda h: h["pages"]["template.landing"]["sections"][FAQ].__setitem__("heightPx", 9000)), 0, 1),
        ("missing height record fails", run(lambda h: h["pages"]["template.landing"]["sections"].pop(FAQ)), 1, 0),
        ("missing page record fails", run(lambda h: h["pages"].pop("template.persona")), 1, 0),
        ("sectionHeights absent fails", WG.evaluate(None, cats, REPO["templates"]), 1, 0),
    ]


def findings(doc):
    return SV.validate_pagespec(doc, REPO)


def main():
    fails = 0
    rejected = 0
    for name, base, fn, rule in MUTATIONS:
        res = findings(mut(base, fn))
        errs = [r for r in res if r[0] == "error"]
        hit = any(r[1] == rule for r in errs)
        ok = bool(errs) and hit
        rejected += ok
        print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {name:58} expects {rule}" + ("" if ok else f"  got {[r[1] for r in res][:4]}"))
        fails += not ok
    for name, base, fn, rule in WARN_CASES:
        res = findings(mut(base, fn))
        ok = any(r[1] == rule and r[0] == "warn" for r in res) and not any(r[0] == "error" for r in res)
        print(f"{'WARNS' if ok else 'WRONG':12} {name:58} expects warn {rule}")
        fails += not ok
    ok = motion_budget_case()
    print(f"{'WARNS' if ok else 'WRONG':12} {'two burst sections (graph layer called directly)':58} expects warn MOTION_BUDGET")
    fails += not ok
    # utility overlay flipped to eligible with the schema pin relaxed: the semantic layer must still reject
    d = copy.deepcopy(LANDING)
    node(d, OVER)["retrievalEligible"] = True
    out = []
    SV.check_graph_rules(d, REPO, REPO["templates"]["template.landing"], out)
    ok = any(r[1] == "UTILITY_NOT_RETRIEVABLE" and r[0] == "error" for r in out)
    print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {'overlay node flipped (graph layer called directly, schema bypassed)':58} expects UTILITY_NOT_RETRIEVABLE")
    fails += not ok
    rejected += ok
    extra = 1
    # same flip with a contract that was ALSO flipped: the hard-coded pin still rejects the node
    r2 = copy.deepcopy(REPO)
    r2["sections"][OVER]["retrievalEligible"] = True
    out = []
    SV.check_graph_rules(d, r2, r2["templates"]["template.landing"], out)
    ok = any(r[1] == "UTILITY_NOT_RETRIEVABLE" and r[0] == "error" for r in out)
    print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {'node flip with the contract flipped too (pin independent of registry)':58} expects UTILITY_NOT_RETRIEVABLE")
    fails += not ok
    rejected += ok
    extra += 1
    for name, r, rule in contract_cases():
        res = SV.check_contracts(r)
        ok = any(x[1] == rule and x[0] == "error" for x in res)
        print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {name:58} expects {rule}" + ("" if ok else f"  got {[x[1] for x in res][:4]}"))
        fails += not ok
        rejected += ok
        extra += 1
    ok = not SV.check_contracts(REPO)
    print(f"{'CONTROL PASS' if ok else 'CONTROL FAIL':12} real section contracts pass check_contracts")
    fails += not ok
    gate_controls = int(ok)
    for name, (e, w), ne, nw in gate_cases():
        ok = (len(e) == ne and len(w) == nw) if ne < 2 else (len(e) >= 1 and len(w) == nw)
        print(f"{'GATE OK' if ok else 'GATE WRONG':12} {name:58} expects {ne} error(s), {nw} warning(s); got {len(e)}/{len(w)}")
        fails += not ok
        gate_controls += ok
    controls = 0
    ctrl = [("landing example", LANDING), ("persona example", PERSONA), ("not-found example", NOTFOUND)]
    # one control per persona route, with that route's real initial tab
    t = REPO["templates"]["template.persona"]
    for rt, tab in t["constraints"]["routeInitialTab"].items():
        d = copy.deepcopy(PERSONA)
        d["route"] = rt
        d["id"] = "page.persona-" + rt.strip("/")
        node(d, TABS)["content"]["initialTab"] = tab
        ctrl.append((f"persona route {rt} (tab {tab})", d))
    # generic control per template from its own node list: every template must have an example
    for tid, tpl in REPO["templates"].items():
        want = [n["section"] for n in tpl["nodes"]]
        have = [[n["type"] for n in b["nodes"]] for _, b in ctrl if b["template"] == tid]
        ok = want in have
        print(f"{'CONTROL OK' if ok else 'CONTROL FAIL':12} template {tid} has an example matching its node list")
        fails += not ok
    for name, doc in ctrl:
        res = findings(doc)
        ok = not [r for r in res if r[0] == "error"]
        controls += ok
        print(f"{'CONTROL PASS' if ok else 'CONTROL FAIL':12} {name}" + ("" if ok else f"  {res[:3]}"))
        fails += not ok
    print(f"adversarial: {rejected}/{len(MUTATIONS) + extra} mutations rejected, {controls}/{len(ctrl)} controls pass, {len(WARN_CASES)} warn-case(s), {gate_controls} contract/gate case(s) as expected")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
