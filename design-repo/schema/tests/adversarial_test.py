#!/usr/bin/env python3
"""Adversarial suite: every mutation must be REJECTED, every control must PASS.

Run: python3 schema/tests/adversarial_test.py   (exit 0 only if all behave)
Mutations start from the real example PageSpecs and break exactly one rule, so a
rejection proves that rule (and not some unrelated error) is what fires: each case
names the rule/layer that must appear among the findings.

Groups: schema and structure (landing, persona, 404), the eleven newer page families, retrieval pins,
the reference | generated MODE (brand and logo, verbatim copy, entities, URLs, proprietary assets, protected values),
section contracts, the wrapper gate, and controls (every example, both modes, plus the allowed look-alikes of each leak).
"""
import copy
import glob
import json
import os
import re
import sys

DR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(DR, "schema"))
import semantic_validate as SV  # noqa: E402
sys.path.insert(0, os.path.join(DR, "extraction"))
import wrapper_gate as WG  # noqa: E402

REPO = SV.load_repo()
J = lambda rel: json.load(open(os.path.join(DR, rel)))
EX = {os.path.basename(f).replace(".pagespec.json", ""): json.load(open(f)) for f in sorted(glob.glob(os.path.join(DR, "schema", "examples", "*.json")))}
LANDING = J("schema/example.pagespec.json")
PERSONA, NOTFOUND = EX["persona"], EX["not-found"]
G = {k[len("generated."):]: v for k, v in EX.items() if k.startswith("generated.")}   # generated-mode examples by family
R = {k: v for k, v in EX.items() if not k.startswith("generated.")}                   # reference-mode examples


def node(doc, typ, i=0):
    return [n for n in doc["nodes"] if n["type"] == typ][i]


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


def setp(typ, path, value, i=0):
    def f(d):
        t = node(d, typ, i)
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
W = lambda n: " ".join(["w"] * n)

