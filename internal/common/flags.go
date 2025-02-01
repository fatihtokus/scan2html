package common

import (
	"fmt"
	"os"
	"scan2html/internal/logger"
)

var AvailableFlags = map[string]bool{
	//  name               : is boolean
	"--scan2html-flags": true,
	"--output":          false,
	"--with-epss":       true,
	"--with-exploits":   true,
	"--report-title":    false,
	"generate":          true,
	"--from":            false,
}

type Flags map[string]string

func RetrievePluginFlagsAndCommand(args []string) (Flags, []string) {
	logger.Logger.Infof("RetrievePluginFlagsAndCommand: %v", args)
	trivyFlags := []string{}
	pluginFlags := make(Flags)
	isSPDX := false

	for i := 0; i < len(args); i++ {
		arg := args[i]
		if isBoolean, exists := AvailableFlags[arg]; exists {
			if isBoolean {
				pluginFlags[arg] = ""
			} else if i+1 < len(args) {
				pluginFlags[arg] = args[i+1]
				i++
			} else {
				pluginFlags[arg] = ""
			}
		} else {
			// replacing spdx format with spdx-json
			if arg == "--format" && args[i+1] == "spdx" {
				trivyFlags = append(trivyFlags, "--format", "spdx-json")
				i++
				isSPDX = true
			} else {
				trivyFlags = append(trivyFlags, arg)
			}
		}
	}

	// Handle deprecated usage
	if _, exists := pluginFlags["--output"]; !exists {
		logger.Logger.Infoln("Deprecated use of scan2html plugin. Please refer to help to see the new usage!")
		// Using last flag of trivy as the output
		pluginFlags["--output"] = trivyFlags[len(trivyFlags)-1]
		trivyFlags = trivyFlags[:len(trivyFlags)-1]
	}

	if _, exists := pluginFlags["--report-title"]; !exists {
		pluginFlags["--report-title"] = "Trivy Report"
	}

	if !isSPDX {
		trivyFlags = append(trivyFlags, "--format", "json")
	}

	trivyFlags = append(trivyFlags, "--output", GetScan2htmlTempReportPath())

	logger.Logger.Infof("RetrievePluginFlagsAndCommand - pluginFlags: %v", pluginFlags)
	logger.Logger.Infof("RetrievePluginFlagsAndCommand - trivyFlags: %v", trivyFlags)
	return pluginFlags, trivyFlags[1:]
}

func IsHelp() bool {

	if len(os.Args) <= 1 {
		return true
	}

	for _, arg := range os.Args {
		if arg == "-h" || arg == "--help" {
			return true
		}
	}
	return false
}

func PrintHelp(version string) {
	fmt.Printf(`
scan2html v%s
Usage: trivy scan2html [-h,--help] command target filename
 A Trivy plugin that scans and output the results to a html file.
Usage: trivy scan2html [-h,--help] command target filename
  trivy scan2html <trivy [global flags] command [flags] target> --scan2html-flags [scan2html flags]
  trivy scan2html generate --scan2html-flags [scan2html flags]

Utility Commands
  generate    Generate a report from multiple json scan results
  help        Help about any command
  version     Print the version

Flags:
  -h, --help      Show usage.
  --output        Report name
  --report-title  Report title
  --with-epss     Include EPSS data
  --from          Comma separated json scan result files

Examples:
  # Scan an image
  trivy scan2html image --scanners vuln,secret,misconfig,license alpine:latest --scan2html-flags --output interactive_report.html

  # Scan an image from local tar file
  trivy scan2html image --input ruby-3.1.tar --scan2html-flags --output interactive_report.html

  # Scan a local folder
  trivy scan2html fs --scanners vuln,secret,misconfig,license . --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster
  trivy scan2html k8s cluster --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster all
  trivy scan2html k8s --report=all --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster summary
  trivy scan2html k8s --report summary cluster --scan2html-flags --output interactive_report.html

  # Scan and generate SBOM(spdx) report
  trivy scan2html image --format spdx alpine:3.15 --scan2html-flags --output interactive_report.html

  # Generate a report from multiple json scan results - experimental
  trivy scan2html generate --scan2html-flags --output interactive_report.html --from vulnerabilities.json,misconfigs.json,secrets.json

  # Generate report with EPSS scores from multiple scan results - experimental
  trivy scan2html generate --scan2html-flags --with-epss --output interactive_report.html --from vulnerabilities.json,misconfigs.json,secrets.json
`, version)
}
