package common

import (
	"fmt"
	"log"
	"os"
)

var AvailableFlags = map[string]bool{
	//  name               : is boolean
	"--scan2html-flags": true,
	"--output":          false,
	"--with-epss":       true,
	"--report-title":    false,
	"generate":          true,
	"--from":            false,
}

type Flags map[string]string

func RetrievePluginFlagsAndCommand(args []string) (Flags, []string) {
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
		log.Println("Deprecated use of scan2html plugin. Please refer to help to see the new usage!")
		pluginFlags["--output"] = trivyFlags[len(trivyFlags)-1]
		trivyFlags = trivyFlags[:len(trivyFlags)-1]
	}

	if !isSPDX {
		trivyFlags = append(trivyFlags, "--format", "json")
	}

	trivyFlags = append(trivyFlags, "--output", GetScan2htmlTempReportPath())

	return pluginFlags, trivyFlags[1:]
}

func IsHelp() bool {
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
Usage: trivy scan2html [options] command target filename
Options:
  -h, --help    Show usage.
`, version)
}
