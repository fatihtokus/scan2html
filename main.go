package main

import (
	"fmt"
	"os"
	"scan2html/internal/common"
	"scan2html/internal/epss"
	"scan2html/internal/exploit"
	"scan2html/internal/logger"
	"scan2html/internal/report"
	"scan2html/internal/trivy"
)

var (
	version = "dev"
)

func main() {
	logger.Logger.Info("Scan2html started")

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
	} else if _, exists := pluginFlags["--download-all"]; exists {
		var epssDataFile, err = epss.PrepareEpssDataForCaching()
		if err != nil {
			fmt.Printf("Failed to prepare EPSS data: %v", err)
			os.Exit(1)
		}
		fmt.Printf("EPSS data downloaded to: %s\n", epssDataFile)

		var exploitDataFile, err2 = exploit.PrepareExploitDataForCaching()
		if err2 != nil {
			fmt.Printf("Failed to prepare Exploit data: %v", err2)
			os.Exit(1)
		}
		fmt.Printf("Exploit data downloaded to: %s\n", exploitDataFile)

		os.Exit(0)
	} else {
		exitCode, _ = trivy.GenerateJsonReport(trivyCommand)
	}

	err := report.GenerateHtmlReport(pluginFlags, version)
	if err != nil {
		logger.Logger.Fatalf("Error generating HTML report: %v", err)
	}

	os.Exit(exitCode)
}

func helpMessage() {
	common.PrintHelp(version)
	os.Exit(0)
}
