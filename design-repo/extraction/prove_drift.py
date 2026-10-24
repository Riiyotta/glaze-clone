#!/usr/bin/env python3
"""Prove the drift checks in verify_all.py actually fail on bad input.

Copies the repo to a scratch directory, injects one defect at a time, runs
verify_all.py there, and requires a non-zero exit with the expected tag in the output.
Finally runs verify_all.py on an untouched copy and requires a pass. The live repo is
never modified. Run: python3 extraction/prove_drift.py [--scratch <existing empty directory for the scratch copies>]
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH_PARENT = sys.argv[sys.argv.index("--scratch") + 1] if "--scratch" in sys.argv else None
if SCRATCH_PARENT is not None and not os.path.isdir(SCRATCH_PARENT):
    sys.exit(f"--scratch {SCRATCH_PARENT!r} is not an existing directory")


def scratch():
    """Copy the repo, and a FROZEN copy of everything the source-aware checks read (the whole src/ tree, specs/, ia.json, CLONE_SPEC.md,
    every cited root file, and an empty stub for every file of public/), so a concurrent edit of the live source cannot turn an
    untouched copy into a false failure mid-run."""
    tmp = tempfile.mkdtemp(prefix="drift-", dir=SCRATCH_PARENT)
    dst = os.path.join(tmp, "design-repo")
    shutil.copytree(DR, dst, ignore=shutil.ignore_patterns("__pycache__", "*.zip"))
    parent = os.path.dirname(DR)
    if HAVE_SRC:
        mv = json.load(open(os.path.join(DR, "extraction", "measured-values.json")))
        for rel in sorted({c["file"] for c in mv["citations"].values()} | {"CLONE_SPEC.md", "ia.json"}):
            s = os.path.join(parent, rel)
            if os.path.exists(s):
                os.makedirs(os.path.dirname(os.path.join(tmp, rel)) or tmp, exist_ok=True)
                shutil.copy2(s, os.path.join(tmp, rel))
        shutil.copytree(os.path.join(parent, "src"), os.path.join(tmp, "src"), dirs_exist_ok=True)
        pa = json.load(open(os.path.join(DR, "assets", "protected-assets.json")))
        for f in pa["files"]:
            p = os.path.join(tmp, "public", f["path"])
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, "w").close()
    return tmp, dst


def edit(dst, rel, fn):
    p = os.path.join(dst, rel)
    d = json.load(open(p))
    fn(d)
    json.dump(d, open(p, "w"), indent=2)


def edit_ia(dst, fn):
    """edit the frozen copy of the source project's ia.json (it sits beside the scratch design-repo/)"""
    p = os.path.join(os.path.dirname(dst), "ia.json")
    d = json.load(open(p))
    fn(d)
    json.dump(d, open(p, "w"), indent=2)


