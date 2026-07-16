# Known bugs

## Fixed

- **Stored XSS via unsanitized advisory text in generated report** ([#214](https://github.com/fatihtokus/scan2html/issues/214))
  CVE/advisory `Description`/`Title` fields from Trivy's scan JSON were spliced verbatim into the report's inline `<script>` block. A field containing a literal `</script` sequence (e.g. `<svg><script>alert(1)</script></svg>`) closed the real `<script>` element early, letting any tag-like text later in the JSON be parsed as live HTML/JS. The `--report-title` flag had a second, independent breakout via unescaped single quotes.
  Fixed in `internal/report/generator.go` / `internal/report/sanitize.go`: all content spliced into the inline `<script>` block is now run through `escapeForInlineScript` (escapes `</script` and `<!--`), and the report title is now JSON-encoded via `json.Marshal` instead of hand-built with `fmt.Sprintf`.
  Covered by `internal/report/sanitize_test.go` and `internal/report/generator_test.go`.

## Open

- **`replaceTextByText` silently drops the last line of a file with no trailing newline** (`internal/report/generator.go:407-424`)
  The read loop calls `reader.ReadString('\n')`; when it hits EOF it `break`s immediately on `err == io.EOF` without processing the partial final line that `ReadString` still returns alongside the EOF error. If a placeholder ever ends up on a template's last line (currently doesn't — `report_template.html`'s placeholders are mid-file) or a caller passes a replace-file/report file that doesn't end in `\n`, that content/replacement is lost.
  Not fixed as part of #214 (out of scope, doesn't affect the current XSS fix — templates end with a trailing newline before the placeholder lines), but worth a follow-up fix: process `line` before checking/breaking on `io.EOF`.
