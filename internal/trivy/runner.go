package trivy

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"scan2html/internal/common"
	"strings"
)

func GenerateJsonReport(trivyFlags []string) (int, error) {
	// Run the Trivy command
	log.Printf("Run the Trivy command: %s %s", findTrivyInstallation(), strings.Join(trivyFlags, " "))
	cmd := exec.Command(findTrivyInstallation(), trivyFlags...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	var exitCode = 0
	if err := cmd.Run(); err != nil {
		// Check if it's an ExitError to retrieve the exit code

		if exitErr, ok := err.(*exec.ExitError); ok {
			// Extract the exit code
			exitCode = exitErr.ExitCode()
			return exitCode, fmt.Errorf("trivy command failed with exit code %d: %s", exitCode, stderr.String())
		}

		// Non-ExitError cases
		return 0, fmt.Errorf("trivy command execution failed: %w", err)

	}

	// Check if the output file was created
	outputFile := common.GetScan2htmlTempReportPath()
	stats, err := os.Stat(outputFile)
	if os.IsNotExist(err) {
		return exitCode, fmt.Errorf("output file %s was not created", outputFile)
	}
	log.Printf("Generated Json report: %s with size of: %d bytes", outputFile, stats.Size())

	return 0, nil
}

var findTrivyInstallation = func() string {
	if err := validateTrivyInstallation("./trivy"); err == nil {
		log.Println("Using ./trivy")
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

// ParseCommand extracts the command to be passed to Trivy.
// func ParseCommand(args []string) ([]string, error) {
// 	if len(args) < 2 {
// 		return nil, fmt.Errorf("insufficient arguments to determine Trivy command")
// 	}

// 	// Everything after "scan2html" is treated as part of the Trivy command
// 	trivyCommand := args[1:]

// 	// Ensure the command contains valid syntax
// 	if !isTrivyCommandValid(trivyCommand) {
// 		return nil, fmt.Errorf("invalid Trivy command: %v", strings.Join(trivyCommand, " "))
// 	}

// 	return trivyCommand, nil
// }

// // isTrivyCommandValid performs basic checks on the Trivy command.
// func isTrivyCommandValid(command []string) bool {
// 	if len(command) < 1 {
// 		return false
// 	}

// 	// Example validation: Ensure the first argument is a valid Trivy subcommand
// 	validSubcommands := []string{"image", "filesystem", "rootfs", "repo", "config"}
// 	for _, valid := range validSubcommands {
// 		if command[0] == valid {
// 			return true
// 		}
// 	}

// 	return false
// }
