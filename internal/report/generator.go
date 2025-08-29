package report

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"scan2html/internal/common"
	"scan2html/internal/epss"
	"scan2html/internal/exploit"
	"scan2html/internal/logger"
	"strings"
	"time"
)

func GenerateHtmlReport(pluginFlags common.Flags, version string) error {
	logger.Logger.Infof("GenerateHtmlReport: %v", pluginFlags)
	defer os.Remove(common.GetScan2htmlTempReportPath())

	baseDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		log.Fatalf("Failed to determine base directory: %v", err)
	}

	reportName := pluginFlags["--output"]
	_, withEpss := pluginFlags["--with-epss"]
	_, withCachedEpss := pluginFlags["--with-cached-epss"]
	_, withExploits := pluginFlags["--with-exploits"]
	_, withCachedExploits := pluginFlags["--with-cached-exploits"]
	reportTitle := pluginFlags["--report-title"]
	// Log input parameters for clarity
	logger.Logger.Infof("Base Directory: %s\n", baseDir)
	logger.Logger.Infof("With EPSS: %t\n", withEpss || withCachedEpss)
	logger.Logger.Infof("With Exploits: %t\n", withExploits || withCachedExploits)
	logger.Logger.Infof("Report Title: %s\n", reportTitle)
	logger.Logger.Infof("Report Name: %s\n", reportName)

	// Generate a unique report name if necessary
	reportName = generateReportName(reportName)

	// Append the report template to the report file
	templateContent, _ := common.ReadPluginFile("report_template.html")
	if err := os.WriteFile(reportName, templateContent, 0644); err != nil {
		return fmt.Errorf("could not create report file %s: %v", reportName, err)
	}

	err = replaceTextByText(reportName, "TEMP_APP_VERSION", version)
	if err != nil {
		return fmt.Errorf("failed to replace app version in %s: %v", reportName, err)
	}

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
	// replaceTextByFile "$report_name" "\"TEMP_EPSS_DATA\"" "$epss_data"
	// Schedule deletion of the EPSS data file upon function exit
	shouldReturn, returnValue := handleEPSS(withCachedEpss, withEpss, reportName)
	if shouldReturn {
		return returnValue
	}

	shouldReturn, returnValue = handleExploit(withCachedExploits, withExploits, reportName)
	if shouldReturn {
		return returnValue
	}

	logger.Logger.Infof("%s has been created successfully!\n", reportName)
	return nil
}

func handleEPSS(withCachedEpss bool, withEpss bool, reportName string) (bool, error) {
	if !withCachedEpss && !withEpss {
		logger.Logger.Infoln("EPSS not enabled!")
		return false, nil
	}

	var epssDataFile string
	var err error
	if withCachedEpss {
		logger.Logger.Infoln("Cached EPSS enabled!")
		epssDataFile, err = common.GetCachedEPSSDataFile()
		if err != nil {
			return true, err
		}

	} else if withEpss {
		logger.Logger.Infoln("EPSS enabled!")
		epssDataFile, err = epss.PrepareEpssDataTemporarily()
		if err != nil {
			return true, fmt.Errorf("failed to prepare EPSS data: %v", err)
		}
		defer os.Remove(epssDataFile)
	}

	logger.Logger.Infoln("Filtering EPSS data started.")
	if err := filterEPSS(epssDataFile); err != nil {
		return true, fmt.Errorf("failed to replace EPSS data in %s: %v", reportName, err)
	}
	logger.Logger.Infoln("Filtering EPSS data completed.")

	// Add backticks to the beginning and end of the file
	if err := epss.AddBackticksToFile(common.GetFilteredEPSSDataFile()); err != nil {
		return true, fmt.Errorf("failed to add backticks to file: %w", err)
	}

	if err := replaceTextByFile(reportName, "\"TEMP_EPSS_DATA\"", common.GetFilteredEPSSDataFile()); err != nil {
		return true, fmt.Errorf("failed to replace EPSS data in %s: %v", reportName, err)
	}

	logger.Logger.Infoln("EPSS data imported!")

	return false, nil
}

