package common

import (
	"fmt"
	"os"
	"path/filepath"
)

func GetPathToPluginDir(fileName string) (string, error) {
	ex, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	return filepath.Join(filepath.Dir(ex), fileName), nil
}

func ReadPluginFile(fileName string) ([]byte, error) {
	path, err := GetPathToPluginDir(fileName)
	if err != nil {
		return nil, err
	}

	return os.ReadFile(path)
}

func GetScan2htmlTempReportPath() string {
	return filepath.Join(os.TempDir(), "scan2html-temp-report.json")
}
