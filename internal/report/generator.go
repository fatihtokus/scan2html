package report

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"scan2html/internal/common"
	"scan2html/internal/epss"
	"strings"
	"time"
)

func GenerateHtmlReport(pluginFlags common.Flags) error {
	log.Printf("GenerateHtmlReport: %v", pluginFlags)
	defer os.Remove(common.GetScan2htmlTempReportPath())

	baseDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		log.Fatalf("Failed to determine base directory: %v", err)
	}

	reportName := pluginFlags["--output"]
	_, withEpss := pluginFlags["--with-epss"]
	reportTitle := pluginFlags["--report-title"]
	// Log input parameters for clarity
	log.Printf("Base Directory: %s\n", baseDir)
	log.Printf("With EPSS: %t\n", withEpss)
	log.Printf("Report Title: %s\n", reportTitle)
	log.Printf("Report Name: %s\n", reportName)

	// Generate a unique report name if necessary
	reportName = generateReportName(reportName)

	// Append the report template to the report file
	templateContent, _ := common.ReadPluginFile("report_template.html")
	//templateContent, err := os.ReadFile(templatePath)
	// if err != nil {
	// 	return fmt.Errorf("could not read template file %s: %v", templatePath, err)
	// }
	if err := os.WriteFile(reportName, templateContent, 0644); err != nil {
		return fmt.Errorf("could not create report file %s: %v", reportName, err)
	}

	// // Check if the report file was created successfully
	// if _, err := os.Stat(reportName); os.IsNotExist(err) {
	// 	return fmt.Errorf("error: report file '%s' not found", reportName)
	// }

	// Replace placeholders with actual content in the report file
	err = replaceTextByText(reportName, "{REPORT_TITLE:\"Temp Trivy Report\"}", fmt.Sprintf("{REPORT_TITLE:'%s'}", reportTitle))
	if err != nil {
		return fmt.Errorf("failed to replace report title in %s: %v", reportName, err)
	}
	err = replaceTextByFile(reportName, "{TEMP_RESULTS:0}", common.GetScan2htmlTempReportPath())
	if err != nil {
		return fmt.Errorf("failed to replace temp results in %s: %v", reportName, err)
	}

	// Handle EPSS data if enabled
	if withEpss {
		log.Println("EPSS enabled!")
		var epssDataFile, err = epss.PrepareEpssData()
		if err != nil {
			return fmt.Errorf("failed to prepare EPSS data: %v", err)
		}

		// replaceTextByFile "$report_name" "\"TEMP_EPSS_DATA\"" "$epss_data"
		if err := replaceTextByFile(reportName, "\"TEMP_EPSS_DATA\"", epssDataFile); err != nil {
			return fmt.Errorf("failed to replace EPSS data in %s: %v", reportName, err)
		}

		log.Println("EPSS data imported!")

		// Schedule deletion of the EPSS data file upon function exit
		defer os.Remove(epssDataFile)
	}

	log.Printf("%s has been created successfully!\n", reportName)
	return nil
}

// replaceTextByText replaces occurrences of search_text in the input file with replace_content.
func replaceTextByText(inputFile, searchText, replaceContent string) error {
	file, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("could not open file %s: %v", inputFile, err)
	}
	defer file.Close()

	tempFile, err := os.CreateTemp("", "modified_")
	if err != nil {
		return fmt.Errorf("could not create temp file: %v", err)
	}
	defer tempFile.Close()

	reader := bufio.NewReader(file)
	writer := bufio.NewWriter(tempFile)

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return fmt.Errorf("error reading file: %v", err)
		}

		if strings.Contains(line, searchText) {
			before := strings.SplitN(line, searchText, 2)[0]
			after := strings.SplitN(line, searchText, 2)[1]
			replacedLine := fmt.Sprintf("%s%s%s", before, replaceContent, after)
			_, _ = writer.WriteString(replacedLine)
		} else {
			_, _ = writer.WriteString(line)
		}
	}

	if err := writer.Flush(); err != nil {
		return fmt.Errorf("error writing to temp file: %v", err)
	}

	return os.Rename(tempFile.Name(), inputFile)
}

// replaceTextByFile replaces occurrences of search_text in the input file with content from replace_file.
func replaceTextByFile(inputFile, searchText, replaceFile string) error {
	replaceContent, err := os.ReadFile(replaceFile)
	if err != nil {
		return fmt.Errorf("could not read file %s: %v", replaceFile, err)
	}
	return replaceTextByText(inputFile, searchText, string(replaceContent))
}

// generateReportName creates a unique report name based on timestamp if the file already exists.
func generateReportName(reportName string) string {
	if _, err := os.Stat(reportName); os.IsNotExist(err) {
		return reportName // File doesn't exist, return the original name
	}

	// Generate a new report name with a timestamp
	timestamp := time.Now().Format("2006_01_02_15_04_05_06")
	newReportName := strings.Replace(reportName, ".html", fmt.Sprintf("(%s).html", timestamp), 1)
	log.Printf("File %s already exists. Using %s instead.\n", reportName, newReportName)

	return newReportName
}
