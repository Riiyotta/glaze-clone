#!/usr/bin/env python3
"""Verification sweep for the Glaze design-repo. Run from anywhere:

    python3 extraction/verify_all.py

DR is derived from this file's location, never a machine path. Exit 0 = every check
passed (warnings allowed); exit 1 = at least one error; exit 2 = not a design-repo.

Checks (numbers match the printed output):
  0 self-containment sentinel          7 asset roles (pinned policies, usage)
  1 JSON parse                         8 template/graph/route consistency
  2 allowlist <-> contract parity      9 schema freshness, Draft-07, examples
  3 token tree, references, catalog   10 citations (range + content), source drift
  4 contract references resolve       11 manifest counts, versions, entryPoints, machine-path grep
  5 raw-value lint                    12 adversarial suite
  6 graph rules <-> validator code
 Also: 9a section contracts (provenance `source` vs taxonomy `semantic`, pinned retrieval
 eligibility of utility overlays), 10b whole-page-wrapper quality gate (extraction/wrapper_gate.py).
"""
import glob
import json
import os
import re
import subprocess
import sys

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(DR, "tokens"))
sys.path.insert(0, os.path.join(DR, "schema"))
sys.path.insert(0, os.path.join(DR, "extraction"))
errors, warnings = [], []


def err(tag, msg):
    errors.append(f"[{tag}] {msg}")


def warn(tag, msg):
    warnings.append(f"[{tag}] {msg}")


def jload(rel):
    return json.load(open(os.path.join(DR, rel)))


# 0 -------------------------------------------------------------------------
sentinels = ["registry.manifest.json", "schema/pagespec.schema.json", "sections", "primitives", "tokens", "templates/templates.json"]
missing = [s for s in sentinels if not os.path.exists(os.path.join(DR, s))]
if missing:
    print(f"FATAL: DR={DR} lacks {missing}; refusing a false clean pass.")
    sys.exit(2)
print("0) Self-containment sentinel: ok")

# 1 -------------------------------------------------------------------------
files = sorted(glob.glob(os.path.join(DR, "**", "*.json"), recursive=True))
parsed = {}
for f in files:
    try:
        parsed[os.path.relpath(f, DR)] = json.load(open(f))
    except Exception as e:  # noqa: BLE001
        err("parse", f"{os.path.relpath(f, DR)}: {e}")
if not files:
    print("FATAL: 0 json files")
    sys.exit(2)
print(f"1) JSON parse: {len(files)} files, {sum(e.startswith('[parse]') for e in errors)} failed")

# registries ---------------------------------------------------------------
def reg(d):
    out = {}
    for f in sorted(glob.glob(os.path.join(DR, d, "*.json"))):
        j = json.load(open(f))
        out[j["registryId"]] = (os.path.relpath(f, DR), j)
    return out

prims, comps, secs = reg("primitives"), reg("components"), reg("sections")
sec_by_type = {j["typeId"]: j for _, j in secs.values()}
templates = jload("templates/templates.json")["templates"]
allow = jload("tokens/llm/component-allowlist.json")

# 2 -------------------------------------------------------------------------
def parity(name, real, listed):
    for m in sorted(set(real) - set(listed)):
        err("allowlist-parity", f"{name} '{m}' has a contract but is NOT in the allowlist")
    for p in sorted(set(listed) - set(real)):
        err("allowlist-parity", f"{name} '{p}' is in the allowlist but has NO contract file")
    return len(set(real) - set(listed)), len(set(listed) - set(real))

r = [parity("primitive", prims, allow["primitives"]), parity("component", comps, allow["components"]),
     parity("section", secs, allow["sections"]), parity("template", templates, allow["templates"])]
print(f"2) Allowlist parity (missing, phantom): primitives {r[0]}, components {r[1]}, sections {r[2]}, templates {r[3]}")
schema_node_props = set(jload("schema/pagespec.schema.json")["definitions"]["node"]["properties"])
if set(allow["settableNodeProperties"]) != schema_node_props:
    err("allowlist-parity", f"settableNodeProperties {sorted(allow['settableNodeProperties'])} != schema node properties {sorted(schema_node_props)}")
sch = jload("schema/pagespec.schema.json")
if set(allow["settablePageProperties"]) != set(sch["properties"]):
    err("allowlist-parity", "settablePageProperties differ from schema top-level properties")
if set(allow["settableMotionFields"]) != set(sch["definitions"]["motion"]["properties"]):
    err("allowlist-parity", "settableMotionFields differ from schema motion properties")
if set(allow["settableHeadFields"]) != set(sch["definitions"]["head"]["properties"]):
    err("allowlist-parity", "settableHeadFields differ from schema head properties")
assets = jload("assets/asset-roles.json")
if sorted(allow["assetRoles"]) != sorted(assets["roles"]):
    err("allowlist-parity", "allowlist assetRoles differ from assets/asset-roles.json")
_cs = jload("schema/section-contract.schema.json")
_scf = allow.get("sectionContractFields", {})
if sorted(_scf.get("required", [])) != sorted(_cs["required"]):
    err("allowlist-parity", "allowlist sectionContractFields.required differs from schema/section-contract.schema.json required")
if sorted(_scf.get("semantic", [])) != sorted(_cs["properties"]["semantic"]["properties"]):
    err("allowlist-parity", "allowlist sectionContractFields.semantic differs from the contract schema")
if sorted(_scf.get("source", [])) != sorted(_cs["properties"]["source"]["properties"]):
    err("allowlist-parity", "allowlist sectionContractFields.source differs from the contract schema")
if sorted(_scf.get("conditional", [])) != ["retrievalIneligibleReason"] or "retrievalIneligibleReason" not in _cs["properties"]:
    err("allowlist-parity", "allowlist sectionContractFields.conditional differs from the contract schema")

# 3 tokens ------------------------------------------------------------------
import tokens_lib as TL  # noqa: E402
import build_catalog as BC  # noqa: E402

tree, roots = TL.load_tree()
tok_errs0 = len(errors)
for path, node in TL.walk_tokens(tree):
    try:
        TL.resolve_value(tree, node)
        for ref in TL.refs_in(node["$value"]):
            TL.lookup(tree, ref)
    except (KeyError, ValueError) as e:
        err("token-ref", f"{path}: {e}")
for layer in ("10-semantic", "20-component", "30-layout"):
    for f in glob.glob(os.path.join(DR, "tokens", layer, "*.json")):
        for ref in TL.refs_in(json.load(open(f))):
            try:
                TL.lookup(tree, ref)
            except KeyError:
                err("token-ref", f"{os.path.relpath(f, DR)}: unresolved {{{ref}}}")
theme = jload("tokens/themes/dark.json")
for slot, ref in theme["slots"].items():
    for rf in TL.refs_in(ref):
        try:
            TL.lookup(tree, rf)
        except KeyError:
            err("token-ref", f"themes/dark.json slot {slot}: unresolved {{{rf}}}")
catalog_text = json.dumps(BC.build(), indent=1, ensure_ascii=False) + "\n"
if open(BC.OUT).read() != catalog_text:
    err("catalog", "tokens/llm/token-catalog.json is out of date; run tokens/build_catalog.py")
