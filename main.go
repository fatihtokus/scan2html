package main

import (
	"log"
	"os"

	"scan2html/internal/common"
	"scan2html/internal/report"
	"scan2html/internal/trivy"
)

var (
	version          = "dev"
)

func main() {
	if common.IsHelp() {
		helpMessage()
	}

	pluginFlags, trivyCommand := common.RetrievePluginFlagsAndCommand(os.Args)

	exitCode, err := trivy.GenerateJsonReport(trivyCommand)
	if err != nil {
		log.Fatalf("Failed to generate Trivy JSON report - exit code %d: %v", exitCode, err)
		os.Exit(exitCode)
	}

	err = report.GenerateHtmlReport(pluginFlags)
	if err != nil {
		log.Fatalf("Error generating HTML report: %v", err)
	}

	os.Exit(exitCode)
}

func helpMessage() {
	common.PrintHelp(version)
	os.Exit(0)
}