def run(dst, fast=True):
    cmd = [sys.executable, os.path.join(dst, "extraction", "verify_all.py")] + (["--skip-adversarial"] if fast else [])
    # a scratch copy must read ITS OWN files: never fall back to the live repo's bytecode
    r = subprocess.run(cmd, capture_output=True, text=True, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    return r.returncode, r.stdout


HAVE_SRC = os.path.exists(os.path.join(os.path.dirname(DR), "CLONE_SPEC.md")) and os.path.isdir(os.path.join(os.path.dirname(DR), "src"))

def set_h(page, sec, h):
    return lambda j: j["sectionHeights"]["pages"][page]["sections"][sec].__setitem__("heightPx", h)


WL = {"section": "hero.landing-hero", "maxHeightPx": 3600, "reviewedBy": "design-review", "justification": "Hero intentionally wraps the whole pinned scroll story on this page."}
MV = "extraction/measured-values.json"

# 4th element "warn": the defect must be reported as a WARNING with exit 0 (not fail the run)
CASES = [
    ("phantom allowlist entry", "allowlist-parity", lambda d: edit(d, "tokens/llm/component-allowlist.json", lambda j: j["components"].append("component.ghost"))),
    ("orphan contract (allowlist entry removed)", "allowlist-parity", lambda d: edit(d, "tokens/llm/component-allowlist.json", lambda j: j["primitives"].remove("primitive.divider"))),
    ("out-of-range citation", "citation", lambda d: edit(d, "extraction/measured-values.json", lambda j: j["citations"]["jsx.hero.h1"].__setitem__("lines", "99990-99999"))),
    ("in-range but wrong citation", "citation", lambda d: edit(d, "extraction/measured-values.json", lambda j: j["citations"]["jsx.hero.h1"].__setitem__("lines", "1"))),
    ("wrong manifest count", "manifest-counts", lambda d: edit(d, "registry.manifest.json", lambda j: j["counts"].__setitem__("sections", 99))),
    ("allowlistVersion drift", "version-parity", lambda d: edit(d, "registry.manifest.json", lambda j: j.__setitem__("allowlistVersion", "9.9.9"))),
    ("entryPoint outside the package", "entrypoint", lambda d: edit(d, "registry.manifest.json", lambda j: j["entryPoints"]["evidence"].append("../ia.json"))),
    ("asset role changed to a different valid policy", "asset-role", lambda d: edit(d, "assets/asset-roles.json", lambda j: j["roles"]["embed.video"].__setitem__("policy", "may-generate-new"))),
    ("raw hex in a section contract", "raw-value", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["containerRules"].__setitem__("background", "#123456"))),
    ("raw px in a component contract", "raw-value", lambda d: edit(d, "components/app-card.json", lambda j: j["layout"].__setitem__("gap", "13px"))),
    ("dangling token reference", "contract-ref", lambda d: edit(d, "components/faq-item.json", lambda j: j["layout"].__setitem__("paddingY", "{foundation.space.999}"))),
    ("graph rule with no validator code", "graph-vs-validator", lambda d: edit(d, "compatibility/graph.json", lambda j: j["rules"].append({"id": "GHOST_RULE", "severity": "error", "text": "x"}))),
    ("graph adjacency diverges from templates", "graph", lambda d: edit(d, "compatibility/graph.json", lambda j: j["adjacency"]["shell.navbar"]["canPrecede"].append("shell.footer"))),
    ("template references a phantom section", "phantom-ref", lambda d: edit(d, "templates/templates.json", lambda j: j["templates"]["template.not-found"]["nodes"].insert(1, {"section": "hero.ghost", "required": True, "repeatable": False}))),
    ("schema out of date versus a section contract", "schema", lambda d: edit(d, "sections/support-faq.json", lambda j: j["contentModel"]["properties"]["title"].__setitem__("maxWords", 7))),
    ("token catalog out of date", "catalog", lambda d: edit(d, "tokens/00-foundation/radius.json", lambda j: j["foundation"]["radius"]["card"].__setitem__("$value", "20px"))),
    ("policy category that is not a catalog key", "token-policy", lambda d: edit(d, "tokens/llm/token-policy.json", lambda j: j["rules"]["rawValueRestrictions"].__setitem__("typography", "x"))),
    ("utility overlay contract flipped to retrievalEligible:true", "retrieval-pin", lambda d: edit(d, "sections/shell-youtube-overlay.json", lambda j: j.__setitem__("retrievalEligible", True))),
    ("overlay dropped from allowlist retrievalIneligibleSections", "retrieval-pin", lambda d: edit(d, "tokens/llm/component-allowlist.json", lambda j: j.__setitem__("retrievalIneligibleSections", []))),
    ("content section contract marked ineligible", "retrieval-pin", lambda d: edit(d, "sections/support-faq.json", lambda j: j.update({"retrievalEligible": False, "retrievalIneligibleReason": "x" * 40}))),
    ("section contract without retrievalEligible", "contract-schema", lambda d: edit(d, "sections/shell-footer.json", lambda j: j.pop("retrievalEligible"))),
    ("semantic category diverges from category", "semantic-mismatch", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["semantic"].__setitem__("category", "features"))),
    ("source and semantic merged into one object", "contract-schema", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["source"].__setitem__("category", "hero"))),
    ("source id not derived from file + tag", "source-id", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["source"].__setitem__("id", "src.Hero.div"))),
    ("source tag not present at the cited lines", "source-trace", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["source"].update({"tag": "aside", "id": "src.Hero.aside"}))),
    ("source citation from another file", "source-trace", lambda d: edit(d, "sections/hero-landing-hero.json", lambda j: j["source"].__setitem__("citation", "jsx.faq.wrapper"))),
    ("allowlist contract-field list diverges from the contract schema", "allowlist-parity", lambda d: edit(d, "tokens/llm/component-allowlist.json", lambda j: j["sectionContractFields"]["source"].remove("domSelector"))),
    ("hero 3500px, not whitelisted (whole-page wrapper)", "wrapper-height", lambda d: edit(d, MV, set_h("template.landing", "hero.landing-hero", 3500))),
    ("hero 3500px, whitelist entry lacks justification", "wrapper-height", lambda d: edit(d, MV, lambda j: (set_h("template.landing", "hero.landing-hero", 3500)(j), j["sectionHeights"].__setitem__("wrapperWhitelist", [{**WL, "justification": ""}])))),
    ("hero 1900px (warning band)", "wrapper-height", lambda d: edit(d, MV, set_h("template.landing", "hero.landing-hero", 1900)), "warn"),
    ("hero 3500px with a reviewed whitelist entry (accepted, warns)", "wrapper-height", lambda d: edit(d, MV, lambda j: (set_h("template.landing", "hero.landing-hero", 3500)(j), j["sectionHeights"].__setitem__("wrapperWhitelist", [WL]))), "warn"),
    ("one section holds the majority of a page", "wrapper-height", lambda d: edit(d, MV, set_h("template.landing", "support.faq", 9000)), "warn"),
    ("measured heights removed", "wrapper-height", lambda d: edit(d, MV, lambda j: j.pop("sectionHeights"))),
    ("measured selector differs from the contract's source.domSelector", "wrapper-height", lambda d: edit(d, MV, lambda j: j["sectionHeights"]["pages"]["template.landing"]["sections"]["support.faq"].__setitem__("selector", "#other"))),
    ("machine path in the docs", "abs-path", lambda d: open(os.path.join(d, "README.md"), "a").write("\n/Us" + "ers/someone/design-repo\n")),
]