# (name, base, mutation, rule that must be among the findings)
MUTATIONS = [
    # ---- schema layer
    ("unknown template enum", LANDING, lambda d: d.__setitem__("template", "template.ghost"), "SCHEMA"),
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
    # ---- structural (landing, persona, 404)
    ("duplicate one-per-page section (faq)", LANDING, dup(FAQ), "ONE_PER_PAGE"),
    ("duplicate navbar", LANDING, lambda d: d["nodes"].insert(1, copy.deepcopy(node(d, NAV)) | {"id": "nav-2"}), "NAV_FIRST"),
    ("mandatory section removed (footer)", LANDING, drop(FOOT), "TEMPLATE_NODES"),
    ("mandatory section removed (hero)", LANDING, drop(HERO), "TEMPLATE_NODES"),
    ("mandatory section removed (navbar)", NOTFOUND, drop(NAV), "NAV_FIRST"),
    ("fixed-position section reordered (footer before cta)", LANDING, swap(CTA, FOOT), "TEMPLATE_ORDER"),
    ("navbar not first", LANDING, swap(NAV, HERO), "NAV_FIRST"),
    ("overlay not last", LANDING, swap(FOOT, OVER), "OVERLAY_LAST"),
    ("hero in the 404 template", NOTFOUND, lambda d: d["nodes"].insert(1, copy.deepcopy(node(LANDING, HERO)) | {"id": "hero-x"}), "NOT_FOUND_NO_HERO"),
    ("store section in the 404 template", NOTFOUND, lambda d: d["nodes"].insert(1, copy.deepcopy(node(G["store-category"], "store.app-grid")) | {"id": "grid-x"}), "NOT_FOUND_NO_HERO"),
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
    # ---- runtime maxWords
    ("hero headline over budget", LANDING, setp(HERO, ["content", "headline"], LONG), "MAX_WORDS"),
    ("faq answer over budget (100 words since 2.0.0)", LANDING, lambda d: node(d, FAQ)["content"]["items"][0].__setitem__("answer", W(101)), "MAX_WORDS"),
    ("nested app name over budget", LANDING, lambda d: node(d, TABS)["content"]["tabs"][0]["apps"][0].__setitem__("name", "one two three four five"), "MAX_WORDS"),
    ("store tagline over budget", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0].__setitem__("tagline", W(15)), "MAX_WORDS"),
    ("legal paragraph over budget", G["legal"], lambda d: node(d, "content.legal-body")["content"]["blocks"][0].__setitem__("text", W(451)), "MAX_WORDS"),
    ("post card excerpt over budget", G["blog-index"], lambda d: node(d, "content.post-card")["content"].__setitem__("excerpt", W(31)), "MAX_WORDS"),
    # ---- assets
    ("role not allowed in this section (usedBy)", NOTFOUND, lambda d: node(d, NF)["content"]["icon"].__setitem__("assetRole", "particle.app-icon"), "SCHEMA"),
    ("head title over budget (word count, not schema)", PERSONA, lambda d: d["head"].__setitem__("title", " ".join(["w"] * 19)), "MAX_WORDS"),
]
# ---- retrieval eligibility: a utility overlay flipped to eligible must be rejected (PageSpec layer)
MUTATIONS += [
    ("utility overlay node flipped to retrievalEligible:true", LANDING, setp(OVER, ["retrievalEligible"], True), "SCHEMA"),
    ("content section node claiming retrievalEligible:false", LANDING, setp(HERO, ["retrievalEligible"], False), "SCHEMA"),
    ("retrievalEligible as a string", LANDING, setp(HERO, ["retrievalEligible"], "yes"), "SCHEMA"),
    ("image lightbox flipped to retrievalEligible:true", R["blog-post"], setp("shell.image-lightbox", ["retrievalEligible"], True), "SCHEMA"),
    ("app dialog flipped to retrievalEligible:true", G["landing"], setp("shell.app-dialog", ["retrievalEligible"], True), "SCHEMA"),
]
# ---- the eleven newer page families: structure
MUTATIONS += [
    ("pricing: two highlighted plans", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0].__setitem__("highlighted", True), "PLAN_RULES"),
    ("pricing: duplicate plan ids", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][2].__setitem__("id", "free"), "MAX_TABS_UNIQUE_IDS"),
    ("pricing: plan with a price and a caption", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][1].__setitem__("caption", "also a caption"), "SCHEMA"),
    ("pricing: plan with neither price nor caption", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0].pop("caption"), "SCHEMA"),
    ("pricing: four plans", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"].append(copy.deepcopy(node(d, "commerce.pricing-plans")["content"]["plans"][0]) | {"id": "extra"}), "SCHEMA"),
    ("pricing: navbar not marking Pricing", R["pricing"], setp(NAV, ["content", "activeLinkHref"], "/"), "NAV_ACTIVE_LINK"),
    ("pricing: cta not directly before the footer", R["pricing"], lambda d: d["nodes"].insert(len(d["nodes"]) - 1, copy.deepcopy(node(d, "support.faq")) | {"id": "faq-late"}), "CTA_BEFORE_FOOTER"),
    ("pricing: page title not directly after the navbar", R["pricing"], swap("hero.page-title", "commerce.pricing-plans"), "HERO_AFTER_NAV"),
    ("download: footer added to the download template", R["download"], lambda d: d["nodes"].append(copy.deepcopy(node(R["pricing"], FOOT))), "TEMPLATE_NODES"),
    ("download: route of another page", R["download"], lambda d: d.__setitem__("route", "/pricing"), "ROUTE"),
    ("legal: policy route with terms typography", R["legal"], setp("content.legal-body", ["content", "typography"], "terms"), "ROUTE_LEGAL_STYLE"),
    ("legal: awards terms route with policy typography", R["legal-awards-terms"], setp("content.legal-body", ["content", "typography"], "policy"), "ROUTE_LEGAL_STYLE"),
    ("legal: awards terms with a one-line title", R["legal-awards-terms"], lambda d: node(d, "content.legal-header")["content"].__setitem__("titleLines", ["One line"]), "ROUTE_LEGAL_STYLE"),
    ("legal: three title lines", R["legal"], lambda d: node(d, "content.legal-header")["content"].__setitem__("titleLines", ["a", "b", "c"]), "SCHEMA"),
    ("legal: header removed (whole-page body)", R["legal"], drop("content.legal-header"), "TEMPLATE_NODES"),
    ("legal: body before header", R["legal"], swap("content.legal-header", "content.legal-body"), "TEMPLATE_ORDER"),
    ("legal: unknown block kind", R["legal"], lambda d: node(d, "content.legal-body")["content"]["blocks"].append({"kind": "table", "text": "x"}), "SCHEMA"),
    ("blog index: 21 post cards", R["blog-index"], lambda d: d["nodes"].__setitem__(slice(2, 2), [copy.deepcopy(node(d, "content.post-card")) | {"id": f"card-x{i}"} for i in range(19)]), "REPEATABLE_MAX_COUNT"),
    ("blog index: post cards split by another section", R["blog-index"], lambda d: d["nodes"].insert(3, copy.deepcopy(node(d, "hero.page-header")) | {"id": "hdr-2"}), "TEMPLATE_ORDER"),
    ("blog index: navbar not marking Blog", R["blog-index"], setp(NAV, ["content", "activeLinkHref"], "/pricing"), "NAV_ACTIVE_LINK"),
    ("blog index: datetime not a date", R["blog-index"], setp("content.post-card", ["content", "datetime"], "yesterday"), "SCHEMA"),
    ("blog post: article body removed", R["blog-post"], drop("content.article-body"), "TEMPLATE_NODES"),
    ("blog post: compact cta after the footer", R["blog-post"], swap("cta.download-compact", FOOT), "CTA_BEFORE_FOOTER"),
    ("blog post: lightbox before the footer", R["blog-post"], swap("shell.image-lightbox", FOOT), "OVERLAY_LAST"),
    ("blog post: route outside /blog/:slug", R["blog-post"], lambda d: d.__setitem__("route", "/posts/example"), "ROUTE"),
    ("blog post: unknown prose block kind", R["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"].append({"kind": "video", "text": "x"}), "SCHEMA"),
    ("blog post: image block without dimensions", R["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"][-1].pop("width"), "SCHEMA"),
    ("blog post: paragraph over budget", R["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"][1].__setitem__("text", W(131)), "MAX_WORDS"),
    ("changelog: 61 release entries", R["changelog"], lambda d: d["nodes"].__setitem__(slice(2, 2), [copy.deepcopy(node(d, "content.release-entry")) | {"id": f"rel-x{i}"} for i in range(60)]), "REPEATABLE_MAX_COUNT"),
    ("changelog: navbar not marking Changelog", R["changelog"], setp(NAV, ["content", "activeLinkHref"], "/blog"), "NAV_ACTIVE_LINK"),
    ("changelog: release without a version", R["changelog"], lambda d: node(d, "content.release-entry")["content"].pop("version"), "SCHEMA"),
    ("awards: gold winner missing", R["awards"], lambda d: node(d, "showcase.award-winners")["content"]["winners"].pop("gold"), "SCHEMA"),
    ("awards: three prizes", R["awards"], lambda d: node(d, "content.award-prizes")["content"]["prizes"].pop(), "SCHEMA"),
    ("awards: six jurors", R["awards"], lambda d: node(d, "content.award-jury")["content"]["jurors"].extend(copy.deepcopy(node(d, "content.award-jury")["content"]["jurors"]) * 2), "SCHEMA"),
    ("awards: entries page beyond the page count", R["awards"], setp("showcase.award-entries", ["content", "page"], 9), "PAGINATION_BOUNDS"),
    ("awards: cta not directly before the footer", R["awards"], swap("content.award-criteria", "cta.download-icon"), "TEMPLATE_ORDER"),
    ("awards: dialog before the footer", R["awards"], swap("shell.app-dialog", FOOT), "OVERLAY_LAST"),
    ("store index: active chip is not 'all'", R["store-index"], setp("store.category-nav", ["content", "activeCategory"], "design"), "ROUTE_STORE_CATEGORY"),
    ("store category: active chip does not match the route", R["store-category"], setp("store.category-nav", ["content", "activeCategory"], "media"), "ROUTE_STORE_CATEGORY"),
    ("store category: chip value outside the closed set", R["store-category"], lambda d: node(d, "store.category-nav")["content"]["categories"][0].__setitem__("value", "ghost"), "SCHEMA"),
    ("store category: page beyond the page count", R["store-category"], setp("store.app-grid", ["content", "page"], 7), "PAGINATION_BOUNDS"),
    ("store category: shelves in the category template", R["store-category"], lambda d: d["nodes"].insert(4, copy.deepcopy(node(R["store-index"], "store.app-shelves"))), "TEMPLATE_NODES"),
    ("store index: duplicate shelf titles", R["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][1].__setitem__("title", node(d, "store.app-shelves")["content"]["shelves"][0]["title"]), "MAX_TABS_UNIQUE_IDS"),
    ("store index: carousel removed", R["store-index"], drop("store.featured-carousel"), "TEMPLATE_NODES"),
    ("app detail: header removed", R["app-detail"], drop("store.app-header"), "TEMPLATE_NODES"),
    ("app detail: three app lists", R["app-detail"], lambda d: d["nodes"].insert(len(d["nodes"]) - 1, copy.deepcopy(node(d, "store.app-list")) | {"id": "list-3"}), "REPEATABLE_MAX_COUNT"),
    ("app detail: route outside /app/:slug", R["app-detail"], lambda d: d.__setitem__("route", "/apps/example-app"), "ROUTE"),
    ("app detail: stats before the header", R["app-detail"], swap("store.app-header", "store.app-stats"), "TEMPLATE_ORDER"),
    ("app detail: award outside the closed set", R["app-detail"], setp("store.app-header", ["content", "award"], "platinum"), "SCHEMA"),
]

# ---- MODE: reference | generated
# `mode` itself
MUTATIONS += [
    ("mode missing", LANDING, lambda d: d.pop("mode"), "SCHEMA"),
    ("mode wrong case", LANDING, lambda d: d.__setitem__("mode", "Generated"), "SCHEMA"),
    ("mode outside the closed enum", LANDING, lambda d: d.__setitem__("mode", "draft"), "SCHEMA"),
    ("mode null", LANDING, lambda d: d.__setitem__("mode", None), "SCHEMA"),
    ("reference example flipped to generated (all source roles and copy now leak)", LANDING, lambda d: d.__setitem__("mode", "generated"), "GENERATED_MODE_REFERENCE_ASSET"),
    ("generated example flipped to reference (generation-safe-only roles)", G["landing"], lambda d: d.__setitem__("mode", "reference"), "REFERENCE_MODE_ROLE"),
]
# brand and logo leakage (reference-only / blocked roles in a generated page)
LEAK_ROLE = [
    ("logo: the source wordmark in a generated navbar", G["landing"], setp(NAV, ["content", "logoAssetRole"], "brand.wordmark")),
    ("logo: the source app icon in a generated CTA", G["landing"], setp(CTA, ["content", "icon", "assetRole"], "brand.app-icon")),
    ("logo: the source app icon on the generated 404", G["not-found"], setp(NF, ["content", "icon", "assetRole"], "brand.app-icon")),
    ("logo: the source app icon on the generated download page", G["download"], setp("cta.download-page", ["content", "icon", "assetRole"], "brand.app-icon")),
    ("logo: the source wordmark in a generated pricing navbar", G["pricing"], setp(NAV, ["content", "logoAssetRole"], "brand.wordmark")),
    ("partner logo (blocked) on a generated persona tab", G["landing"], lambda d: node(d, TABS)["content"]["tabs"][-1]["logos"][0].__setitem__("assetRole", "logo.partner")),
    ("sponsor wordmark (blocked) in a generated awards hero", G["awards"], setp("hero.awards-hero", ["content", "sponsor", "logo", "assetRole"], "logo.sponsor")),
    ("third-party mark role leaking through a generated plan feature (role)", G["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0]["features"][0].__setitem__("icon", "third-party-mark")),
]
for n_, b_, f_ in LEAK_ROLE:
    MUTATIONS.append((n_, b_, f_, "GENERATED_MODE_REFERENCE_ASSET" if "third-party mark" not in n_ else "GENERATED_MODE_PROTECTED_VALUE"))
# proprietary asset roles (artwork, video, people, embeds)
LEAK_ASSET = [
    ("video: the source hero loop in a generated hero", G["landing"], setp(HERO, ["content", "video", "assetRole"], "video.hero-loop")),
    ("video: the source awards loop in a generated awards hero", G["awards"], setp("hero.awards-hero", ["content", "video", "assetRole"], "video.awards-hero")),
    ("embed: a live video endpoint role in a generated overlay", G["landing"], lambda d: node(d, OVER)["content"]["videos"][0].__setitem__("assetRole", "embed.video")),
    ("screenshot: a source product screenshot in generated features", G["landing"], lambda d: node(d, FEAT)["content"]["rows"][0]["cards"][0]["desktopImage"].__setitem__("assetRole", "screenshot.feature")),
    ("artwork: a source cover image on a generated post card", G["blog-index"], setp("content.post-card", ["content", "cover", "assetRole"], "cover.image")),
    ("artwork: a source cover on a generated article", G["blog-post"], setp("content.article-cover", ["content", "image", "assetRole"], "cover.image")),
    ("artwork: a source article image in a generated post", G["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"][-1]["image"].__setitem__("assetRole", "article.image")),
    ("artwork: a source release image in a generated changelog", G["changelog"], lambda d: node(d, "content.release-entry")["content"]["blocks"][-1]["image"].__setitem__("assetRole", "article.image")),
    ("artwork: a third-party app screenshot in a generated strip", G["app-detail"], lambda d: node(d, "store.screenshot-strip")["content"]["shots"][0]["image"].__setitem__("assetRole", "screenshot.app")),
    ("artwork: a real app icon in a generated store shelf", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0]["icon"].__setitem__("assetRole", "app.icon")),
    ("person: a real author photo role in a generated post", G["blog-post"], setp("content.article-header", ["content", "author", "avatar", "assetRole"], "avatar.person")),
    ("person: a jury portrait (blocked) in a generated awards page", G["awards"], lambda d: node(d, "content.award-jury")["content"]["jurors"][0]["photo"].__setitem__("assetRole", "person.photo")),
    ("medal: the source award medal in a generated prize", G["awards"], lambda d: node(d, "content.award-prizes")["content"]["prizes"][0]["image"].__setitem__("assetRole", "badge.award")),
]
for n_, b_, f_ in LEAK_ASSET:
    MUTATIONS.append((n_, b_, f_, "GENERATED_MODE_REFERENCE_ASSET"))
# a generation-safe role the field does not offer: the field's closed enum rejects it at the schema layer
MUTATIONS += [
    ("generation-safe role the field does not offer (media on a wordmark)", G["landing"], setp(NAV, ["content", "logoAssetRole"], "media.generated"), "SCHEMA"),
    ("reference page using a generation-safe-only role (user-supplied video)", R["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"][-1]["image"].__setitem__("assetRole", "media.user-supplied"), "REFERENCE_MODE_ROLE"),
    ("reference page using a placeholder wordmark", LANDING, setp(NAV, ["content", "logoAssetRole"], "brand.wordmark-placeholder"), "REFERENCE_MODE_ROLE"),
]
# source brand text (case variants, every text-bearing field, route, head, refs)
BRAND = [
    ("brand in a pricing plan title", G["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][1].__setitem__("title", "Glaze Pro")),
    ("brand in a hero headline (upper case)", G["landing"], setp(HERO, ["content", "headline"], "Welcome to GLAZE\nnotes")),
    ("brand in image alt text", G["landing"], setp(CTA, ["content", "icon", "alt"], "The Glaze app icon")),
    ("brand in a CTA label", G["landing"], setp(HERO, ["content", "primaryCta", "label"], "Get Glaze")),
    ("brand in a legal paragraph", G["legal"], lambda d: node(d, "content.legal-body")["content"]["blocks"][0].__setitem__("text", "These terms govern Glaze and its services.")),
    ("brand in the route", G["blog-post"], lambda d: d.__setitem__("route", "/blog/why-glaze-wins")),
    ("brand in the head title", G["pricing"], lambda d: d["head"].__setitem__("title", "Glaze plans")),
    ("brand in the head description (lower case raycast)", G["pricing"], lambda d: d["head"].__setitem__("description", "built with raycast tooling")),
    ("brand in a footer credit", G["landing"], setp(FOOT, ["content", "creditLabel"], "Made by Raycast")),
    ("brand in an asset ref", G["landing"], setp(NAV, ["content", "logoAssetRef"], "placeholder:glaze-wordmark")),
    ("brand in a release title", G["changelog"], setp("content.release-entry", ["content", "title"], "Glaze gets faster")),
    ("brand in an app name", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0].__setitem__("name", "Glaze Notes")),
]
for n_, b_, f_ in BRAND:
    MUTATIONS.append((n_, b_, f_, "GENERATED_MODE_SOURCE_BRAND"))
# verbatim source copy (derived phrases) and real people / companies
COPY = [
    ("source hero headline reused", G["landing"], setp(HERO, ["content", "headline"], "Desktop apps,\nreimagined by you.")),
    ("source feature description reused", G["landing"], lambda d: node(d, FEAT)["content"]["rows"][2]["cards"][0].__setitem__("description", "Easily share with your team or release publicly.")),
    ("source FAQ question reused", G["pricing"], lambda d: node(d, FAQ)["content"]["items"][0].__setitem__("question", "How do I get started?")),
    ("source CTA headline reused", G["landing"], setp(CTA, ["content", "headline"], "What will you build?")),
    ("source criteria sentence reused", G["awards"], lambda d: node(d, "content.award-criteria")["content"]["items"][0].__setitem__("body", "A thoughtful, cohesive interface that feels polished in every detail and makes the app a pleasure to use.")),
    ("source app tagline reused in a generated store row", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0].__setitem__("tagline", "Convert photos into customizable ASCII art and export as images or SVG for web use")),
    ("source 404 sentence reused", G["not-found"], setp(NF, ["content", "headline"], "Page not found")),
    ("source copy inside a longer sentence", G["landing"], setp(CTA, ["content", "headline"], "So tell us what will you build next")),
]
for n_, b_, f_ in COPY:
    MUTATIONS.append((n_, b_, f_, "GENERATED_MODE_SOURCE_COPY"))
ENT = [
    ("real juror name", G["awards"], lambda d: node(d, "content.award-jury")["content"]["jurors"][0].__setitem__("name", "Casey Newton")),
    ("real blog author name", G["blog-post"], setp("content.article-header", ["content", "author", "name"], "Pedro Duarte")),
    ("real company (Anthropic) in copy", G["landing"], setp(HERO, ["content", "subheadline"], "Built on Anthropic models.\nRuns on your Mac.")),
    ("real product (Claude) in a plan feature", G["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0]["features"][1].__setitem__("text", "Works with Claude")),
    ("real store author name", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0].__setitem__("author", "Aanya Singh")),
]
for n_, b_, f_ in ENT:
    MUTATIONS.append((n_, b_, f_, "GENERATED_MODE_SOURCE_ENTITY"))
# URLs
URLS = [
    ("source host in a footer link", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "https://www.glaze.app/blog"), "GENERATED_MODE_SOURCE_URL"),
    ("source host without a scheme", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "glaze.app/blog"), "GENERATED_MODE_SOURCE_URL"),
    ("source download endpoint", G["landing"], lambda d: node(d, HERO)["content"]["primaryCta"].__setitem__("href", "https://www.glaze.app/api/download?cta=x"), "GENERATED_MODE_SOURCE_URL"),
    ("raycast host in the eyebrow link", G["landing"], setp(HERO, ["content", "eyebrowLinkHref"], "https://www.raycast.com/blog"), "GENERATED_MODE_SOURCE_URL"),
    ("source video host in an overlay embed", G["landing"], lambda d: node(d, OVER)["content"]["videos"][0].__setitem__("embedUrl", "https://www.youtube.com/embed/abc"), "GENERATED_MODE_SOURCE_URL"),
    ("source API host in text", G["landing"], setp(HERO, ["content", "requirementsNote"], "Files via api.glazeapp.com"), "GENERATED_MODE_SOURCE_URL"),
    ("a source social host", G["landing"], lambda d: node(d, FOOT)["content"]["socials"][0].__setitem__("href", "https://x.com/someone"), "GENERATED_MODE_SOURCE_URL"),
    ("a source juror site", G["awards"], lambda d: node(d, "content.award-jury")["content"]["jurors"][0]["links"][0].__setitem__("href", "https://cnewton.org/"), "GENERATED_MODE_SOURCE_URL"),
    ("a real external host that is not the source's", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "https://realcompany.com/docs"), "GENERATED_MODE_EXTERNAL_URL"),
    ("a protocol-relative URL", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "//cdn.somewhere.net/x"), "GENERATED_MODE_EXTERNAL_URL"),
    ("a javascript: URL", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "javascript:alert(1)"), "GENERATED_MODE_EXTERNAL_URL"),
    ("a real mailbox", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "mailto:help@realcompany.com"), "GENERATED_MODE_EXTERNAL_URL"),
    ("a real URL inside prose text", G["blog-post"], lambda d: node(d, "content.article-body")["content"]["blocks"][1].__setitem__("text", "See https://realcompany.com/guide for more detail on this approach to notes."), "GENERATED_MODE_EXTERNAL_URL"),
]
for n_, b_, f_, r_ in URLS:
    MUTATIONS.append((n_, b_, f_, r_))
