# Compliance Classification Column Format

This folder contains the JSON format specification for the **per-site compliance classification column** used in crawl data spreadsheets (e.g., the Jan2026 sheet). Each site row gets a single JSON object representing its full compliance status across all four tracked privacy string types.

## Files

| File | Description |
|------|-------------|
| `compliance_classification_schema.json` | Full JSON Schema (draft-07) defining all valid fields and status enums |
| `compliance_classification_column.example.json` | Main example — a realistic site with mixed compliance |
| `compliance_classification_column.fully_compliant.example.json` | Site compliant across all four privacy strings |
| `compliance_classification_column.usps_wellknown_only.example.json` | Site with only USPS + Well-known detected |
| `compliance_classification_column.gpp_edge_cases.example.json` | GPP invalid/missing and Not Applicable edge cases |

---

## Format Overview

Each JSON object has four top-level sections, one per tracked privacy string type:

```json
{
  "schemaVersion": "1.0.0",
  "site": "example.com",
  "usps":           { "status": "opted_out" },
  "optanonConsent": { "status": "did_not_opt_out" },
  "wellKnown":      { "status": "opted_out" },
  "gpp": {
    "classifications": [
      { "state": "CA", "field": "SaleOptOut", "status": "opted_out" }
    ]
  }
}
```

### `null` vs. a classification object

A section is `null` if the site had **no detectable implementation** of that privacy string before or after receiving a GPC signal. Only sites with at least one detected string (even in invalid form) get a classification.

---

## Status Enum Reference

All sections use a `status` field with a small machine-readable enum. Human-readable labels can be derived from `{section}: {status}` at render time.

| `status` value | Human-readable meaning |
|---|---|
| `opted_out` | Site correctly opted the user out in response to GPC |
| `did_not_opt_out` | Site did not opt the user out despite the GPC signal |
| `invalid_missing` | String was present before GPC but invalid or missing after |
| `not_applicable` | Site explicitly declared this string is not applicable |
| `invalid` | *(Well-known only)* File exists but cannot be parsed as `gpc: true/false` |

> **Note:** Not all statuses are valid for every section. `not_applicable` does not exist for `optanonConsent` or `wellKnown`. `invalid` is exclusive to `wellKnown`.

---

## Privacy Strings

### USPS (US Privacy String)

Input columns: `uspapi_before_gpc` / `usp_cookies_before_gpc` → `uspapi_after_gpc` / `usp_cookies_after_gpc`

Valid statuses: `opted_out` · `did_not_opt_out` · `invalid_missing` · `not_applicable`

```json
"usps": { "status": "opted_out" }
```

### OptanonConsent (OneTrust)

Input columns: `isGpcEnabled` field in `OptanonConsent_before_gpc` vs. `OptanonConsent_after_gpc`

Valid statuses: `opted_out` · `did_not_opt_out` · `invalid_missing`

```json
"optanonConsent": { "status": "did_not_opt_out" }
```

### Well-known (`/.well-known/gpc.json`)

Input: the `gpc` boolean field in the well-known file (single-point, post-GPC only)

Valid statuses: `opted_out` · `did_not_opt_out` · `invalid`

```json
"wellKnown": { "status": "opted_out" }
```

### GPP (Global Privacy Platform)

Input columns: `decoded_gpp_before_gpc` vs. `decoded_gpp_after_gpc`

GPP produces **multiple** classifications — one per `(state, field)` combination where data was detected. `state` follows GPP spec identifiers (`US`, `CA`, `CT`, `CO`, `TX`, `VA`, etc.). `field` is one of the three opt-out fields below.

Valid statuses: `opted_out` · `did_not_opt_out` · `invalid_missing` · `not_applicable`

```json
"gpp": {
  "classifications": [
    { "state": "US", "field": "SaleOptOut",                "status": "opted_out" },
    { "state": "CA", "field": "SharingOptOut",             "status": "did_not_opt_out" },
    { "state": "CT", "field": "TargetedAdvertisingOptOut", "status": "invalid_missing" }
  ]
}
```

> A site can be compliant for one `(state, field)` and non-compliant for another — all applicable pairs are listed.

---

## Validation

Validate any record against the schema using any JSON Schema (draft-07) validator. Example with `ajv-cli`:

```bash
npx ajv-cli validate -s compliance_classification_schema.json -d compliance_classification_column.example.json
```
