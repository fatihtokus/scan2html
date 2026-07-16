package report

import (
	"strings"
	"testing"
)

func TestEscapeForInlineScript(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "plain text is untouched",
			input: `{"Description":"a normal vulnerability description"}`,
			want:  `{"Description":"a normal vulnerability description"}`,
		},
		{
			name:  "lowercase closing script tag is escaped",
			input: `</script>`,
			want:  `<\/script>`,
		},
		{
			name:  "uppercase closing script tag is escaped",
			input: `</SCRIPT>`,
			want:  `<\/SCRIPT>`,
		},
		{
			name:  "mixed case closing script tag is escaped",
			input: `</ScRiPt>`,
			want:  `<\/ScRiPt>`,
		},
		{
			name:  "issue PoC: img onerror payload has no script tag to break",
			input: `<img src=x onerror=alert(1)>`,
			want:  `<img src=x onerror=alert(1)>`,
		},
		{
			name:  "issue PoC: svg script payload is neutralized",
			input: `<svg><script>alert(1)</script></svg>`,
			want:  `<svg><script>alert(1)<\/script></svg>`,
		},
		{
			name:  "html comment open is escaped",
			input: `<!-- comment -->`,
			want:  `<\!-- comment -->`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := escapeForInlineScript(tt.input)
			if got != tt.want {
				t.Errorf("escapeForInlineScript(%q) = %q, want %q", tt.input, got, tt.want)
			}
			if strings.Contains(strings.ToLower(got), "</script") {
				t.Errorf("escapeForInlineScript(%q) = %q still contains an unescaped closing script tag", tt.input, got)
			}
		})
	}
}