cat = json.loads(catalog_text)
policy = jload("tokens/llm/token-policy.json")
for c in policy["rules"]["rawValueRestrictions"]:
    if c not in cat["counts"]["byCategory"]:
        err("token-policy", f"rawValueRestrictions category {c!r} is not a real catalog category {sorted(cat['counts']['byCategory'])}")
for pat in policy["notGenerationApproved"]:
    pre = pat.rstrip("*").rstrip(".")
    if not any(p == pre or p.startswith(pre + ".") for p in cat["tokens"]):
        err("token-policy", f"notGenerationApproved pattern {pat!r} matches no token")
print(f"3) Tokens: {cat['counts']['tokens']} leaf tokens + {cat['counts']['typographyRoles']} type roles + {cat['counts']['motionRecipes']} motion recipes; "
      f"{len(errors) - tok_errs0} reference/catalog/policy errors")

# 4 -------------------------------------------------------------------------
CONTRACT_DIRS = ["primitives", "components", "sections"]
contract_files = {rel: j for rel, j in parsed.items() if rel.split("/")[0] in CONTRACT_DIRS + ["templates", "compatibility"]}
c4 = len(errors)
n_refs = 0
for rel, j in contract_files.items():
    for ref in TL.refs_in(j):
        n_refs += 1
        try:
            TL.lookup(tree, ref)
        except KeyError:
            err("contract-ref", f"{rel}: unresolved token reference {{{ref}}}")