# protected asset files and refs
ASSETS = [
    ("source asset path as a ref", G["landing"], setp(NAV, ["content", "logoAssetRef"], "/assets/logo-full-DAu7MkQ8.svg"), "GENERATED_MODE_SOURCE_ASSET"),
    ("source file stem hidden inside a placeholder ref", G["landing"], setp(CTA, ["content", "icon", "assetRef"], "placeholder:app-icon-PC60coqE"), "GENERATED_MODE_SOURCE_ASSET"),
    ("source store icon path", G["store-index"], lambda d: node(d, "store.app-shelves")["content"]["shelves"][0]["apps"][0]["icon"].__setitem__("assetRef", "/assets/store/ascii-capture-KxyppG-icon.png"), "GENERATED_MODE_SOURCE_ASSET"),
    ("source blog cover file name", G["blog-index"], setp("content.post-card", ["content", "cover", "assetRef"], "generated:cover-how-teams-use-glaze"), "GENERATED_MODE_SOURCE_BRAND"),
    ("source hero video file", G["landing"], setp(HERO, ["content", "video", "assetRef"], "user:intro-loop-0kts42Ml.mp4"), "GENERATED_MODE_SOURCE_ASSET"),
    ("ref that is not a placeholder, user or generated ref", G["landing"], setp(NAV, ["content", "logoAssetRef"], "wordmark.svg"), "GENERATED_MODE_ASSET_REF"),
    ("ref with a host-looking id", G["landing"], setp(CTA, ["content", "particlePoolRef"], "ph-particle-pool"), "GENERATED_MODE_ASSET_REF"),
    ("ref in upper case", G["landing"], setp(NAV, ["content", "logoAssetRef"], "Placeholder:Wordmark"), "GENERATED_MODE_ASSET_REF"),
    ("ref pointing at a real image URL", G["landing"], setp(CTA, ["content", "icon", "assetRef"], "https://images.realcompany.com/icon.png"), "GENERATED_MODE_ASSET_REF"),
]
for n_, b_, f_, r_ in ASSETS:
    MUTATIONS.append((n_, b_, f_, r_))