AR = "assets/asset-roles.json"
SP = "assets/source-protected.json"
TP = "extraction/type_probes.json"
LP = "extraction/layout_probes.json"


def edit_text(rel, old, new):
    def f(d):
        p = os.path.join(d, rel)
        t = open(p).read()
        assert old in t, f"{old!r} not in {rel}"
        open(p, "w").write(t.replace(old, new, 1))
    return f


def role_av(role, av):
    return lambda d: edit(d, AR, lambda j: j["roles"][role].__setitem__("availability", av))


def drop_file(rel):
    return lambda d: os.remove(os.path.join(d, rel))


CASES += [
    # mode / asset availability (pinned independently of the registry)
    ("brand wordmark moved from reference-only to generation-safe", "asset-availability", role_av("brand.wordmark", "generation-safe")),
    ("blocked person.photo downgraded to reference-only", "asset-availability", role_av("person.photo", "reference-only")),
    ("blocked embed.video upgraded to generation-safe", "asset-availability", role_av("embed.video", "generation-safe")),
    ("generation-safe media.generated made reference-only", "asset-availability", role_av("media.generated", "reference-only")),
    ("availability value outside the closed list", "asset-availability", role_av("cover.image", "free-to-use")),
    ("reference-only role without a generation-safe substitute", "asset-availability", lambda d: edit(d, AR, lambda j: j["roles"]["cover.image"].__setitem__("generationSafeSubstitutes", []))),
    ("substitute that is not generation-safe", "asset-availability", lambda d: edit(d, AR, lambda j: j["roles"]["cover.image"].__setitem__("generationSafeSubstitutes", ["app.icon"]))),
    ("generatedModeGuidance removed from a role", "asset-availability", lambda d: edit(d, AR, lambda j: j["roles"]["logo.sponsor"].pop("generatedModeGuidance"))),
    ("generated-mode policy changed (placeholder logo to must-reuse-exact)", "asset-role", lambda d: edit(d, AR, lambda j: j["roles"]["logo.placeholder"].__setitem__("policy", "must-reuse-exact"))),
    ("sourceBrand patterns emptied", "asset-role", lambda d: edit(d, AR, lambda j: j["sourceBrand"].__setitem__("patterns", []))),
    ("sourceBrand patterns no longer match the source brand", "asset-role", lambda d: edit(d, AR, lambda j: j["sourceBrand"].__setitem__("patterns", ["\\bacme\\b"]))),
    ("sourceBrand pattern that does not compile", "asset-role", lambda d: edit(d, AR, lambda j: j["sourceBrand"]["patterns"].append("(unclosed"))),
    ("role removed from the pinned vocabulary check (extra role without a pin)", "asset-role", lambda d: edit(d, AR, lambda j: j["roles"].__setitem__("logo.invented", {**j["roles"]["logo.placeholder"]}))),
    ("a role is wired to a section but not listed in usedBy", "asset-role", lambda d: edit(d, AR, lambda j: j["roles"]["cover.image"].__setitem__("usedBy", []))),
    ("observed asset rule removed (source files lose their role)", "asset-map", lambda d: edit(d, AR, lambda j: j["observedAssets"]["rules"].pop(0))),
    ("observed asset rule naming an unknown role", "asset-map", lambda d: edit(d, AR, lambda j: j["observedAssets"]["rules"][3].__setitem__("role", "brand.ghost"))),
    ("observed role count changed", "asset-map", lambda d: edit(d, AR, lambda j: j["roles"]["cover.image"].__setitem__("observed", 99))),
    # protection lists derived from the source
    ("protected phrases emptied", "source-protected", lambda d: edit(d, SP, lambda j: (j.__setitem__("phrases", []), j["counts"].__setitem__("phrases", 0)))),
    ("protected host removed (glaze.app)", "source-protected", lambda d: edit(d, SP, lambda j: (j["hosts"].remove("glaze.app"), j["counts"].__setitem__("hosts", len(j["hosts"]))))),
    ("protected company removed (Raycast)", "source-protected", lambda d: edit(d, SP, lambda j: (j["entities"]["companies"].remove("Raycast"), j["counts"].__setitem__("companies", len(j["entities"]["companies"]))))),
    ("protected counts out of sync with the list", "source-protected", lambda d: edit(d, SP, lambda j: j["counts"].__setitem__("phrases", 5))),
    ("invented phrase that is not in the source", "source-protected", lambda d: edit(d, SP, lambda j: (j["phrases"].append("a sentence nobody wrote in the clone"), j["counts"].__setitem__("phrases", len(j["phrases"]))))),
    ("invented host that is not in the source", "source-protected", lambda d: edit(d, SP, lambda j: (j["hosts"].append("not-in-source.example.org"), j["counts"].__setitem__("hosts", len(j["hosts"]))))),
    ("protected asset file removed from the list", "source-protected", lambda d: edit(d, "assets/protected-assets.json", lambda j: (j["files"].pop(5), j["counts"].__setitem__("files", len(j["files"])), j["counts"].__setitem__("bytes", sum(f["bytes"] for f in j["files"]))))),
    ("protected asset counts out of sync", "source-protected", lambda d: edit(d, "assets/protected-assets.json", lambda j: j["counts"].__setitem__("files", 3))),
    # a generated example gets a leak (the example check runs the mode layer)
    ("a generated example names the source brand", "example", lambda d: edit(d, "schema/examples/generated.pricing.pagespec.json", lambda j: j["nodes"][2]["content"]["plans"][0].__setitem__("title", "Glaze Starter"))),
    ("a generated example links to a source host", "example", lambda d: edit(d, "schema/examples/generated.landing.pagespec.json", lambda j: j["nodes"][6]["content"]["primaryLinks"][0].__setitem__("href", "https://www.glaze.app/x"))),
    ("a generated example uses a reference-only role", "example", lambda d: edit(d, "schema/examples/generated.landing.pagespec.json", lambda j: j["nodes"][0]["content"].__setitem__("logoAssetRole", "brand.wordmark"))),
    ("a generated example without `mode`", "example", lambda d: edit(d, "schema/examples/generated.download.pagespec.json", lambda j: j.pop("mode"))),
    ("a template loses its generated example", "example", drop_file("schema/examples/generated.pricing.pagespec.json")),
    ("a template loses its example entirely", "example", lambda d: (os.remove(os.path.join(d, "schema/examples/pricing.pagespec.json")), os.remove(os.path.join(d, "schema/examples/generated.pricing.pagespec.json")))),
    # the mode contract itself (schema + validator), proven through the adversarial suite
    ("`mode` dropped from the generated schema's required list", "adversarial", lambda d: edit(d, "schema/pagespec.schema.json", lambda j: j["required"].remove("mode")), "full"),
    ("`mode` enum widened in the generated schema", "adversarial", lambda d: edit(d, "schema/pagespec.schema.json", lambda j: j["properties"]["mode"].__setitem__("enum", ["reference", "generated", "draft"])), "full"),
    ("validator stops enforcing generated mode", "adversarial", edit_text("schema/semantic_validate.py", 'gen = mode == "generated"', "gen = False"), "full"),
    ("validator stops reading the protected phrase list", "adversarial", edit_text("schema/semantic_validate.py", 'hit = _find_seq(toks, by_first)', "hit = None"), "full"),
    ("validator stops checking hosts", "adversarial", edit_text("schema/semantic_validate.py", 'if re.search(r"(^|[^a-z0-9.-])" + re.escape(h)', 'if False and re.search(r"(^|[^a-z0-9.-])" + re.escape(h)'), "full"),
    ("validator stops rejecting reference-only roles", "adversarial", edit_text("schema/semantic_validate.py", 'if reg and reg.get("availability") != "generation-safe":', 'if False:'), "full"),
    ("validator stops checking asset refs", "adversarial", edit_text("schema/semantic_validate.py", "if REF_KEY.search(key) and not pattern_ref.match(s):", "if False:"), "full"),
    # typography, layout, budgets (the clone is the evidence)
    ("a typography token changed (display.page-title size)", "typography", lambda d: edit(d, "tokens/10-semantic/pages-typography.json", lambda j: j["typography"]["display.page-title"].__setitem__("size", "{foundation.font.size.3xl}"))),
    ("a responsive override removed (body.prose at 480)", "typography", lambda d: edit(d, "tokens/10-semantic/pages-typography.json", lambda j: j["typography"]["body.prose"].pop("responsive"))),
    ("nav link role reverted to the documented 14/20", "typography", lambda d: edit(d, "tokens/10-semantic/typography.json", lambda j: j["typography"]["label.nav-link"].__setitem__("lineHeight", "{foundation.font.lineHeight.fixed-20}"))),
    ("a typography role loses its probe", "typography", lambda d: edit(d, TP, lambda j: j["probes"].__delitem__(next(i for i, p in enumerate(j["probes"]) if p["role"] == "heading.criteria")))),
    ("a pinned clone deviation is removed (the clone still differs)", "typography", lambda d: edit(d, TP, lambda j: [p.pop("cloneDeviation") for p in j["probes"] if p["id"] == "display.page-title.blog"])),
    ("a pinned clone deviation goes stale (note pins a value the clone does not render)", "typography", lambda d: edit(d, TP, lambda j: [p["cloneDeviation"]["measured"].__setitem__("lineHeight", "50px") for p in j["probes"] if p["id"] == "display.page-title.blog"])),
    ("a component token changed (planCard.padding)", "layout", lambda d: edit(d, "tokens/20-component/pages-component-tokens.json", lambda j: j["planCard"].__setitem__("padding", "{foundation.space.6}"))),
    ("a layout token changed (container.content)", "layout", lambda d: edit(d, "tokens/30-layout/layout.json", lambda j: j["container"]["content"].__setitem__("$value", "600px"))),
    ("a motion token changed (awards video duration)", "layout", lambda d: edit(d, "tokens/00-foundation/pages.json", lambda j: j["foundation"]["duration"]["800"].__setitem__("$value", "700ms"))),
    ("a section padding token changed (legal-top)", "layout", lambda d: edit(d, "tokens/30-layout/pages-layout.json", lambda j: j["sectionPadding"]["legal-top"].__setitem__("$value", "{foundation.space.40}"))),
    ("layout probe expression that does not evaluate", "layout", lambda d: edit(d, LP, lambda j: j["probes"][0]["expect"].__setitem__("paddingLeft", "{space.ghost}"))),
    ("FAQ answer budget lowered below the real copy", "content-budget", lambda d: edit(d, "sections/support-faq.json", lambda j: j["contentModel"]["properties"]["items"]["items"]["properties"]["answer"].__setitem__("maxWords", 60))),
    ("legal paragraph budget lowered below the real copy", "content-budget", lambda d: edit(d, "sections/content-legal-body.json", lambda j: j["contentModel"]["properties"]["blocks"]["items"]["oneOf"][2]["properties"]["text"].__setitem__("maxWords", 300))),
    ("store tagline budget lowered below the 95th percentile", "content-budget", lambda d: edit(d, "sections/store-app-header.json", lambda j: j["contentModel"]["properties"]["tagline"].__setitem__("maxWords", 8))),
    ("release block count budget lowered", "content-budget", lambda d: edit(d, "sections/content-release-entry.json", lambda j: j["contentModel"]["properties"]["blocks"].__setitem__("maxItems", 20))),
    ("content budget path that no longer resolves", "content-budget", lambda d: edit(d, MV, lambda j: j["contentBudgets"]["entries"][0].__setitem__("path", "ghost"))),
    # routes
    ("a route of the route table is not mapped to a template", "route-coverage", lambda d: edit(d, "templates/templates.json", lambda j: j["templates"]["template.legal"]["routes"].remove("/aup"))),
    ("a phantom route in a template", "route-coverage", lambda d: edit(d, "templates/templates.json", lambda j: j["templates"]["template.pricing"]["routes"].append("/plans"))),
    ("a route claimed by two templates", "route-coverage", lambda d: edit(d, "templates/templates.json", lambda j: j["templates"]["template.download"]["routes"].append("/pricing"))),
    ("pattern template count differs from the route table", "route-coverage", lambda d: edit(d, "templates/templates.json", lambda j: j["templates"]["template.app-detail"]["routeParams"]["slug"].__setitem__("count", 100))),
    ("route table loses a declaration", "route-coverage", lambda d: edit(d, MV, lambda j: j["routeTable"]["routes"].pop(0))),
    ("IA route differs from the template route", "ia", lambda d: edit_ia(d, lambda j: j["templates"][3].__setitem__("routes", ["/plans"]))),
    ("IA total routes differs from the templates", "route-coverage", lambda d: edit_ia(d, lambda j: j["meta"].__setitem__("totalRoutes", 999))),
    ("IA section list differs from the template", "ia", lambda d: edit_ia(d, lambda j: j["templates"][3]["sections"].pop())),
    # versions
    ("repositoryVersion differs from the newest CHANGELOG heading", "version-parity", lambda d: edit(d, "registry.manifest.json", lambda j: j.__setitem__("repositoryVersion", "9.9.9"))),
    ("pageSpecVersion differs from the schema version", "version-parity", lambda d: edit(d, "registry.manifest.json", lambda j: j.__setitem__("pageSpecVersion", "1.1.0"))),
    # wrapper gate on the new templates
    ("legal body accepted without a justification", "wrapper-height", lambda d: edit(d, MV, lambda j: j["sectionHeights"]["majorityAccepted"][0].__setitem__("justification", "ok"))),
    ("a new template's page title is a whole-page wrapper", "wrapper-height", lambda d: edit(d, MV, lambda j: j["sectionHeights"]["pages"]["template.pricing"]["sections"]["hero.page-title"].__setitem__("heightPx", 3500))),
    ("a new template has no measured heights", "wrapper-height", lambda d: edit(d, MV, lambda j: j["sectionHeights"]["pages"].pop("template.awards"))),
    ("source id ordinal that does not trace to the file", "source-trace", lambda d: edit(d, "sections/store-app-stats.json", lambda j: j["source"].__setitem__("id", "src.AppDetail.div.2"))),
    ("a route's document scrolls horizontally at 390px", "layout", lambda d: edit(d, MV, lambda j: j["layoutChecks"]["overflow"].__setitem__("/pricing@390", 420))),
    ("overflow coverage removed", "layout", lambda d: edit(d, MV, lambda j: j["layoutChecks"].pop("overflow"))),
    ("clone document height drifts from the live-site number with no explanation", "spec-crosscheck", lambda d: edit(d, MV, lambda j: [e.update({"clonePx": e["specPx"] + 400, "deltaPx": 400}) for e in j["specCrossCheck"]["entries"] if e["route"] == "/pricing" and e["viewport"] == 1440])),
    ("an explained document-height difference grows beyond what placeholder text can explain", "spec-crosscheck", lambda d: edit(d, MV, lambda j: [e.update({"clonePx": int(e["specPx"] * 1.4), "deltaPx": int(e["specPx"] * 1.4) - e["specPx"]}) for e in j["specCrossCheck"]["entries"] if e["route"] == "/terms" and e["viewport"] == 1440])),
    ("spec cross-check entry cites a ledger id that does not exist", "spec-crosscheck", lambda d: edit(d, MV, lambda j: j["specCrossCheck"]["entries"][0].__setitem__("specCite", "spec.ghost"))),
    ("repeated node recorded as the whole list (post card total) and no longer counted per instance", "wrapper-height", lambda d: edit(d, MV, lambda j: j["sectionHeights"]["pages"]["template.blog-index"]["sections"]["content.post-card"].pop("totalHeightPx")), "warn"),
    ("a role wired wrongly (generatedRoles lists a blocked role)", "role-wiring", lambda d: edit(d, "sections/hero-awards-hero.json", lambda j: j["contentModel"]["properties"]["sponsor"]["properties"]["logo"]["properties"]["assetRole"]["generatedRoles"].append("logo.sponsor"))),
]

