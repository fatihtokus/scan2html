package common

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGetScan2htmlTempReportPath(t *testing.T) {
	// Get the system temporary directory and expected report path
	expectedPath := filepath.Join(os.TempDir(), "scan2html-temp-report.json")

	// Call the function
	actualPath := GetScan2htmlTempReportPath()

	// Verify the output
	if actualPath != expectedPath {
		t.Errorf("GetScan2htmlTempReportPath() = %v, want %v", actualPath, expectedPath)
	}
}