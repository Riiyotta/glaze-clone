"""Shared token loader/resolver used by build_catalog.py and extraction/verify_all.py.

Token files are merged into one tree. References look like {foundation.color.neutral.950};
keys may themselves contain dots (space "3.5", breakpoint names), so path resolution tries
the longest matching key at each level.
"""
import glob
import json
import os
import re

TOKENS = os.path.dirname(os.path.abspath(__file__))
REF = re.compile(r"\{([^{}]+)\}")
LAYER_DIRS = ["00-foundation", "10-semantic", "20-component", "30-layout"]


def _merge(dst, src, where):
    for k, v in src.items():
        if k.startswith("$"):
            continue
        if k in dst and isinstance(dst[k], dict) and isinstance(v, dict) and "$value" not in v:
            _merge(dst[k], v, where)
        elif k in dst:
            raise ValueError(f"duplicate token root/key {k!r} while merging {where}")
        else:
            dst[k] = v


def load_tree():
    tree, roots = {}, {}
    for layer in LAYER_DIRS:
        for f in sorted(glob.glob(os.path.join(TOKENS, layer, "*.json"))):
            d = json.load(open(f))
            for k in d:
                if not k.startswith("$"):
                    roots.setdefault(k, []).append(os.path.relpath(f, TOKENS))
            _merge(tree, d, f)
    return tree, roots


def lookup(tree, path):
    """Return the node at dotted `path` or raise KeyError."""
    parts = path.split(".")

    def go(node, i):
        if i == len(parts):
            return node
        if not isinstance(node, dict):
            raise KeyError(path)
        for j in range(len(parts), i, -1):
            key = ".".join(parts[i:j])
            if key in node:
                try:
                    return go(node[key], j)
                except KeyError:
                    continue
        raise KeyError(path)

    return go(tree, 0)


def refs_in(value):
    """Yield every {ref} found in strings nested anywhere in value."""
    if isinstance(value, str):
        yield from REF.findall(value)
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from refs_in(v)
    elif isinstance(value, list):
        for v in value:
            yield from refs_in(v)


def is_token(node):
    return isinstance(node, dict) and "$value" in node


def resolve_value(tree, node, trail=()):
    """Resolve a token's $value, following whole-value references; embedded refs stay as is."""
    v = node["$value"] if is_token(node) else node
    if isinstance(v, str):
        m = REF.fullmatch(v)
        if m:
            p = m.group(1)
            if p in trail:
                raise ValueError("reference cycle: " + " -> ".join(trail + (p,)))
            return resolve_value(tree, lookup(tree, p), trail + (p,))
        return v
    if isinstance(v, list):
        return [resolve_value(tree, x, trail) if isinstance(x, (str, dict, list)) else x for x in v]
    if isinstance(v, dict):
        return {k: resolve_value(tree, x, trail) if isinstance(x, (str, dict, list)) else x for k, x in v.items()}
    return v


def walk_tokens(tree, prefix=""):
    """Yield (path, node) for every $value leaf."""
    for k, v in tree.items():
        p = f"{prefix}.{k}" if prefix else k
        if is_token(v):
            yield p, v
        elif isinstance(v, dict):
            yield from walk_tokens(v, p)