MUTATIONS += [
    ("blocked enum value (third-party plan mark) in a generated plan", G["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0]["features"][0].__setitem__("icon", "third-party-mark"), "GENERATED_MODE_PROTECTED_VALUE"),
]

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
    """Section-contract mutations (provenance/taxonomy separation, retrieval pins, role wiring).
    Each starts from the real contracts, breaks one thing and must raise the named rule."""
    def repo_with(fn):
        r = copy.deepcopy(REPO)
        fn(r["sections"])
        return r
    role = lambda x: x[NAV]["contentModel"]["properties"]["logoAssetRole"]
    cases = [
        ("overlay contract flipped to retrievalEligible:true", lambda x: x[OVER].__setitem__("retrievalEligible", True), "RETRIEVAL_PIN"),
        ("overlay contract flipped AND reason removed", lambda x: (x[OVER].__setitem__("retrievalEligible", True), x[OVER].pop("retrievalIneligibleReason")), "RETRIEVAL_PIN"),
        ("overlay contract missing retrievalEligible", lambda x: x[OVER].pop("retrievalEligible"), "CONTRACT_SCHEMA"),
        ("overlay ineligible without a reason", lambda x: x[OVER].pop("retrievalIneligibleReason"), "CONTRACT_SCHEMA"),
        ("app dialog contract flipped to retrievalEligible:true", lambda x: x["shell.app-dialog"].__setitem__("retrievalEligible", True), "RETRIEVAL_PIN"),
        ("image lightbox contract flipped to retrievalEligible:true", lambda x: x["shell.image-lightbox"].__setitem__("retrievalEligible", True), "RETRIEVAL_PIN"),
        ("dialog-type section disguised as eligible content (new cookie banner contract)", lambda x: x.__setitem__("shell.cookie-banner", {**copy.deepcopy(x[FOOT]), "id": "section.shell.cookie-banner", "typeId": "shell.cookie-banner", "registryId": "section.shell.cookie-banner", "purpose": "Cookie consent banner.", "semantic": {"id": "section.shell.cookie-banner", "category": "shell"}, "source": {"id": "src.Footer.footer.2", "file": "src/components/Footer.jsx", "tag": "footer", "domSelector": "footer", "citation": "jsx.footer.root"}}), "RETRIEVAL_PIN"),
        ("content section marked ineligible", lambda x: x[FAQ].update({"retrievalEligible": False, "retrievalIneligibleReason": "x" * 40}), "RETRIEVAL_PIN"),
        ("long-form body marked ineligible", lambda x: x["content.article-body"].update({"retrievalEligible": False, "retrievalIneligibleReason": "x" * 40}), "RETRIEVAL_PIN"),
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
        ("a field whose generatedRoles lists a reference-only role", lambda x: role(x)["generatedRoles"].append("brand.app-icon") or role(x)["enum"].append("brand.app-icon"), "ROLE_WIRING"),
        ("a field whose generatedRoles lists a blocked role", lambda x: x[TABS]["contentModel"]["properties"]["tabs"]["items"]["oneOf"][1]["properties"]["logos"]["items"]["properties"]["assetRole"]["generatedRoles"].append("logo.partner"), "ROLE_WIRING"),
        ("a field whose referenceRoles lists a generation-safe role", lambda x: role(x)["referenceRoles"].append("brand.wordmark-placeholder"), "ROLE_WIRING"),
        ("a field with no generation-safe substitute", lambda x: (role(x).__setitem__("generatedRoles", []), role(x).__setitem__("enum", ["brand.wordmark"])), "ROLE_WIRING"),
        ("a field whose enum differs from reference + generated roles", lambda x: role(x)["enum"].remove("brand.wordmark-user-supplied"), "ROLE_WIRING"),
        ("a field naming an unknown role", lambda x: (role(x)["generatedRoles"].append("brand.ghost"), role(x)["enum"].append("brand.ghost")), "ROLE_WIRING"),
    ]
    return [(n, repo_with(fn), rule) for n, fn, rule in cases]


def gate_cases():
    """Wrapper-gate cases on the pure function, using the real recorded heights as the base.
    Counts are relative to the real baseline (the real data carries accepted long-form majority warnings)."""
    mv = json.load(open(os.path.join(DR, "extraction", "measured-values.json")))
    cats = {t: s["category"] for t, s in REPO["sections"].items()}

    def run(fn):
        h = copy.deepcopy(mv["sectionHeights"])
        fn(h)
        return WG.evaluate(h, cats, REPO["templates"])
    L = lambda h: h["pages"]["template.landing"]["sections"][HERO]
    wl = {"section": HERO, "maxHeightPx": 3600, "reviewedBy": "design-review", "justification": "Hero intentionally wraps the full pinned scroll story on this page."}
    base_e, base_w = run(lambda h: None)
    acc = {"template": "template.legal", "section": "content.legal-body", "reviewedBy": "design-review", "justification": "A legal document is one continuous text column of flat siblings, so the body is the page."}
    return [
        ("control: real recorded heights pass the gate", (base_e, base_w), 0, len(base_w)),
        ("hero 1900px is a warning, not an error", run(lambda h: L(h).__setitem__("heightPx", 1900)), 0, len(base_w) + 1),
        ("hero 3100px with no whitelist fails", run(lambda h: L(h).__setitem__("heightPx", 3100)), 1, len(base_w)),
        ("hero 3100px, whitelisted + justified, passes with a warning", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [wl]))), 0, len(base_w) + 1),
        ("hero 3700px exceeds the whitelist maxHeightPx", run(lambda h: (L(h).__setitem__("heightPx", 3700), h.__setitem__("wrapperWhitelist", [wl]))), 1, len(base_w)),
        ("whitelist entry without justification", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [{**wl, "justification": "ok"}]))), 2, len(base_w)),
        ("whitelist entry without reviewer", run(lambda h: (L(h).__setitem__("heightPx", 3100), h.__setitem__("wrapperWhitelist", [{k: v for k, v in wl.items() if k != "reviewedBy"}]))), 2, len(base_w)),
        ("whitelist naming a non-hero section", run(lambda h: h.__setitem__("wrapperWhitelist", [{**wl, "section": FEAT}])), 1, len(base_w)),
        ("non-hero section over 3000px only warns for majority", run(lambda h: h["pages"]["template.landing"]["sections"][FEAT].__setitem__("heightPx", 9000)), 0, len(base_w) + 1),
        ("one section holding most of the page warns", run(lambda h: h["pages"]["template.landing"]["sections"][FAQ].__setitem__("heightPx", 9000)), 0, len(base_w) + 1),
        ("missing height record fails", run(lambda h: h["pages"]["template.landing"]["sections"].pop(FAQ)), 1, len(base_w)),
        ("missing page record fails", run(lambda h: h["pages"].pop("template.persona")), 1, len(base_w)),
        ("missing record for a NEW template fails", run(lambda h: h["pages"].pop("template.pricing")), 1, len(base_w)),
        ("a new template's hero wrapping the page (page title 3500px) fails", run(lambda h: h["pages"]["template.pricing"]["sections"]["hero.page-title"].__setitem__("heightPx", 3500)), 1, len(base_w) + 1),
        ("sectionHeights absent fails", WG.evaluate(None, cats, REPO["templates"]), 1, 0),
        ("repeated node counts once per instance (post card 690px of a page whose cards total 2772px does not warn)", run(lambda h: h["pages"]["template.blog-index"]["sections"]["content.post-card"].update({"heightPx": 690, "totalHeightPx": 2772})), 0, len(base_w)),
        ("accepted long-form majority stays a warning", run(lambda h: h.__setitem__("majorityAccepted", [acc])), 0, len(base_w)),
        ("majorityAccepted without justification", run(lambda h: h.__setitem__("majorityAccepted", [{**acc, "justification": "ok"}])), 1, len(base_w)),
        ("majorityAccepted naming a hero section", run(lambda h: h.__setitem__("majorityAccepted", [{**acc, "template": "template.pricing", "section": "hero.page-title"}])), 1, len(base_w)),
        ("majorityAccepted naming an unknown template", run(lambda h: h.__setitem__("majorityAccepted", [{**acc, "template": "template.ghost"}])), 1, len(base_w)),
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
        print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {name:78} expects {rule}" + ("" if ok else f"  got {[r[1] for r in res][:4]}"))
        fails += not ok
    for name, base, fn, rule in WARN_CASES:
        res = findings(mut(base, fn))
        ok = any(r[1] == rule and r[0] == "warn" for r in res) and not any(r[0] == "error" for r in res)
        print(f"{'WARNS' if ok else 'WRONG':12} {name:78} expects warn {rule}")
        fails += not ok
    ok = motion_budget_case()
    print(f"{'WARNS' if ok else 'WRONG':12} {'two burst sections (graph layer called directly)':78} expects warn MOTION_BUDGET")
    fails += not ok
    # utility overlay flipped to eligible with the schema pin relaxed: the semantic layer must still reject
    d = copy.deepcopy(LANDING)
    node(d, OVER)["retrievalEligible"] = True
    out = []
    SV.check_graph_rules(d, REPO, REPO["templates"]["template.landing"], out)
    ok = any(r[1] == "UTILITY_NOT_RETRIEVABLE" and r[0] == "error" for r in out)
    print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {'overlay node flipped (graph layer called directly, schema bypassed)':78} expects UTILITY_NOT_RETRIEVABLE")
    fails += not ok
    rejected += ok
    extra = 1
    # same flip with a contract that was ALSO flipped: the hard-coded pin still rejects the node
    r2 = copy.deepcopy(REPO)
    r2["sections"][OVER]["retrievalEligible"] = True
    out = []
    SV.check_graph_rules(d, r2, r2["templates"]["template.landing"], out)
    ok = any(r[1] == "UTILITY_NOT_RETRIEVABLE" and r[0] == "error" for r in out)
    print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {'node flip with the contract flipped too (pin independent of registry)':78} expects UTILITY_NOT_RETRIEVABLE")
    fails += not ok
    rejected += ok
    extra += 1
    # the mode layer called directly with the schema bypassed: a reference-only role in a generated page is still rejected
    dd = copy.deepcopy(G["landing"])
    node(dd, NAV)["content"]["logoAssetRole"] = "brand.wordmark"
    out = []
    SV.check_mode(dd, REPO, out)
    ok = any(r[1] == "GENERATED_MODE_REFERENCE_ASSET" for r in out)
    print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {'mode layer called directly (schema bypassed): source wordmark in generated':78} expects GENERATED_MODE_REFERENCE_ASSET")
    fails += not ok
    rejected += ok
    extra += 1
    for name, r, rule in contract_cases():
        res = SV.check_contracts(r)
        ok = any(x[1] == rule and x[0] == "error" for x in res)
        print(f"{'REJECTED' if ok else 'NOT REJECTED':12} {name:78} expects {rule}" + ("" if ok else f"  got {[x[1] for x in res][:4]}"))
        fails += not ok
        rejected += ok
        extra += 1
    ok = not SV.check_contracts(REPO)
    print(f"{'CONTROL PASS' if ok else 'CONTROL FAIL':12} real section contracts pass check_contracts")
    fails += not ok
    gate_controls = int(ok)
    for name, (e, w), ne, nw in gate_cases():
        ok = (len(e) == ne and len(w) == nw) if ne < 2 else (len(e) >= 1 and len(w) == nw)
        print(f"{'GATE OK' if ok else 'GATE WRONG':12} {name:78} expects {ne} error(s), {nw} warning(s); got {len(e)}/{len(w)}")
        fails += not ok
        gate_controls += ok
    # ---- controls: every example of both modes, one per persona route, plus look-alikes that must NOT be rejected
    controls = 0
    ctrl = [(f"{'generated' if k.startswith('generated.') else 'reference'} example {k}", v) for k, v in EX.items()]
    ctrl.insert(0, ("landing example (schema/example.pagespec.json)", LANDING))
    t = REPO["templates"]["template.persona"]
    for rt, tab in t["constraints"]["routeInitialTab"].items():
        d = copy.deepcopy(PERSONA)
        d["route"] = rt
        d["id"] = "page.persona-" + rt.strip("/")
        node(d, TABS)["content"]["initialTab"] = tab
        ctrl.append((f"persona route {rt} (tab {tab})", d))
    for rt, cat in REPO["templates"]["template.store-category"]["constraints"]["routeCategory"].items():
        d = copy.deepcopy(R["store-category"])
        d["route"] = rt
        d["id"] = "page.store-" + rt.split("/")[-1]
        node(d, "store.category-nav")["content"]["activeCategory"] = cat
        ctrl.append((f"store category route {rt}", d))
    for rt in ("/terms", "/privacy", "/aup"):
        d = copy.deepcopy(R["legal"]); d["route"] = rt; d["id"] = "page.legal-" + rt[1:]
        ctrl.append((f"legal route {rt}", d))
    # look-alikes of each generated-mode leak that are legitimate
    look = [
        ("reserved .example host", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "https://docs.fernlight.example/start")),
        ("reserved example.com / .org / .net hosts", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"].__setitem__(slice(0, 2), [{"label": "A", "href": "https://example.com/a"}, {"label": "B", "href": "http://www.example.org/b"}])),
        ("reserved .invalid and .test hosts", G["landing"], lambda d: node(d, FOOT)["content"]["socials"].__setitem__(slice(0, 2), [{"platform": "x", "href": "https://s.brand.invalid/x"}, {"platform": "slack", "href": "https://s.brand.test/y"}])),
        ("relative path and anchor hrefs", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"].__setitem__(slice(0, 2), [{"label": "A", "href": "/guides#intro"}, {"label": "B", "href": "#top"}])),
        ("mailto on a reserved domain", G["landing"], lambda d: node(d, FOOT)["content"]["primaryLinks"][0].__setitem__("href", "mailto:hello@fernlight.example")),
        ("user: and generated: refs", G["landing"], lambda d: node(d, NAV)["content"].__setitem__("logoAssetRef", "user:fernlight-logo")),
        ("generation-safe user-supplied roles", G["landing"], lambda d: node(d, NAV)["content"].__setitem__("logoAssetRole", "brand.wordmark-user-supplied")),
        ("a name that only resembles a source phrase (two of three words)", G["landing"], setp(CTA, ["content", "headline"], "What will you write?")),
        ("an ordinary word from the source vocabulary", G["landing"], setp(HERO, ["content", "subheadline"], "Notes, tasks and drafts.\nAll on your Mac.")),
        ("the check glyph in a generated plan (the only plan mark)", G["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0]["features"][0].__setitem__("icon", "check")),
        ("a third-party mark in a REFERENCE plan row (reference mode allows it)", R["pricing"], lambda d: node(d, "commerce.pricing-plans")["content"]["plans"][0]["features"][0].__setitem__("icon", "third-party-mark")),
        ("a generated post slug unrelated to the brand", G["blog-post"], lambda d: d.__setitem__("route", "/blog/a-different-slug")),
    ]
    for name, base, fn in look:
        ctrl.append((f"look-alike: {name}", mut(base, fn)))
    for name, doc in ctrl:
        res = findings(doc)
        ok = not [r for r in res if r[0] == "error"]
        controls += ok
        print(f"{'CONTROL PASS' if ok else 'CONTROL FAIL':12} {name}" + ("" if ok else f"  {res[:3]}"))
        fails += not ok
    # every template has a reference example whose node list is the template's full node list; generated mode covers the main families
    for tid, tpl in REPO["templates"].items():
        want = [n["section"] for n in tpl["nodes"]]
        have = [[n["type"] for n in b["nodes"]] for k, b in EX.items() if b["template"] == tid and b["mode"] == "reference"]
        have += [[n["type"] for n in LANDING["nodes"]]] if tid == "template.landing" else []
        ok = any(set(h) <= set(want) and all(n["section"] in h for n in tpl["nodes"] if n["required"]) for h in have)
        print(f"{'CONTROL OK' if ok else 'CONTROL FAIL':12} template {tid} has a reference example with every required section")
        fails += not ok
    gen_t = {b["template"] for b in G.values()}
    for tid in REPO["templates"]:
        ok = tid in gen_t
        print(f"{'CONTROL OK' if ok else 'CONTROL FAIL':12} template {tid} has a generated-mode example")
        fails += not ok
    print(f"adversarial: {rejected}/{len(MUTATIONS) + extra} mutations rejected, {controls}/{len(ctrl)} controls pass, {len(WARN_CASES)} warn-case(s), {gate_controls} contract/gate case(s) as expected")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
