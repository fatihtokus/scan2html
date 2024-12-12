package trivy

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"scan2html/internal/logger"
	"scan2html/internal/common"
	"strings"
)

func GenerateJsonReport(trivyFlags []string) (int, error) {
	// Run the Trivy command
	logger.Logger.Infof("Run the Trivy command: %s %s", findTrivyInstallation(), strings.Join(trivyFlags, " "))
	cmd := exec.Command(findTrivyInstallation(), trivyFlags...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	var exitCode = 0
	if err := cmd.Run(); err != nil {
		// Check if it's an ExitError to retrieve the exit code
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
	}

	// Check if the output file was created
	outputFile := common.GetScan2htmlTempReportPath()
	stats, err := os.Stat(outputFile)
	if os.IsNotExist(err) {
		return exitCode, fmt.Errorf("output file %s was not created", outputFile)
	}
	logger.Logger.Infof("Generated Json report: %s with size of: %d bytes", outputFile, stats.Size())

	return exitCode, nil
}

var findTrivyInstallation = func() string {
	if err := validateTrivyInstallation("./trivy"); err == nil {
		logger.Logger.Infoln("Using ./trivy")
		return "./trivy"
	}
	return "trivy"
}

// ValidateTrivyInstallation ensures that Trivy is installed and accessible.
func validateTrivyInstallation(trivyInstllation string) error {
	cmd := exec.Command(trivyInstllation, "--version")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to validate Trivy installation: %w\nStderr: %s", err, stderr.String())
	}

	return nil
}