func filterEPSS(epssDataFile string) error {
	// Extract all CVEs from JSON file using the known pattern
	cveSet, err := extractCVEsFromJSON(common.GetScan2htmlTempReportPath())
	if err != nil {
		return err
	}

	// Open input and output files
	inputFile, err := os.Open(epssDataFile)
	if err != nil {
		return err
	}
	defer inputFile.Close()

	outputFile, err := os.Create(common.GetFilteredEPSSDataFile())
	if err != nil {
		return err
	}
	defer outputFile.Close()

	// Use a scanner for the input file
	scanner := bufio.NewScanner(inputFile)
	writer := csv.NewWriter(outputFile)
	defer writer.Flush()

	var lineCount, matchCount int
	var headerWritten bool = false

	for scanner.Scan() {
		line := scanner.Text()

		// Handle the comment line - write it directly as raw text
		if strings.HasPrefix(line, "#") {
			// Write the comment line as a single CSV field

			// Write the comment header line as a raw string first
			if _, err := outputFile.WriteString(line + "\n"); err != nil {
				return err
			}

			continue
		}

		// Parse CSV line
		reader := csv.NewReader(strings.NewReader(line))
		record, err := reader.Read()
		if err != nil {
			continue // Skip invalid lines
		}

		lineCount++

		if len(record) < 3 {
			continue // Skip incomplete lines
		}

		// If this is the header line from input, write it to output
		if !headerWritten && record[0] == "cve" && record[1] == "epss" && record[2] == "percentile" {
			if err := writer.Write(record); err != nil {
				return err
			}
			headerWritten = true
			continue
		}

		cve := strings.TrimSpace(record[0])

		// Check if CVE exists in our set (O(1) lookup)
		if cveSet[cve] {
			// Write the matching record to output
			if err := writer.Write(record); err != nil {
				return err
			}
			matchCount++
		}
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	stats, _ := os.Stat(common.GetFilteredEPSSDataFile())
	logger.Logger.Infof("File created: %s, size: %d bytes", common.GetFilteredEPSSDataFile(), stats.Size())
	logger.Logger.Infof("Processed %d lines, found %d matches", lineCount, matchCount)

	return nil
}

// extractCVEsFromJSON extracts CVEs using the known pattern: "VulnerabilityID": "CVE-2020-13949"
func extractCVEsFromJSON(filename string) (map[string]bool, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to extractCVEsFromJSON from %s: %v", filename, err)
	}

	cveSet := make(map[string]bool)
	pattern := []byte(`"VulnerabilityID": "`)
	patternLen := len(pattern)

	contentLen := len(content)
	i := 0

	for i < contentLen {
		// Find the pattern
		pos := bytes.Index(content[i:], pattern)
		if pos == -1 {
			break
		}

		patternStart := i + pos + patternLen

		// Find the closing quote
		quoteEnd := bytes.IndexByte(content[patternStart:], '"')
		if quoteEnd == -1 {
			break
		}

		cveEnd := patternStart + quoteEnd
		if cveEnd > contentLen {
			break
		}

		// Extract the CVE
		potentialCVE := string(content[patternStart:cveEnd])
		if strings.HasPrefix(potentialCVE, "CVE-") {
			cveSet[potentialCVE] = true
		}

		i = cveEnd + 1
	}

	logger.Logger.Infof("Found %d unique CVEs in JSON file", len(cveSet))

	return cveSet, nil
}

