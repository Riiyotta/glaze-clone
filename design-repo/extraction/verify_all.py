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
PINNED = {"brand.wordmark": "must-reuse-exact", "brand.app-icon": "must-reuse-exact", "particle.app-icon": "must-reuse-exact",
          "badge.award": "must-reuse-exact", "video.hero-loop": "must-reuse-exact", "app.icon": "may-generate-new",
          "avatar.person": "may-generate-new", "screenshot.feature": "must-not-fabricate", "logo.partner": "must-not-fabricate",
          "embed.video": "must-not-reuse-live-endpoint"}
c7 = len(errors)
for role, spec in assets["roles"].items():
    if spec["policy"] not in assets["policyEnum"]:
        err("asset-role", f"{role}: policy {spec['policy']!r} not in policyEnum")
    if role not in PINNED:
        err("asset-role", f"{role}: no pinned policy in verify_all.PINNED")
    elif spec["policy"] != PINNED[role]:
        err("asset-role", f"{role}: policy {spec['policy']!r} differs from pinned {PINNED[role]!r} (compliance-critical)")
    if not spec.get("guidance"):
        err("asset-role", f"{role}: missing guidance")
    for u in spec["usedBy"]:
        if u not in sec_by_type:
            err("asset-role", f"{role}: usedBy unknown section {u}")
for role in PINNED:
    if role not in assets["roles"]:
        err("asset-role", f"pinned role {role} missing from asset-roles.json")
used = {}
def collect_roles(tid):
    def f(k, v, path):
        if (k == "assetRole" or k.endswith("AssetRole")) and isinstance(v, dict) and "const" in v:
            used.setdefault(v["const"], set()).add(tid)
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
for role, spec in assets["roles"].items():
    for u in spec["usedBy"]:
        if role not in used and role not in ("particle.app-icon",) and u in sec_by_type:
            pass
for role, spec_ in assets["roles"].items():
    if role not in used and "derivedFrom" not in spec_:
        err("asset-role", f"role {role} is not wired into any section contract (schema)")
print(f"7) Asset roles: {len(assets['roles'])} roles pinned, {len(used)} wired into schema; {len(errors) - c7} errors")

# 8 -------------------------------------------------------------------------
c8 = len(errors)
adj = {}
route_owner = {}
for tid, t in templates.items():
    types = [n["section"] for n in t["nodes"]]
    for n in t["nodes"]:
        if set(n) != {"section", "required", "repeatable"}:
            err("template", f"{tid}: node {n} must be exactly section/required/repeatable")
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
        elif t["routes"] != ia_t[tid]["routes"]:
            err("ia", f"{tid} routes {t['routes']} differ from ia.json {ia_t[tid]['routes']}")
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

# 11 manifest ---------------------------------------------------------------
man = jload("registry.manifest.json")
c11 = len(errors)
counts = {
    "primitives": len(prims), "components": len(comps), "sections": len(secs), "templates": len(templates),
    "tokens": cat["counts"]["tokens"], "typographyRoles": cat["counts"]["typographyRoles"], "motionRecipes": cat["counts"]["motionRecipes"],
    "assetRoles": len(assets["roles"]), "graphRules": len(graph["rules"]), "examplePageSpecs": len(ex_files),
    "routeEntries": len(route_owner), "citations": len(cites),
    "measuredSectionHeights": _nh,
}
if man.get("counts") != counts:
    err("manifest-counts", f"counts block {man.get('counts')} != recomputed {counts}")
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