# cases whose defect is only detectable against the source project (the others are caught by the offline checks)
NEEDS_SRC = {"invented phrase that is not in the source", "invented host that is not in the source", "protected asset file removed from the list",
             "IA total routes differs from the templates"}


def main():
    bad = 0
    skipped = 0
    for name, tag, fn, *mode in CASES:
        if not HAVE_SRC and (tag in ("citation", "source-trace", "ia") or name in NEEDS_SRC):
            print(f"SKIPPED {name:52} needs the source project beside design-repo/")
            skipped += 1
            continue
        tmp, dst = scratch()
        try:
            fn(dst)
            code, out = run(dst, fast=(mode != ["full"]))
            if mode == ["warn"]:
                ok = code == 0 and f"WARN  [{tag}]" in out
                print(f"{'WARNED' if ok else 'MISSED':7} {name:52} expects WARN [{tag}], exit 0")
            else:
                ok = code != 0 and f"[{tag}]" in out
                print(f"{'CAUGHT' if ok else 'MISSED':7} {name:52} expects [{tag}]")
            bad += not ok
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    tmp, dst = scratch()
    try:
        code, out = run(dst, fast=False)
        ok = code == 0
        print(f"{'PASS' if ok else 'FAIL':7} untouched scratch copy passes the full verify_all.py (incl. adversarial)" + ("" if ok else "\n" + out[-1200:]))
        bad += not ok
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    ran = len(CASES) - skipped
    print(f"drift proof: FAILED ({bad} problem(s))" if bad else f"drift proof: {ran}/{ran} injected defects caught or warned as designed" + (f" ({skipped} skipped: no sibling source)" if skipped else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
