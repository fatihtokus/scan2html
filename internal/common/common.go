package common

import (
	"fmt"
	"os"
	"path/filepath"
)

func GetPathToPluginDir() (string, error) {
	ex, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	return filepath.Dir(ex), nil
}

func GetPathToPluginDirFor(fileName string) (string, error) {
	dir, _ := GetPathToPluginDir()
	return filepath.Join(dir, fileName), nil
}

func ReadPluginFile(fileName string) ([]byte, error) {
	path, err := GetPathToPluginDirFor(fileName)
	if err != nil {
		return nil, err
	}

	return os.ReadFile(path)
}

func GetScan2htmlTempReportPath() string {
	return filepath.Join(os.TempDir(), "scan2html-temp-report.json")
}

func GetCachedEPSSDataFile() (string, error) {
	path, _ := GetPathToPluginDirFor("epss_scores-current.csv")
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", fmt.Errorf("cached EPSS data file does not exist at %s", path)
	}
	return path, nil
}

func GetCachedExploitDataFile() (string, error) {
	path, _ := GetPathToPluginDirFor("known_exploited_vulnerabilities.json")
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", fmt.Errorf("cached Exploit data file does not exist at %s", path)
	}
	return path, nil
}