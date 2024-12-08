package main

import (
	"fmt"
	"log"
	"os"

	"scan2html/internal/common"
	"scan2html/internal/report"
	"scan2html/internal/trivy"
)

var (
	version = "dev"
)

func main() {
	if common.IsHelp() {
		helpMessage()
	}

	pluginFlags, trivyCommand := common.RetrievePluginFlagsAndCommand(os.Args)

	var exitCode = 0
	if _, exists := pluginFlags["generate"]; exists {
		if err := report.CombineReports(pluginFlags); err != nil {
			fmt.Printf("Error: %v\n", err)
			os.Exit(1)
		}
	} else {
		exitCode, _ = trivy.GenerateJsonReport(trivyCommand)
	}

	// if err != nil {
	// 	log.Fatalf("Failed to generate Trivy JSON report - exit code %d: %v", exitCode, err)
	// 	os.Exit(exitCode)
	// }

	err := report.GenerateHtmlReport(pluginFlags)
	if err != nil {
		log.Fatalf("Error generating HTML report: %v", err)
	}

	os.Exit(exitCode)
}

func helpMessage() {
	common.PrintHelp(version)
	os.Exit(0)
}
