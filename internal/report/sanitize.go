package report

import "regexp"

var (
	scriptCloseRe = regexp.MustCompile(`(?i)</script`)
	htmlCommentRe = regexp.MustCompile(`<!--`)
)

// escapeForInlineScript neutralizes byte sequences that would let content
// break out of the report's inline <script> element when spliced in as raw
// text (the HTML tokenizer matches "</script" and "<!--" independent of JS
// string context).
func escapeForInlineScript(s string) string {
	s = scriptCloseRe.ReplaceAllStringFunc(s, func(m string) string {
		return "<\\/" + m[2:]
	})
	return htmlCommentRe.ReplaceAllString(s, `<\!--`)
}
