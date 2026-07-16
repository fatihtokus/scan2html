package report

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestReplaceTextByFileEscapesScriptBreakout(t *testing.T) {
	tmpDir := t.TempDir()

	inputFile := filepath.Join(tmpDir, "report.html")
	inputContent := "<script>GB=[{TEMP_RESULTS:0}]</script>\n"
	if err := os.WriteFile(inputFile, []byte(inputContent), 0644); err != nil {
		t.Fatalf("failed to write input file: %v", err)
	}

	replaceFile := filepath.Join(tmpDir, "results.json")
	maliciousPayload := `{"Description":"<svg><script>alert(1)</script></svg>"}`
	if err := os.WriteFile(replaceFile, []byte(maliciousPayload), 0644); err != nil {
		t.Fatalf("failed to write replace file: %v", err)
	}

	if err := replaceTextByFile(inputFile, "{TEMP_RESULTS:0}", replaceFile); err != nil {
		t.Fatalf("replaceTextByFile returned error: %v", err)
	}

	got, err := os.ReadFile(inputFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	// The whole file must still parse as a single <script> element: the
	// embedded payload must not contain an unescaped closing script tag
	// that would let the browser terminate the element early.
	body := string(got)
	firstOpen := strings.Index(body, "<script>")
	firstClose := strings.Index(body, "</script>")
	if firstOpen == -1 || firstClose == -1 {
		t.Fatalf("expected exactly one script open/close pair, got: %s", body)
	}
	between := body[firstOpen+len("<script>") : firstClose]
	if strings.Contains(strings.ToLower(between), "</script") {
		t.Errorf("payload still contains an unescaped closing script tag inside the script element: %q", between)
	}
	if !strings.Contains(body, `alert(1)`) {
		t.Errorf("expected original payload text to survive escaping, got: %s", body)
	}
}
