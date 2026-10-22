#!/usr/bin/env python3
"""Prove the drift checks in verify_all.py actually fail on bad input.

Copies the repo to a scratch directory, injects one defect at a time, runs
verify_all.py there, and requires a non-zero exit with the expected tag in the output.
Finally runs verify_all.py on an untouched copy and requires a pass. The live repo is
never modified. Run: python3 extraction/prove_drift.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def scratch():
    """Copy the repo, and a FROZEN copy of every source file it cites, so a concurrent edit
    of the live source cannot turn an untouched copy into a false failure mid-run."""
    tmp = tempfile.mkdtemp(prefix="drift-")
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
        os.makedirs(os.path.join(tmp, "src"), exist_ok=True)
    return tmp, dst


def edit(dst, rel, fn):
    p = os.path.join(dst, rel)
    d = json.load(open(p))
    fn(d)
    json.dump(d, open(p, "w"), indent=2)


def run(dst, fast=True):
    cmd = [sys.executable, os.path.join(dst, "extraction", "verify_all.py")] + (["--skip-adversarial"] if fast else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
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


def main():
    bad = 0
    skipped = 0
    for name, tag, fn, *mode in CASES:
        if tag in ("citation", "source-trace") and not HAVE_SRC:
            print(f"SKIPPED {name:52} needs the source project beside design-repo/")
            skipped += 1
            continue
        tmp, dst = scratch()
        try:
            fn(dst)
            code, out = run(dst)
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
