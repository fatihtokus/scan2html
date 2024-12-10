package trivy

import (
	"os"
	"path/filepath"
	"scan2html/internal/common"
	"testing"
)

func TestGenerateJsonReport(t *testing.T) {
	// Setup a temporary directory for the mock trivy command
	tmpDir := t.TempDir()
	mockTrivy := filepath.Join(tmpDir, "trivy")

	// Get the temporary report file path for testing
	outputFile := common.GetScan2htmlTempReportPath()

	// Create a mock trivy script
	mockScript := `#!/bin/bash
EXIT_CODE=0
COMMAND_FAILED_WITH=0
for i in "$@"; do
  if [[ "$i" == "--exit-code" ]]; then
    EXIT_CODE="$2"
  fi
  if [[ "$i" == "--no-output" ]]; then
    COMMAND_FAILED_WITH="1"
  fi
done

if [ "$EXIT_CODE" != "0" ]; then
  echo "Simulated exit with code $EXIT_CODE" >&2
  exit "$EXIT_CODE"
fi

if [ "$COMMAND_FAILED_WITH" != "0" ]; then
  echo "Simulated exit with code $EXIT_CODE" >&2
  exit "1"
fi

echo "Simulated success"
touch ` + outputFile + `
exit 0
`
	if err := os.WriteFile(mockTrivy, []byte(mockScript), 0755); err != nil {
		t.Fatalf("Failed to write mock trivy script: %v", err)
	}

	// Temporarily override PATH to use the mock trivy
	originalPath := os.Getenv("PATH")
	os.Setenv("PATH", tmpDir+":"+originalPath)
	defer os.Setenv("PATH", originalPath)

	// Replace findTrivyInstallation to return the mock script path
	originalFindTrivyInstallation := findTrivyInstallation
	findTrivyInstallation = func() string {
		return mockTrivy
	}
	defer func() { findTrivyInstallation = originalFindTrivyInstallation }()

	tests := []struct {
		name         string
		trivyFlags   []string
		expectErr    bool
		expectedCode int
	}{
		{
			name:         "Command executed successfuly",
			trivyFlags:   []string{"--format", "json", "--output", outputFile},
			expectErr:    false,
			expectedCode: 0,
		},
		{
			name:         "Command executed successfuly with custom exit code",
			trivyFlags:   []string{"--exit-code", "7", "--format", "json", "--output", outputFile},
			expectErr:    true,
			expectedCode: 7,
		},
		{
			name:         "Command failed with an error",
			trivyFlags:   []string{"--no-output"},
			expectErr:    true,
			expectedCode: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Cleanup the output file before running the test
			_ = os.Remove(outputFile)

			// Run the GenerateJsonReport function
			exitCode, err := GenerateJsonReport(tt.trivyFlags)

			// Validate the error and exit code
			if (err != nil) != tt.expectErr {
				t.Errorf("GenerateJsonReport() error = %v, expectErr %v", err, tt.expectErr)
			}
			if exitCode != tt.expectedCode {
				t.Errorf("GenerateJsonReport() exitCode = %d, expectedCode %d", exitCode, tt.expectedCode)
			}

			// If no error is expected and the command succeeded, validate the output file
			if !tt.expectErr && tt.expectedCode == 0 {
				if _, err := os.Stat(outputFile); os.IsNotExist(err) {
					t.Errorf("Expected output file %s not found", outputFile)
				}
			}
		})
	}
}