func handleExploit(withCachedExploits bool, withExploits bool, reportName string) (bool, error) {
	if !withCachedExploits && !withExploits {
		logger.Logger.Infoln("Exploits not enabled!")
		return false, nil
	}

	var exploitDataFile string
	var err error
	if withCachedExploits {
		logger.Logger.Infoln("Cached Exploits enabled!")
		exploitDataFile, err = common.GetCachedExploitDataFile()
		if err != nil {
			return true, err
		}

	} else if withExploits {
		logger.Logger.Infoln("Exploits enabled!")
		exploitDataFile, err = exploit.PrepareExploitDataTemporarily()
		if err != nil {
			return true, fmt.Errorf("failed to prepare Exploits data: %v", err)
		}

		defer os.Remove(exploitDataFile)
	}

	logger.Logger.Infoln("Filtering Exploit data started.")
	if err := filterExploit(exploitDataFile); err != nil {
		return true, fmt.Errorf("failed to replace EPSS data in %s: %v", reportName, err)
	}
	logger.Logger.Infoln("Filtering Exploit data completed.")

	if err := replaceTextByFile(reportName, "{TEMP_EXPLOITS:0}", common.GetFilteredExploitDataFile()); err != nil {
		return true, fmt.Errorf("failed to replace Exploits data in %s: %v", reportName, err)
	}

	logger.Logger.Infoln("Exploits data imported!")

	return false, nil
}

func filterExploit(exploitDataFile string) error {
	// Extract CVEs from vulnerabilities JSON
	cveSet, err := extractCVEsFromJSON(common.GetScan2htmlTempReportPath())
	if err != nil {
		return err
	}

	// Read the CISA JSON file
	cisaContent, err := os.ReadFile(exploitDataFile)
	if err != nil {
		return err
	}

	// Parse the CISA JSON structure
	var cisaCatalog struct {
		Title           string `json:"title"`
		CatalogVersion  string `json:"catalogVersion"`
		DateReleased    string `json:"dateReleased"`
		Count           int    `json:"count"`
		Vulnerabilities []struct {
			CveID                      string   `json:"cveID"`
			VendorProject              string   `json:"vendorProject"`
			Product                    string   `json:"product"`
			VulnerabilityName          string   `json:"vulnerabilityName"`
			DateAdded                  string   `json:"dateAdded"`
			ShortDescription           string   `json:"shortDescription"`
			RequiredAction             string   `json:"requiredAction"`
			DueDate                    string   `json:"dueDate"`
			KnownRansomwareCampaignUse string   `json:"knownRansomwareCampaignUse"`
			Notes                      string   `json:"notes"`
			Cwes                       []string `json:"cwes"`
		} `json:"vulnerabilities"`
	}

	if err := json.Unmarshal(cisaContent, &cisaCatalog); err != nil {
		return err
	}

	// Filter vulnerabilities based on our CVE set
	var filteredVulnerabilities []interface{}
	for _, vuln := range cisaCatalog.Vulnerabilities {
		if cveSet[vuln.CveID] {
			filteredVulnerabilities = append(filteredVulnerabilities, vuln)
		}
	}

	// Create the filtered output structure
	filteredCatalog := map[string]interface{}{
		"title":           cisaCatalog.Title,
		"catalogVersion":  cisaCatalog.CatalogVersion,
		"dateReleased":    cisaCatalog.DateReleased,
		"count":           len(filteredVulnerabilities),
		"vulnerabilities": filteredVulnerabilities,
	}

	// Write the filtered JSON to output file
	outputFile := common.GetFilteredExploitDataFile()
	outputContent, err := json.MarshalIndent(filteredCatalog, "", "  ")
	if err != nil {
		return err
	}

	if err := os.WriteFile(outputFile, outputContent, 0644); err != nil {
		return err
	}

	stats, _ := os.Stat(outputFile)
	logger.Logger.Infof("Filtered CISA catalog created: %s, size: %d bytes", outputFile, stats.Size())
	logger.Logger.Infof("Original exploits: %d, Filtered exploits: %d",
		len(cisaCatalog.Vulnerabilities), len(filteredVulnerabilities))

	return nil
}