def walk(x, fn, path=""):
    if isinstance(x, dict):
        for k, v in x.items():
            fn(k, v, path)
            walk(v, fn, f"{path}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            walk(v, fn, f"{path}[{i}]")

for rel, j in contract_files.items():
    def chk(k, v, path, rel=rel):
        if k == "tokens" and isinstance(v, list):
            for t in v:
                try:
                    TL.lookup(tree, t)
                except KeyError:
                    err("contract-ref", f"{rel}{path}.tokens: {t!r} does not resolve")
        if k == "composes":
            for cid in v:
                if cid not in prims and cid not in comps:
                    err("contract-ref", f"{rel}: composes unknown {cid!r}")
    walk(j, chk)
icon_names = set(prims["primitive.icon"][1]["icons"])
for rel, j in contract_files.items():
    for m in re.findall(r"primitive\.icon#([a-z-]+)", json.dumps(j)):
        if m not in icon_names:
            err("contract-ref", f"{rel}: primitive.icon#{m} is not an icon")
    for m in re.findall(r"primitive\.(?:glass-surface|button)#([a-z-]+)", json.dumps(j)):
        pass
for rel, j in contract_files.items():
    for sid, name in re.findall(r"(primitive\.(?:glass-surface|button|divider))#([a-z-]+)", json.dumps(j)):
        if name not in prims[sid][1].get("variants", {}):
            err("contract-ref", f"{rel}: {sid}#{name} is not a variant of {sid}")
for rid, (rel, j) in secs.items():
    for cid in j["composes"]:
        if cid not in prims and cid not in comps:
            err("contract-ref", f"{rel}: composes unknown {cid!r}")
print(f"4) Contract references: {n_refs} token refs checked, {len(errors) - c4} errors")

# 5 raw-value lint ----------------------------------------------------------
EXEMPT = set(policy["rawLintExemptKeys"])
RAW = [(re.compile(r"#[0-9a-fA-F]{3,8}\b"), "hex colour"), (re.compile(r"\brgba?\("), "rgb()/rgba()"),
       (re.compile(r"cubic-bezier"), "cubic-bezier"), (re.compile(r"(?<![\w.])\d+(\.\d+)?(px|rem|em|ms)\b"), "raw length/duration")]
c5 = len(errors)
for rel, j in contract_files.items():
    if rel.split("/")[0] not in CONTRACT_DIRS + ["templates"]:
        continue
    def lint(path, x, exempt):
        if isinstance(x, dict):
            for k, v in x.items():
                lint(f"{path}.{k}", v, exempt or k in EXEMPT)
        elif isinstance(x, list):
            for i, v in enumerate(x):
                lint(f"{path}[{i}]", v, exempt)
        elif isinstance(x, str) and not exempt:
            s = TL.REF.sub("", x)
            for rx, what in RAW:
                m = rx.search(s)
                if m:
                    err("raw-value", f"{rel}{path}: {what} {m.group(0)!r} should be a token (in {x[:70]!r})")
    lint("", j, False)
print(f"5) Raw-value lint (primitives, components, sections, templates): {len(errors) - c5} violations")

# 6 -------------------------------------------------------------------------
import semantic_validate as SV  # noqa: E402

graph = jload("compatibility/graph.json")
graph_rule_ids = {r["id"] for r in graph["rules"]}
c6 = len(errors)
if graph_rule_ids != SV.IMPLEMENTED_RULES:
    err("graph-vs-validator", f"rule ids differ: only in graph {sorted(graph_rule_ids - SV.IMPLEMENTED_RULES)}, only in validator {sorted(SV.IMPLEMENTED_RULES - graph_rule_ids)}")
src = open(os.path.join(DR, "schema", "semantic_validate.py")).read()
for rid in graph_rule_ids:
    if f'"{rid}"' not in src.split("def check_template")[1]:
        err("graph-vs-validator", f"rule {rid} is declared but never referenced in check_* code")
for r_ in graph["rules"]:
    if r_.get("severity") not in ("error", "warn"):
        err("graph", f"rule {r_['id']} lacks severity error|warn")
print(f"6) Graph rules vs validator code: {len(graph_rule_ids)} rules, {len(errors) - c6} disagreements")

# 7 assets ------------------------------------------------------------------
# Compliance-critical pins, independent of assets/asset-roles.json: each role's generation POLICY and its mode AVAILABILITY.
# Membership in the closed enums is necessary but not sufficient: a registry edit that moves a role to another valid value must fail.
PINNED = {"brand.wordmark": "must-reuse-exact", "brand.app-icon": "must-reuse-exact", "particle.app-icon": "must-reuse-exact",
          "badge.award": "must-reuse-exact", "video.hero-loop": "must-reuse-exact", "app.icon": "may-generate-new",
          "avatar.person": "may-generate-new", "screenshot.feature": "must-not-fabricate", "logo.partner": "must-not-fabricate",
          "embed.video": "must-not-reuse-live-endpoint",
          "cover.image": "may-generate-new", "article.image": "must-not-fabricate", "screenshot.app": "must-not-fabricate",
          "video.awards-hero": "must-reuse-exact", "person.photo": "must-not-fabricate", "logo.sponsor": "must-not-fabricate",
          "mark.third-party": "must-not-fabricate",
          "brand.wordmark-placeholder": "may-generate-new", "brand.wordmark-user-supplied": "must-reuse-exact",
          "brand.app-icon-placeholder": "may-generate-new", "brand.app-icon-user-supplied": "must-reuse-exact",
          "particle.placeholder": "may-generate-new", "app.icon-generated": "may-generate-new", "avatar.placeholder": "may-generate-new",
          "badge.award-generated": "may-generate-new", "media.generated": "may-generate-new", "media.user-supplied": "must-reuse-exact",
          "video.user-supplied": "must-reuse-exact", "logo.placeholder": "may-generate-new", "logo.user-supplied": "must-reuse-exact"}
RO, GS, BL = "reference-only", "generation-safe", "blocked-for-generation"
PINNED_AVAILABILITY = {"brand.wordmark": RO, "brand.app-icon": RO, "particle.app-icon": RO, "app.icon": RO, "avatar.person": RO, "badge.award": RO,
                       "screenshot.feature": RO, "video.hero-loop": RO, "cover.image": RO, "article.image": RO, "screenshot.app": RO, "video.awards-hero": RO,
                       "logo.partner": BL, "embed.video": BL, "person.photo": BL, "logo.sponsor": BL, "mark.third-party": BL,
                       "brand.wordmark-placeholder": GS, "brand.wordmark-user-supplied": GS, "brand.app-icon-placeholder": GS, "brand.app-icon-user-supplied": GS,
                       "particle.placeholder": GS, "app.icon-generated": GS, "avatar.placeholder": GS, "badge.award-generated": GS, "media.generated": GS,
                       "media.user-supplied": GS, "video.user-supplied": GS, "logo.placeholder": GS, "logo.user-supplied": GS}
c7 = len(errors)
if assets.get("availabilityValues") != [RO, GS, BL]:
    err("asset-role", f"availabilityValues {assets.get('availabilityValues')} != {[RO, GS, BL]}")
for role, spec in assets["roles"].items():
    if spec["policy"] not in assets["policyEnum"]:
        err("asset-role", f"{role}: policy {spec['policy']!r} not in policyEnum")
    if role not in PINNED:
        err("asset-role", f"{role}: no pinned policy in verify_all.PINNED")
    elif spec["policy"] != PINNED[role]:
        err("asset-role", f"{role}: policy {spec['policy']!r} differs from pinned {PINNED[role]!r} (compliance-critical)")
    if role not in PINNED_AVAILABILITY:
        err("asset-availability", f"{role}: no pinned availability in verify_all.PINNED_AVAILABILITY")
    elif spec.get("availability") != PINNED_AVAILABILITY[role]:
        err("asset-availability", f"{role}: availability {spec.get('availability')!r} differs from pinned {PINNED_AVAILABILITY[role]!r} (a generated page's protection depends on it)")
    if not spec.get("guidance"):
        err("asset-role", f"{role}: missing guidance")
    if not spec.get("generatedModeGuidance"):
        err("asset-availability", f"{role}: missing generatedModeGuidance")
    subs = spec.get("generationSafeSubstitutes", [])
    if spec.get("availability") in (RO, BL):
        if not subs and role != "mark.third-party":
            err("asset-availability", f"{role}: {spec.get('availability')} role names no generation-safe substitute")
        for sub in subs:
            if sub not in assets["roles"] or assets["roles"][sub].get("availability") != GS:
                err("asset-availability", f"{role}: substitute {sub!r} is not a generation-safe role")
    elif subs:
        err("asset-availability", f"{role}: a generation-safe role must not list substitutes")
    for u in spec["usedBy"]:
        if u not in sec_by_type:
            err("asset-role", f"{role}: usedBy unknown section {u}")
for role in PINNED:
    if role not in assets["roles"]:
        err("asset-role", f"pinned role {role} missing from asset-roles.json")
used = {}
def collect_roles(tid):
    def f(k, v, path):
        if (k == "assetRole" or k.endswith("AssetRole")) and isinstance(v, dict) and "enum" in v:
            for r_ in v["enum"]:
                used.setdefault(r_, set()).add(tid)
    return f
for tid, j in sec_by_type.items():
    walk(j["contentModel"], collect_roles(tid))
for role, tids in used.items():
    if role not in assets["roles"]:
        err("asset-role", f"section contract uses unknown assetRole {role!r}")
    else:
        for t in tids:
            if t not in assets["roles"][role]["usedBy"]:
                err("asset-role", f"{t} uses {role} but asset-roles usedBy lists {assets['roles'][role]['usedBy']}")
for role, spec_ in assets["roles"].items():
    if role not in used and "derivedFrom" not in spec_:
        err("asset-role", f"role {role} is not wired into any section contract (schema)")
sb = assets.get("sourceBrand", {})
for need in ("names", "patterns"):
    if not sb.get(need):
        err("asset-role", f"asset-roles.json sourceBrand.{need} is empty: a generated page would not be checked against the source brand")
import re as _re
for pat in sb.get("patterns", []):
    try:
        _re.compile(pat)
    except _re.error as e_:
        err("asset-role", f"sourceBrand pattern {pat!r} does not compile: {e_}")
if not any(_re.search(p_, "Glaze", _re.I) for p_ in sb.get("patterns", [])) or not any(_re.search(p_, "Raycast", _re.I) for p_ in sb.get("patterns", [])):
    err("asset-role", "sourceBrand.patterns no longer match the source brand names Glaze and Raycast")
print(f"7) Asset roles: {len(assets['roles'])} roles pinned (policy + availability: {sum(1 for r_ in assets['roles'].values() if r_.get('availability') == RO)} reference-only, "
      f"{sum(1 for r_ in assets['roles'].values() if r_.get('availability') == BL)} blocked, {sum(1 for r_ in assets['roles'].values() if r_.get('availability') == GS)} generation-safe), {len(used)} wired into schema; {len(errors) - c7} errors")

# 7c observed asset files -> roles --------------------------------------------------
c7c = len(errors)
_obs = assets.get("observedAssets", {})
_pa = jload("assets/protected-assets.json")
_rules = [(re.compile(r_["match"]), r_["role"]) for r_ in _obs.get("rules", [])]
_cnt = {}
for r_ in _obs.get("rules", []):
    if not r_["role"].startswith("none:") and r_["role"] not in assets["roles"]:
        err("asset-map", f"observedAssets rule {r_['match']!r} names unknown role {r_['role']}")
for f_ in _pa["files"]:
    hit = next((role for rx, role in _rules if rx.search(f_["path"])), None)
    if hit is None:
        err("asset-map", f"source asset {f_['path']} matches no observedAssets rule: it has no role")
    else:
        _cnt[hit] = _cnt.get(hit, 0) + 1
if dict(sorted(_cnt.items())) != _obs.get("counts"):
    err("asset-map", f"observedAssets.counts {_obs.get('counts')} != recomputed {dict(sorted(_cnt.items()))}")
for role, spec in assets["roles"].items():
    if spec.get("observed") != _cnt.get(role, 0):
        err("asset-map", f"{role}: observed {spec.get('observed')} != {_cnt.get(role, 0)} mapped source files")
print(f"7c) Asset map: {len(_pa['files'])} source files mapped to {len(_cnt)} roles/classes by {len(_rules)} rules; {len(errors) - c7c} errors")

# 8 -------------------------------------------------------------------------
c8 = len(errors)
adj = {}
route_owner = {}
for tid, t in templates.items():
    types = [n["section"] for n in t["nodes"]]
    for n in t["nodes"]:
        if set(n) - {"maxCount"} != {"section", "required", "repeatable"} or ("maxCount" in n and (not n["repeatable"] or not isinstance(n["maxCount"], int) or n["maxCount"] < 2)):
            err("template", f"{tid}: node {n} must be exactly section/required/repeatable (+ maxCount >= 2 only on a repeatable node)")
        if n["section"] not in sec_by_type:
            err("phantom-ref", f"{tid} references phantom section {n['section']}")
    for a, b in zip(types, types[1:]):
        adj.setdefault(a, set()).add(b)
    for rt in t["routes"]:
        if rt in route_owner:
            err("route-coverage", f"route {rt} claimed by both {route_owner[rt]} and {tid}")
        route_owner[rt] = tid
    for cont in t.get("containers", []):
        for h in cont["holds"]:
            if h not in sec_by_type and h not in {c["id"] for c in t["containers"]}:
                err("template", f"{tid}: container {cont['id']} holds unknown {h}")
    held = {h for cont in t["containers"] for h in cont["holds"]}
    for s in types:
        if s not in held:
            err("template", f"{tid}: section {s} is in no container")
for a, rule in graph["adjacency"].items():
    if a not in sec_by_type:
        err("phantom-ref", f"graph adjacency key {a} is not a section")
    for b in rule["canPrecede"]:
        if b not in sec_by_type:
            err("phantom-ref", f"graph adjacency {a}->{b} phantom")
real_adj = {a: sorted(b) for a, b in adj.items()}
graph_adj = {a: sorted(r_["canPrecede"]) for a, r_ in graph["adjacency"].items()}
if real_adj != graph_adj:
    err("graph", "compatibility/graph.json adjacency differs from consecutive pairs in templates.json")
for tid, j in sec_by_type.items():
    if not any(tid in [n["section"] for n in t["nodes"]] for t in templates.values()):
        err("template", f"section {tid} is used by no template")
# routes vs repo-level IA (only when the source project is present)
PROJECT = os.path.dirname(DR)
HAVE_SRC = os.path.exists(os.path.join(PROJECT, "CLONE_SPEC.md")) and os.path.isdir(os.path.join(PROJECT, "src"))
if HAVE_SRC and os.path.exists(os.path.join(PROJECT, "ia.json")):
    ia = json.load(open(os.path.join(PROJECT, "ia.json")))
    ia_t = {t["id"]: t for t in ia["templates"]}
    for tid, t in templates.items():
        if tid not in ia_t:
            err("ia", f"{tid} not in ia.json")
        elif t["routes"] != (ia_t[tid]["routes"] if t["routeKind"] != "pattern" else [ia_t[tid].get("routePattern")]):
            err("ia", f"{tid} routes {t['routes']} differ from ia.json {ia_t[tid]['routes'] if t['routeKind'] != 'pattern' else ia_t[tid].get('routePattern')}")
        elif [n["section"] for n in t["nodes"]] != ia_t[tid]["sections"]:
            err("ia", f"{tid} sections differ from ia.json")
    print(f"8) Templates/graph/routes: {len(templates)} templates, {len(route_owner)} route entries, matches ia.json; {len(errors) - c8} errors")
else:
    warn("ia", "ia.json / source project not present beside design-repo/: route cross-check against the repo IA skipped")
    print(f"8) Templates/graph/routes: {len(templates)} templates, {len(route_owner)} route entries, IA cross-check SKIPPED; {len(errors) - c8} errors")

# 9a section contracts ------------------------------------------------------
import semantic_validate as SV9  # noqa: E402

c9b = len(errors)
_repo9 = SV9.load_repo()
for sev_, rule_, msg_ in SV9.check_contracts(_repo9):
    err(rule_.lower().replace("_", "-"), msg_)
# retrieval pins, independent of the registry: the hard-coded set, the contracts and the allowlist must agree
_pin = {"section." + t for t in SV9.UTILITY_SECTIONS}
_ineligible = {j["registryId"] for _, j in secs.values() if j.get("retrievalEligible") is False}
if _ineligible != _pin:
    err("retrieval-pin", f"sections with retrievalEligible:false {sorted(_ineligible)} != pinned utility set {sorted(_pin)}")
if set(allow.get("retrievalIneligibleSections", [])) != _pin:
    err("retrieval-pin", f"allowlist retrievalIneligibleSections {allow.get('retrievalIneligibleSections')} != pinned utility set {sorted(_pin)}")
_nodeprops = jload("schema/pagespec.schema.json")["definitions"]["node"]["allOf"]
for br in _nodeprops:
    _t = br["if"]["properties"]["type"]["const"]
    _want = sec_by_type[_t].get("retrievalEligible")
    if br["then"]["properties"].get("retrievalEligible") != {"const": _want}:
        err("retrieval-pin", f"generated schema pins retrievalEligible for {_t} to {br['then']['properties'].get('retrievalEligible')}, contract says {_want}")
print(f"9a) Section contracts: {len(sec_by_type)} validated (source/semantic separated, retrieval pins: {sorted(_pin)} ineligible); {len(errors) - c9b} errors")

# 9 schema ------------------------------------------------------------------
import jsonschema  # noqa: E402
import build_schema as BS  # noqa: E402

c9 = len(errors)
try:
    jsonschema.Draft7Validator.check_schema(sch)
except jsonschema.SchemaError as e:
    err("schema", f"not valid Draft-07: {e.message}")
if open(BS.OUT).read() != json.dumps(BS.build(), indent=2, ensure_ascii=False) + "\n":
    err("schema", "pagespec.schema.json is out of date versus sections/*.json; run schema/build_schema.py")
repo = SV.load_repo()
ex_files = ["schema/example.pagespec.json"] + sorted(os.path.relpath(f, DR) for f in glob.glob(os.path.join(DR, "schema", "examples", "*.json")))
covered = set()
for rel in ex_files:
    doc = jload(rel)
    covered.add(doc["template"])
    for sev, rule, msg in SV.validate_pagespec(doc, repo):
        if sev == "error":
            err("example", f"{rel}: {rule}: {msg}")
for t in templates:
    if t not in covered:
        err("example", f"template {t} has no example PageSpec")
_gen_cov = {jload(rel_)["template"] for rel_ in ex_files if jload(rel_).get("mode") == "generated"}
for t in templates:
    if t not in _gen_cov:
        err("example", f"template {t} has no generated-mode example PageSpec (fictional brand, original copy, reserved URLs)")
for rel_ in ex_files:
    _d = jload(rel_)
    if _d.get("mode") not in ("reference", "generated"):
        err("example", f"{rel_}: mode must be 'reference' or 'generated'")
    if rel_.rsplit("/", 1)[-1].startswith("generated.") != (_d.get("mode") == "generated"):
        err("example", f"{rel_}: file name prefix 'generated.' and mode {_d.get('mode')!r} disagree")
print(f"9) Schema: Draft-07 valid, up to date, {len(ex_files)} example PageSpecs ({len(covered)}/{len(templates)} templates), {len(errors) - c9} errors")

# 10 citations --------------------------------------------------------------
mv = jload("extraction/measured-values.json")
cites = mv["citations"]
used_ids = set()
def collect_cites(k, v, path):
    if k in ("cite", "measuredFrom", "citation"):
        for s in ([v] if isinstance(v, str) else v if isinstance(v, list) else []):
            if isinstance(s, str):
                used_ids.add((s, path))
for rel, j in parsed.items():
    if rel.startswith("extraction/") or rel.startswith("schema/pagespec"):
        continue
    def f(k, v, path, rel=rel):
        if k in ("cite", "measuredFrom", "citation"):
            for s in ([v] if isinstance(v, str) else v if isinstance(v, list) else []):
                if isinstance(s, str):
                    used_ids.add((s, rel))
    walk(j, f)
c10 = len(errors)
for cid, rel in sorted(used_ids):
    if cid not in cites:
        err("citation", f"{rel}: cite id {cid!r} not defined in extraction/measured-values.json")
if HAVE_SRC:
    nchk = 0
    for cid, c in cites.items():
        p = os.path.join(PROJECT, c["file"])
        if not os.path.exists(p):
            err("citation", f"{cid}: {c['file']} does not exist")
            continue
        lines = open(p, errors="replace").read().split("\n")
        a, _, b = c["lines"].partition("-")
        a = int(a)
        b = int(b) if b else a
        if a < 1 or b > len(lines) or a > b:
            err("citation", f"{cid}: range {c['lines']} outside {c['file']} ({len(lines)} lines)")
            continue
        seg = "\n".join(lines[a - 1:b])
        for q in c["mustContain"]:
            if q not in seg:
                err("citation", f"{cid}: {c['file']}:{c['lines']} does not contain {q!r} (in-range but wrong)")
        nchk += 1
    import hashlib
    drift = [fn for fn, h in mv["sourceSnapshot"]["files"].items()
             if os.path.exists(os.path.join(PROJECT, fn)) and hashlib.sha256(open(os.path.join(PROJECT, fn), "rb").read()).hexdigest()[:16] != h]
    if drift:
        warn("source-drift", f"{len(drift)} cited source file(s) changed since the snapshot (citations still valid): {', '.join(drift)}")
    print(f"10) Citations: {len(cites)} defined, {nchk} range+content verified, {len(used_ids)} references, {len(errors) - c10} errors")
else:
    warn("citation", "source project not present beside design-repo/: citation range/content checks SKIPPED (standalone copy)")
    print(f"10) Citations: {len(cites)} defined, {len(used_ids)} references resolve; range/content checks SKIPPED (no sibling source); {len(errors) - c10} errors")
c10b = len(errors)
for tid, j in sorted(sec_by_type.items()):
    src_ = j["source"]
    cc = cites.get(src_["citation"])
    if cc is None:
        err("source-trace", f"{tid}: source.citation {src_['citation']!r} is not defined in extraction/measured-values.json")
        continue
    if cc["file"] != src_["file"]:
        err("source-trace", f"{tid}: source.file {src_['file']} != citation {src_['citation']} file {cc['file']}")
    if HAVE_SRC and os.path.exists(os.path.join(PROJECT, src_["file"])):
        _l = open(os.path.join(PROJECT, src_["file"]), errors="replace").read().split("\n")
        _a, _, _b = cc["lines"].partition("-")
        _seg = "\n".join(_l[int(_a) - 1:int(_b or _a)])
        if "<" + src_["tag"] not in _seg:
            err("source-trace", f"{tid}: source.tag <{src_['tag']}> not found at {src_['file']}:{cc['lines']} (provenance does not trace to the DOM element)")
        _om = re.match(r"^src\.[A-Za-z0-9]+\.[a-z][a-z0-9]*\.([0-9]+)$", src_["id"])
        if _om:
            _end = int(_b or _a)
            _n = sum(len(re.findall(r"<" + src_["tag"] + r"\b", ln)) for ln in _l[:_end])
            if _n != int(_om.group(1)):
                err("source-trace", f"{tid}: source.id ordinal .{_om.group(1)} but {src_['file']} has {_n} <{src_['tag']} openings up to line {_end}")
    elif HAVE_SRC:
        err("source-trace", f"{tid}: source.file {src_['file']} does not exist")
print(f"10a) Source traceability: {len(sec_by_type)} section source ids trace to a cited element; {len(errors) - c10b} errors")

# 10b whole-page-wrapper gate ------------------------------------------------
import wrapper_gate as WG  # noqa: E402

_cat = {t: j["category"] for t, j in sec_by_type.items()}
_ge, _gw = WG.evaluate(mv.get("sectionHeights"), _cat, templates)
for e_ in _ge:
    err("wrapper-height", e_)
for w_ in _gw:
    warn("wrapper-height", w_)
for _tid, _rec in (mv.get("sectionHeights") or {}).get("pages", {}).items():
    for _s, _m in _rec.get("sections", {}).items():
        if _s in sec_by_type and _m.get("selector") != sec_by_type[_s]["source"]["domSelector"]:
            err("wrapper-height", f"{_tid}/{_s}: measured selector {_m.get('selector')!r} != contract source.domSelector {sec_by_type[_s]['source']['domSelector']!r}")
_nh = sum(1 for r_ in (mv.get("sectionHeights") or {}).get("pages", {}).values() for m_ in r_.get("sections", {}).values() if m_.get("heightPx") is not None)
print(f"10b) Wrapper gate: {_nh} measured section heights at {(mv.get('sectionHeights') or {}).get('viewport', {}).get('width')}px (hero warn >{WG.WARN_PX}px, fail >{WG.FAIL_PX}px unless reviewed-whitelisted; majority >{WG.MAJORITY:.0%}); {len(_ge)} errors, {len(_gw)} warnings")

unused = sorted(set(cites) - {c for c, _ in used_ids})
if unused:
    warn("citation", f"{len(unused)} citation ids defined but not referenced: {unused[:6]}")

# 13 typography roles vs the clone -------------------------------------------
# Every token typography role must equal what the clone actually renders (recorded by extraction/measure_type_probes.mjs at 1440/768/390).
tc = mv.get("typographyChecks")
c13 = len(errors)
probes = jload("extraction/type_probes.json")["probes"]
roles_tree = tree["typography"]


def _px(v, size=None):
    v = str(v)
    if v.endswith("ms"):
        return float(v[:-2])
    if v.endswith("px"):
        return float(v[:-2])
    if v.endswith("em") and size is not None:
        return float(v[:-2]) * size
    return float(v)


def resolve_role(name, width):
    r = dict(roles_tree[name])
    for bp in sorted((k for k in r.get("responsive", {}) if int(k) <= width), key=int):
        r.update(r["responsive"][bp])
    g = lambda k: TL.resolve_value(tree, TL.lookup(tree, TL.REF.fullmatch(r[k]).group(1))) if isinstance(r[k], str) and TL.REF.fullmatch(r[k]) else r[k]
    fam, wt, sz, lh, ls = g("family"), g("weight"), g("size"), g("lineHeight"), g("letterSpacing")
    size = _px(sz)
    return {"fontFamily": fam[0], "fontWeight": wt, "fontSize": size, "lineHeight": (_px(lh) if isinstance(lh, str) else lh * size), "letterSpacing": (0.0 if str(ls) in ("0em", "normal") else _px(ls, size))}


if not tc:
    err("typography", "measured-values.json has no typographyChecks (run extraction/measure_type_probes.mjs --write)")
else:
    probe_ids = {p_["id"] for p_ in probes}
    if set(tc["checks"]) != probe_ids:
        err("typography", f"typographyChecks ids differ from type_probes.json: missing {sorted(probe_ids - set(tc['checks']))}, extra {sorted(set(tc['checks']) - probe_ids)}")
    covered_roles = {p_["role"] for p_ in probes}
    for r_ in sorted(set(roles_tree) - covered_roles):
        err("typography", f"typography role {r_} has no probe in extraction/type_probes.json")
    nchk13 = 0
    for pid, ch in tc["checks"].items():
        if ch["role"] not in roles_tree:
            err("typography", f"{pid}: role {ch['role']} does not exist")
            continue
        pr = next((p_ for p_ in probes if p_["id"] == pid), None)
        dev = (pr or {}).get("cloneDeviation")
        for wd in (pr.get("viewports") or tc["viewports"]) if pr else []:
            m_ = ch["measured"].get(str(wd))
            if not m_:
                err("typography", f"{pid}@{wd}: no measurement recorded (selector {ch['selector']!r} matched nothing)")
                continue
            e_ = resolve_role(ch["role"], wd)
            lh_m = None if m_["lineHeight"] == "normal" else float(m_["lineHeight"][:-2])
            ls_m = 0.0 if m_["letterSpacing"] == "normal" else float(m_["letterSpacing"][:-2])
            bad = {}
            if m_["fontFamily"] != e_["fontFamily"]: bad["fontFamily"] = f"{m_['fontFamily']} != {e_['fontFamily']}"
            if m_["fontWeight"] != e_["fontWeight"]: bad["fontWeight"] = f"{m_['fontWeight']} != {e_['fontWeight']}"
            if abs(float(m_["fontSize"][:-2]) - e_["fontSize"]) > 0.01: bad["fontSize"] = f"{m_['fontSize']} != {e_['fontSize']}px"
            if lh_m is None or abs(lh_m - e_["lineHeight"]) > 0.2: bad["lineHeight"] = f"{m_['lineHeight']} != {e_['lineHeight']:.2f}px"
            if abs(ls_m - e_["letterSpacing"]) > 0.06: bad["letterSpacing"] = f"{m_['letterSpacing']} != {e_['letterSpacing']:.3f}px"
            if dev and wd in dev["viewports"]:
                want = dev["measured"]
                if set(bad) != set(want) or any(m_[k] != v for k, v in want.items()):
                    err("typography", f"pinned clone deviation of {pid} at {wd}px is stale: clone renders {({k: m_[k] for k in set(bad) | set(want)})}, the note pins {want} (remove or update cloneDeviation)")
            elif bad:
                err("typography", f"role {ch['role']} ({pid}) at {wd}px differs from the clone: " + "; ".join(f"{k} {v}" for k, v in bad.items()))
            nchk13 += 1
    print(f"13) Typography: {len(roles_tree)} roles, {len(probes)} probes x viewports = {nchk13} computed-style comparisons against the clone; {len(errors) - c13} errors")

# 14 content budgets vs the real copy ----------------------------------------
cb = mv.get("contentBudgets", {}).get("entries", [])
c14 = len(errors)


def budget_of(model, path, kind):
    node = model
    for tok in path.split("."):
        if tok == "[]":
            node = node["items"]
        elif tok.startswith("oneOf"):
            node = node["oneOf"][int(tok[5:])]
        elif tok.startswith("kind:"):
            node = next(b for b in node["oneOf"] if b["properties"].get("kind", {}).get("const") == tok[5:])
        else:
            node = node["properties"][tok]
    if kind == "items" and "items" in node and "maxItems" not in node and node.get("type") == "array":
        return None
    return node.get("maxWords") if kind == "words" else node.get("maxItems")


if not cb:
    err("content-budget", "measured-values.json has no contentBudgets (run extraction/measure_content_budgets.mjs --write)")
for e_ in cb:
    tj = sec_by_type.get(e_["type"])
    if tj is None:
        err("content-budget", f"{e_['id']}: unknown section {e_['type']}")
        continue
    try:
        bud = budget_of(tj["contentModel"], e_["path"], e_["kind"])
    except (KeyError, StopIteration, IndexError, TypeError):
        err("content-budget", f"{e_['id']}: path does not resolve in the {e_['type']} contract")
        continue
    if bud is None:
        err("content-budget", f"{e_['id']}: the contract has no {'maxWords' if e_['kind'] == 'words' else 'maxItems'} for this field")
    elif bud < (e_["p95"] if e_.get("userGenerated") else e_["observed"]):
        err("content-budget", f"{e_['id']}: contract budget {bud} is below the real source {'95th percentile ' + str(e_['p95']) if e_.get('userGenerated') else 'maximum ' + str(e_['observed'])} ({e_['where']})")
    elif bud < e_["observed"] and not e_.get("userGenerated"):
        err("content-budget", f"{e_['id']}: budget {bud} < observed {e_['observed']}")
print(f"14) Content budgets: {len(cb)} real-copy maxima checked against the section contracts; {len(errors) - c14} errors")

# 15 source protection lists (generated mode) ---------------------------------
sp = jload("assets/source-protected.json")
pa = jload("assets/protected-assets.json")
c15 = len(errors)
if sp["counts"] != {"hosts": len(sp["hosts"]), "phrases": len(sp["phrases"]), "people": len(sp["entities"]["people"]), "companies": len(sp["entities"]["companies"])}:
    err("source-protected", "source-protected.json counts do not match its lists")
if pa["counts"]["files"] != len(pa["files"]) or pa["counts"]["bytes"] != sum(f_["bytes"] for f_ in pa["files"]):
    err("source-protected", "protected-assets.json counts do not match its files")
for need in ("glaze.app", "raycast.com"):
    if need not in sp["hosts"]:
        err("source-protected", f"host {need} is missing from source-protected.json: generated pages would not be checked against it")
for need in ("Glaze", "Raycast"):
    if need not in sp["entities"]["companies"]:
        err("source-protected", f"company {need} is missing from source-protected.json entities")
if len(sp["phrases"]) < 100 or len(pa["files"]) < 100:
    err("source-protected", "protection lists are suspiciously small")
if HAVE_SRC:
    import glob as _g
    blob = "\n".join(open(f_, errors="ignore").read() for f_ in _g.glob(os.path.join(PROJECT, "src", "**", "*"), recursive=True) if os.path.isfile(f_) and f_.endswith((".js", ".jsx", ".css", ".json")))
    nrm = lambda t: re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()
    nblob = nrm(blob.replace("\\n", " "))
    miss = [p_ for p_ in sp["phrases"] if nrm(p_) not in nblob]
    if miss:
        err("source-protected", f"{len(miss)} recorded phrase(s) do not occur in the source: {miss[:3]} (derived list is stale or invented)")
    hmiss = [h_ for h_ in sp["hosts"] if h_ not in blob.lower()]
    if hmiss:
        err("source-protected", f"{len(hmiss)} recorded host(s) do not occur in the source: {hmiss[:3]}")
    pubdir = os.path.join(PROJECT, "public")
    if os.path.isdir(pubdir):
        real = sorted(os.path.relpath(os.path.join(rt, f_), pubdir).replace(os.sep, "/") for rt, _, fs_ in os.walk(pubdir) for f_ in fs_ if f_ != ".DS_Store")
        if sorted(real) != sorted(f_["path"] for f_ in pa["files"]):
            err("source-protected", "protected-assets.json file list differs from the source project's public/ tree")
    _am = os.path.join(PROJECT, "ASSET_MANIFEST.md")
    if os.path.exists(_am):
        _m = re.search(r"public/ total: (\d+) files, ([\d,]+) bytes", open(_am).read())
        if not _m or int(_m.group(1)) != pa["counts"]["files"] or int(_m.group(2).replace(",", "")) != pa["counts"]["bytes"]:
            err("source-protected", f"ASSET_MANIFEST.md totals {_m.groups() if _m else None} differ from assets/protected-assets.json {pa['counts']}")
    print(f"15) Source protection: {len(sp['hosts'])} hosts, {len(sp['phrases'])} phrases, {len(sp['entities']['people'])} people, {len(sp['entities']['companies'])} companies, {len(pa['files'])} asset files (phrases/hosts/files traced to the source); {len(errors) - c15} errors")
else:
    warn("source-protected", "source project not present beside design-repo/: protection lists not re-traced to the source")
    print(f"15) Source protection: {len(sp['hosts'])} hosts, {len(sp['phrases'])} phrases, {len(pa['files'])} asset files (source trace SKIPPED); {len(errors) - c15} errors")

# 16 route table ------------------------------------------------------------------
rt = mv.get("routeTable")
c16 = len(errors)
if not rt:
    err("route-table", "measured-values.json has no routeTable (run extraction/enumerate_routes.mjs --write)")
else:
    owners = {}
    for tid_, t_ in templates.items():
        for r_ in t_["routes"]:
            owners.setdefault(r_, []).append(tid_)
    for r_, o_ in owners.items():
        if len(o_) > 1:
            err("route-coverage", f"route {r_} is owned by {o_}")
    expected = {}
    for r_ in rt["routes"]:
        pth = r_["path"]
        if pth == "*":
            expected["/*"] = 1
        elif ":" in pth:
            pat = rt["patterns"][pth]
            if pth in owners:  # a pattern template (app detail, blog post): one pattern route standing for `count` real routes
                expected[pth] = pat["count"]
            else:
                for v_ in pat["all"]:
                    expected[pth.split(":")[0] + v_] = 1
        else:
            expected[pth] = 1
    for r_ in expected:
        if r_ not in owners:
            err("route-coverage", f"route {r_} of the clone's route table is not mapped to any template")
    for r_ in owners:
        if r_ not in expected:
            err("route-coverage", f"template route {r_} is not in the clone's route table (phantom route)")
    for t_ in templates.values():
        if t_["routeKind"] == "pattern" and t_["routeParams"]["slug"]["count"] != rt["patterns"][t_["routes"][0]]["count"]:
            err("route-coverage", f"{t_['id']}: routeParams.slug.count differs from the route table count for {t_['routes'][0]}")
        if t_["routeKind"] == "pattern" and t_["routes"][0] == "/blog/:slug" and sorted(t_["routeParams"]["slug"]["known"]) != sorted("/blog/" + v_ for v_ in rt["patterns"]["/blog/:slug"]["all"]):
            err("route-coverage", f"{t_['id']}: known post routes differ from the route table")
    total_expanded = sum((t_["routeParams"]["slug"]["count"] if t_["routeKind"] == "pattern" else len(t_["routes"])) for t_ in templates.values())
    if total_expanded != rt["counts"]["totalWithCatchAll"]:
        err("route-coverage", f"templates cover {total_expanded} routes; the route table has {rt['counts']['totalWithCatchAll']}")
    if HAVE_SRC and os.path.exists(os.path.join(PROJECT, "ia.json")):
        _ia = json.load(open(os.path.join(PROJECT, "ia.json")))
        if _ia["meta"]["totalRoutes"] != total_expanded:
            err("route-coverage", f"ia.json meta.totalRoutes {_ia['meta']['totalRoutes']} != {total_expanded} routes covered by templates")
    if HAVE_SRC:
        import glob as _g2
        declared = set()
        for f_ in _g2.glob(os.path.join(PROJECT, "src", "route-modules", "*.js")):
            declared |= set(re.findall(r"path:\s*'([^']+)'", open(f_).read())) | set(re.findall(r"legal\(\s*'([^']+)'", open(f_).read()))
        recorded = {r_["path"] for r_ in rt["routes"] if r_["module"] != "src/route-modules/personas.js" and r_["path"] != "*"}
        if not declared <= recorded:
            err("route-table", f"routes declared in src/route-modules but missing from the recorded table: {sorted(declared - recorded)}")
    print(f"16) Route table: {len(rt['routes'])} declarations -> {total_expanded} routes + catch-all, every route mapped exactly once to {len(templates)} templates; {len(errors) - c16} errors")

# 17 spacing, sizes and radii vs the clone ----------------------------------------
lc = mv.get("layoutChecks")
lspec = jload("extraction/layout_probes.json")
c17 = len(errors)
if not lc:
    err("layout", "measured-values.json has no layoutChecks (run extraction/measure_layout_probes.mjs --write)")
else:
    if set(lc["checks"]) != {p_["id"] for p_ in lspec["probes"]}:
        err("layout", "layoutChecks ids differ from layout_probes.json")
    nl = 0

    def tok_px(ref):
        node = TL.lookup(tree, ref)
        v = TL.resolve_value(tree, node)
        if isinstance(v, str) and "{" in v:  # a layout token holding a nested expression is not a plain length
            raise ValueError(f"{ref} is not a plain length: {v}")
        return _px(v)

    def eval_expr(expr, vw):
        e = re.sub(r"\{([^{}]+)\}", lambda m_: repr(tok_px(m_.group(1))), expr)
        return eval(e, {"__builtins__": {}}, {"vw": float(vw), "min": min, "max": max})

    for p_ in lspec["probes"]:
        ch = lc["checks"].get(p_["id"])
        if not ch:
            continue
        for wd in p_["viewports"]:
            m_ = ch["measured"].get(str(wd))
            if not m_:
                err("layout", f"{p_['id']}@{wd}: no measurement recorded (selector {p_['selector']!r} matched nothing)")
                continue
            for prop, exp in p_["expect"].items():
                ex = exp.get(str(wd), exp.get("*")) if isinstance(exp, dict) else exp
                if ex is None:
                    continue
                try:
                    want = eval_expr(ex, wd)
                except (KeyError, ValueError, SyntaxError, NameError) as e_:
                    err("layout", f"{p_['id']}.{prop}: expression {ex!r} does not evaluate: {e_}")
                    continue
                got = m_[prop]
                if abs(got - want) > lspec["tolerancePx"]:
                    err("layout", f"{p_['id']}@{wd} {prop}: the clone renders {got:g}px but {ex} = {want:g}px")
                nl += 1
    _ov = lc.get("overflow", {})
    _want = {f"{r_}@{w_}" for r_ in lspec.get("overflowRoutes", []) for w_ in lspec.get("overflowViewports", [])}
    if set(_ov) != _want or not _want:
        err("layout", "layoutChecks.overflow does not cover overflowRoutes x overflowViewports of layout_probes.json")
    for k_, sw_ in _ov.items():
        if sw_ > int(k_.split("@")[1]):
            err("layout", f"{k_}: the document scrolls horizontally (scrollWidth {sw_}px > viewport)")
    print(f"17) Layout: {len(lspec['probes'])} probes, {nl} spacing/size/radius/motion comparisons against the clone (tokens evaluated, tolerance {lspec['tolerancePx']}px) and {len(_ov)} no-horizontal-overflow checks (routes x 1440/768/390); {len(errors) - c17} errors")

# 18 document heights vs the numbers the clone's specs recorded on the live site ----
sc = mv.get("specCrossCheck")
sh_spec = jload("extraction/spec_heights.json")
c18 = len(errors)
if not sc:
    err("spec-crosscheck", "measured-values.json has no specCrossCheck (run extraction/measure_spec_crosscheck.mjs --write)")
else:
    if [(e_["route"], e_["viewport"], e_["specPx"]) for e_ in sc["entries"]] != [(e_["route"], e_["viewport"], e_["specPx"]) for e_ in sh_spec["entries"]]:
        err("spec-crosscheck", "specCrossCheck entries differ from extraction/spec_heights.json")
    n_out = 0
    for e_ in sc["entries"]:
        if e_["deltaPx"] != e_["clonePx"] - e_["specPx"]:
            err("spec-crosscheck", f"{e_['route']}@{e_['viewport']}: deltaPx is not clonePx - specPx")
        if e_["specCite"] not in cites:
            err("spec-crosscheck", f"{e_['route']}@{e_['viewport']}: unknown citation {e_['specCite']}")
        pct = abs(e_["clonePx"] - e_["specPx"]) / e_["specPx"] * 100
        if pct > sc["tolerancePct"]:
            n_out += 1
            if len(str(e_.get("explained", ""))) < 30:
                err("spec-crosscheck", f"{e_['route']}@{e_['viewport']}: the clone renders {e_['clonePx']}px, the spec recorded {e_['specPx']}px on the live site ({pct:.1f}% apart) and the entry has no explanation")
            elif pct > 10:
                err("spec-crosscheck", f"{e_['route']}@{e_['viewport']}: {pct:.1f}% apart is too far to be explained by placeholder text")
    print(f"18) Spec cross-check: {len(sc['entries'])} document heights recorded on the live site by the clone's specs vs the clone today: {len(sc['entries']) - n_out} within {sc['tolerancePct']}%, {n_out} explained (placeholder prose); {len(errors) - c18} errors (not a visual parity measurement)")

# 11 manifest ---------------------------------------------------------------
man = jload("registry.manifest.json")
c11 = len(errors)
counts = {
    "primitives": len(prims), "components": len(comps), "sections": len(secs), "templates": len(templates),
    "tokens": cat["counts"]["tokens"], "typographyRoles": cat["counts"]["typographyRoles"], "motionRecipes": cat["counts"]["motionRecipes"],
    "assetRoles": len(assets["roles"]), "graphRules": len(graph["rules"]), "examplePageSpecs": len(ex_files),
    "routeEntries": len(route_owner), "citations": len(cites),
    "measuredSectionHeights": _nh,
    "routesCovered": (mv.get("routeTable") or {}).get("counts", {}).get("totalWithCatchAll"),
    "generatedExamplePageSpecs": sum(1 for rel_ in ex_files if jload(rel_).get("mode") == "generated"),
    "typographyProbes": len(probes), "layoutProbes": len(lspec["probes"]), "specCrossChecks": len((sc or {}).get("entries", [])), "contentBudgets": len(cb),
    "protectedHosts": len(sp["hosts"]), "protectedPhrases": len(sp["phrases"]), "protectedAssetFiles": len(pa["files"]),
}
if man.get("counts") != counts:
    err("manifest-counts", f"counts block {man.get('counts')} != recomputed {counts}")
if man["pageSpecVersion"] != sch.get("version"):
    err("version-parity", f"manifest pageSpecVersion {man['pageSpecVersion']} != pagespec.schema.json version {sch.get('version')}")
_cl = open(os.path.join(DR, "CHANGELOG.md")).read()
_top = re.search(r"^## (\d+\.\d+\.\d+)", _cl, re.M)
if not _top or _top.group(1) != man["repositoryVersion"]:
    err("version-parity", f"manifest repositoryVersion {man['repositoryVersion']} != newest CHANGELOG heading {_top.group(1) if _top else None}")
if man["allowlistVersion"] != allow["version"]:
    err("version-parity", f"manifest allowlistVersion {man['allowlistVersion']} != allowlist version {allow['version']}")
if man["tokenCatalogVersion"] != cat["version"]:
    err("version-parity", "manifest tokenCatalogVersion != catalog version")
if man["tokenPolicyVersion"] != policy["version"]:
    err("version-parity", "manifest tokenPolicyVersion != token-policy version")
for grp, lst in man["entryPoints"].items():
    for ep in ([lst] if isinstance(lst, str) else lst):
        if ep.startswith("..") or os.path.isabs(ep):
            err("entrypoint", f"{grp}: {ep} points outside design-repo/")
        elif not os.path.exists(os.path.join(DR, ep)):
            err("entrypoint", f"{grp}: {ep} does not exist")
for need in ("repositoryId", "defaultTheme", "pageSpecVersion", "schemaValidatedThemes", "versionFieldNote", "status", "productionApproved"):
    if need not in man:
        err("manifest", f"missing {need}")
if man.get("productionApproved") is not False or man.get("status") != "design-review-pending":
    err("manifest", "status must be design-review-pending and productionApproved false")
# README counts marker
readme = open(os.path.join(DR, "README.md")).read()
m = re.search(r"<!-- counts: (\{.*?\}) -->", readme)
if not m:
    err("readme-counts", "README.md lacks the <!-- counts: {...} --> marker")
elif json.loads(m.group(1)) != counts:
    err("readme-counts", f"README counts marker {m.group(1)} != recomputed {counts}")
for ref in ("tests/adversarial_test.py", "extraction/prove_drift.py", "extraction/verify_all.py"):
    pth = "schema/" + ref if ref.startswith("tests/") else ref
    if not os.path.exists(os.path.join(DR, pth)):
        err("docs", f"{pth} is referenced by docs but does not exist")
# no machine paths anywhere
MACHINE_PATH = "/Us" + "ers/"
bad = []
for root, dirs, fs in os.walk(DR):
    dirs[:] = [d for d in dirs if d not in ("__pycache__",)]
    for fn in fs:
        if fn.endswith((".pyc",)) or fn == ".DS_Store":
            continue
        p = os.path.join(root, fn)
        try:
            txt = open(p, errors="ignore").read()
        except OSError:
            continue
        if MACHINE_PATH in txt:
            bad.append(os.path.relpath(p, DR))
for b in bad:
    err("abs-path", f"{b} contains a machine path")
print(f"11) Manifest: counts recomputed, versions matched, entryPoints inside repo, no machine paths; {len(errors) - c11} errors")

# 12 ------------------------------------------------------------------------
c12 = len(errors)
if "--skip-adversarial" in sys.argv:
    print("12) Adversarial suite: SKIPPED by --skip-adversarial (use only for drift injection runs)")
    r = None
else:
  r = subprocess.run([sys.executable, os.path.join(DR, "schema", "tests", "adversarial_test.py")], capture_output=True, text=True)
if r is not None:
    tail = [l for l in r.stdout.strip().split("\n") if l][-1:] or [""]
    if r.returncode != 0:
        err("adversarial", "adversarial suite failed:\n" + r.stdout[-1500:] + r.stderr[-500:])
    print(f"12) Adversarial suite: {'PASS' if r.returncode == 0 else 'FAIL'} ({tail[0]})")

print("\n" + "=" * 70)
for w in warnings:
    print("WARN ", w)
if errors:
    print(f"{len(errors)} ERROR(S):")
    for e in errors:
        print(" -", e)
    print("VERIFICATION: FAIL")
    sys.exit(1)
print("VERIFICATION: ALL CHECKS PASS")
