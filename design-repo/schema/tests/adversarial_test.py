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
    print(f"adversarial: {rejected}/{len(MUTATIONS)} mutations rejected, {controls}/{len(ctrl)} controls pass, {len(WARN_CASES)} warn-case(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
