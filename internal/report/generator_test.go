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

func TestReplaceTextByText_ReportTitleAndDefaultThemePlaceholders(t *testing.T) {
	tmpDir := t.TempDir()
	inputFile := filepath.Join(tmpDir, "report.html")
	inputContent := "TN=[{REPORT_TITLE:`Temp Trivy Report`,DEFAULT_THEME:`light`}],"
	if err := os.WriteFile(inputFile, []byte(inputContent), 0644); err != nil {
		t.Fatalf("failed to write input file: %v", err)
	}

	if err := replaceTextByText(inputFile, "REPORT_TITLE:`Temp Trivy Report`", `REPORT_TITLE:"My Report"`); err != nil {
		t.Fatalf("replaceTextByText returned error for REPORT_TITLE: %v", err)
	}
	if err := replaceTextByText(inputFile, "DEFAULT_THEME:`light`}", `DEFAULT_THEME:"dark"}`); err != nil {
		t.Fatalf("replaceTextByText returned error for DEFAULT_THEME: %v", err)
	}

	got, err := os.ReadFile(inputFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	want := `TN=[{REPORT_TITLE:"My Report",DEFAULT_THEME:"dark"}],`
	if string(got) != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestReplaceTextByTextNoTrailingNewline_PlaceholderOnLastLine(t *testing.T) {
	tmpDir := t.TempDir()
	inputFile := filepath.Join(tmpDir, "report.html")
	if err := os.WriteFile(inputFile, []byte("line one\nline two: TEMP_APP_VERSION"), 0644); err != nil {
		t.Fatalf("failed to write input file: %v", err)
	}

	if err := replaceTextByText(inputFile, "TEMP_APP_VERSION", "v1.2.3"); err != nil {
		t.Fatalf("replaceTextByText returned error: %v", err)
	}

	got, err := os.ReadFile(inputFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	want := "line one\nline two: v1.2.3"
	if string(got) != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestReplaceTextByTextNoTrailingNewline_PassthroughOfLastLine(t *testing.T) {
	tmpDir := t.TempDir()
	inputFile := filepath.Join(tmpDir, "report.html")
	if err := os.WriteFile(inputFile, []byte("TEMP_APP_VERSION here\nfinal line with no newline"), 0644); err != nil {
		t.Fatalf("failed to write input file: %v", err)
	}

	if err := replaceTextByText(inputFile, "TEMP_APP_VERSION", "v1.2.3"); err != nil {
		t.Fatalf("replaceTextByText returned error: %v", err)
	}

	got, err := os.ReadFile(inputFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	want := "v1.2.3 here\nfinal line with no newline"
	if string(got) != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestReplaceTextByTextEmptyFile(t *testing.T) {
	tmpDir := t.TempDir()
	inputFile := filepath.Join(tmpDir, "report.html")
	if err := os.WriteFile(inputFile, []byte(""), 0644); err != nil {
		t.Fatalf("failed to write input file: %v", err)
	}

	if err := replaceTextByText(inputFile, "TEMP_APP_VERSION", "v1.2.3"); err != nil {
		t.Fatalf("replaceTextByText returned error: %v", err)
	}

	got, err := os.ReadFile(inputFile)
	if err != nil {
		t.Fatalf("failed to read output file: %v", err)
	}

	if len(got) != 0 {
		t.Errorf("expected empty output, got %q", got)
	}
}
