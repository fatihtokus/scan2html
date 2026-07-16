# Known bugs

## Fixed

- **Stored XSS via unsanitized advisory text in generated report** ([#214](https://github.com/fatihtokus/scan2html/issues/214))
  CVE/advisory `Description`/`Title` fields from Trivy's scan JSON were spliced verbatim into the report's inline `<script>` block. A field containing a literal `</script` sequence (e.g. `<svg><script>alert(1)</script></svg>`) closed the real `<script>` element early, letting any tag-like text later in the JSON be parsed as live HTML/JS. The `--report-title` flag had a second, independent breakout via unescaped single quotes.
  Fixed in `internal/report/generator.go` / `internal/report/sanitize.go`: all content spliced into the inline `<script>` block is now run through `escapeForInlineScript` (escapes `</script` and `<!--`), and the report title is now JSON-encoded via `json.Marshal` instead of hand-built with `fmt.Sprintf`.
  Covered by `internal/report/sanitize_test.go` and `internal/report/generator_test.go`.

- **`replaceTextByText` silently drops the last line of a file with no trailing newline** (`internal/report/generator.go`, function `replaceTextByText`)
  The read loop called `reader.ReadString('\n')`; when it hit EOF it `break`ed immediately on `err == io.EOF` without processing the partial final line that `ReadString` still returns alongside the EOF error. If a placeholder ever ended up on a template's last line, or a caller passed a replace-file/report file that didn't end in `\n`, that content/replacement was lost.
  Fixed by processing `line` (write-or-replace) before checking/breaking on `io.EOF`, instead of discarding it.
  Covered by `TestReplaceTextByTextNoTrailingNewline_PlaceholderOnLastLine`, `TestReplaceTextByTextNoTrailingNewline_PassthroughOfLastLine`, and `TestReplaceTextByTextEmptyFile` in `internal/report/generator_test.go`.

- **`tempFile` (from `os.CreateTemp`) was never explicitly `Close()`'d in `replaceTextByText`** (`internal/report/generator.go`)
  A file descriptor leak — noticed while fixing the last-line-drop bug above. `bufio.Writer.Flush()` already flushed the buffered data to disk, so there was no data-loss risk, just a leaked fd per call (this function runs up to 5 times per report generation).
  Fixed by adding `defer tempFile.Close()` right after `os.CreateTemp`, alongside the existing `defer file.Close()` for the input file. Safe with the later `copyAndRemove`, which reopens the temp file by name rather than using the original fd.

## Open

_None currently._
