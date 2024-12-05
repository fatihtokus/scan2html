package main

import (
	"log"
	"os"

	"scan2html/internal/common"
	"scan2html/internal/report"
	"scan2html/internal/trivy"
)

func main() {
	if common.IsHelp() || len(os.Args) <= 1 {
		helpMessage()
	}

	pluginFlags, trivyCommand := common.RetrievePluginFlagsAndCommand(os.Args)

	// Generate Trivy JSON report
	err, exitCode := trivy.GenerateJsonReport(trivyCommand)
	if err != nil {
		log.Fatalf("Failed to generate Trivy JSON report - exit code %d: %v", exitCode, err)
		os.Exit(exitCode)
	}

	err = report.GenerateHtmlReport(pluginFlags)
	if err != nil {
		log.Fatalf("Error generating HTML report: %v", err)
	}
}

func helpMessage() {
	common.PrintHelp("dev")
	os.Exit(0)
}