// replaceTextByFile replaces occurrences of search_text in the input file with content from replace_file.
func replaceTextByFile(inputFile, searchText, replaceFile string) error {
	replaceContent, err := os.ReadFile(replaceFile)
	if err != nil {
		return fmt.Errorf("could not read file %s: %v", replaceFile, err)
	}
	return replaceTextByText(inputFile, searchText, string(replaceContent))
}

// replaceTextByText replaces occurrences of search_text in the input file with replace_content.
func replaceTextByText(inputFile, searchText, replaceContent string) error {
	file, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("could not open file %s: %v", inputFile, err)
	}
	defer file.Close()

	timestamp := time.Now().Format("2006_01_02_15_04_05_06")
	tempFile, err := os.CreateTemp("", fmt.Sprintf("modified_%s", timestamp))
	if err != nil {
		return fmt.Errorf("could not create temp file: %v", err)
	}

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

	return copyAndRemove(tempFile.Name(), inputFile)
}

func copyAndRemove(src, dst string) error {
	// Open the source file
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("failed to open source file %s: %v", src, err)
	}
	defer sourceFile.Close()

	// Create the destination file
	destFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("failed to create destination file %s: %v", dst, err)
	}
	defer destFile.Close()

	// Copy the contents
	if _, err := io.Copy(destFile, sourceFile); err != nil {
		return fmt.Errorf("failed to copy contents from %s to %s: %v", src, dst, err)
	}

	// Ensure all data is written to the destination file
	if err := destFile.Sync(); err != nil {
		return fmt.Errorf("failed to sync destination file %s: %v", dst, err)
	}

	// Close the destination file
	if err := destFile.Close(); err != nil {
		return fmt.Errorf("failed to close destination file %s: %v", dst, err)
	}

	// Close the source file
	if err := sourceFile.Close(); err != nil {
		return fmt.Errorf("failed to close source file %s: %v", src, err)
	}

	// Check if the operating system is Windows
	if runtime.GOOS == "windows" {
		// Remove the source file is failing on windows
		return nil
	}

	defer os.Remove(src)
	return nil
}

// generateReportName creates a unique report name based on timestamp if the file already exists.
func generateReportName(reportName string) string {
	if _, err := os.Stat(reportName); os.IsNotExist(err) {
		return reportName // File doesn't exist, return the original name
	}

	// Generate a new report name with a timestamp
	timestamp := time.Now().Format("2006_01_02_15_04_05_06")
	newReportName := strings.Replace(reportName, ".html", fmt.Sprintf("(%s).html", timestamp), 1)
	logger.Logger.Infof("File %s already exists. Using %s instead.\n", reportName, newReportName)

	return newReportName
}

func CombineReports(pluginFlags common.Flags) error {
	logger.Logger.Infoln("Function: combineReports")
	from := pluginFlags["--from"]
	resultFiles := strings.Split(from, ",")
	logger.Logger.Infof("From resultFiles: %v\n", resultFiles)

	var resultFileContents []string

	// Iterate through each file and combine their contents
	for _, file := range resultFiles {
		if _, err := os.Stat(file); err != nil {
			if os.IsNotExist(err) {
				logger.Logger.Infof("File %s does not exist.\n", file)
				return fmt.Errorf("file %s does not exist", file)
			}
			return fmt.Errorf("failed to check file %s: %w", file, err)
		}

		logger.Logger.Infof("Reading contents of %s:\n", file)
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %w", file, err)
		}

		resultFileContents = append(resultFileContents, string(content))
	}

	// Combine contents into a single string
	combinedContent := strings.Join(resultFileContents, ",")

	// Write the combined contents to the result file
	if err := os.WriteFile(common.GetScan2htmlTempReportPath(), []byte(combinedContent), 0644); err != nil {
		return fmt.Errorf("failed to write to file %s: %w", common.GetScan2htmlTempReportPath(), err)
	}

	logger.Logger.Infof("Content written to %s\n", common.GetScan2htmlTempReportPath())
	return nil
}
