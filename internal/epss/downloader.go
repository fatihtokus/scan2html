package epss

import (
	"compress/gzip"
	"fmt"
	"io"
	"scan2html/internal/logger"
	"net/http"
	"os"
	"path/filepath"
)

// prepareEpssData downloads the EPSS dataset, saves it as a temporary file,
// decompresses it, adds backticks at the start and end, and returns the final file path.
func PrepareEpssData() (string, error) {
	const (
		epssURL        = "https://epss.cyentia.com"
		epssGZFileName = "epss_scores-current.csv.gz"
		epssFileName   = "epss_scores-current.csv"
	)

	// Define paths for the compressed and uncompressed files
	tmpEpssGZFilepath := filepath.Join(os.TempDir(), epssGZFileName)
	tmpEpssFilepath := filepath.Join(os.TempDir(), epssFileName)
	epssDownloadUrl := fmt.Sprintf("%s/%s", epssURL, epssGZFileName)
	logger.Logger.Infof("Downloading EPSS Scores from: %s\n", epssDownloadUrl)

	if err := DownloadFile(epssDownloadUrl, tmpEpssGZFilepath); err != nil {
		return "", err
	}
	logger.Logger.Infof("EPSS data downloaded to: %s\n", tmpEpssGZFilepath)

	if err := DecompressFile(tmpEpssGZFilepath, tmpEpssFilepath); err != nil {
		return "", err
	}

	stats, _ := os.Stat(tmpEpssFilepath)
	logger.Logger.Infof("File decompressed successfully to %s with size of: %d bytes\n", tmpEpssFilepath, stats.Size())

	// Add backticks to the beginning and end of the file
	if err := addBackticksToFile(tmpEpssFilepath); err != nil {
		return "", fmt.Errorf("failed to add backticks to file: %w", err)
	}

	logger.Logger.Infof("Unzipped and modified EPSS data saved to: %s\n", tmpEpssFilepath)
	return tmpEpssFilepath, nil
}

// DecompressFile decompresses a GZIP file and writes the decompressed content to the specified destination.
func DecompressFile(gzFilepath, outputFilepath string) error {
	// Open the compressed file
	gzFile, err := os.Open(gzFilepath)
	if err != nil {
		return fmt.Errorf("failed to open compressed file %s: %w", gzFilepath, err)
	}
	defer gzFile.Close()

	// Create a GZIP reader
	gzReader, err := gzip.NewReader(gzFile)
	if err != nil {
		return fmt.Errorf("failed to create GZIP reader: %w", err)
	}
	defer gzReader.Close()

	// Create the output file
	outputFile, err := os.Create(outputFilepath)
	if err != nil {
		return fmt.Errorf("failed to create output file %s: %w", outputFilepath, err)
	}
	defer outputFile.Close()

	// Copy decompressed data to the output file
	if _, err := io.Copy(outputFile, gzReader); err != nil {
		return fmt.Errorf("failed to write decompressed data: %w", err)
	}

	return nil
}

// DownloadFile downloads a file from a given URL and saves it to the specified path.
func DownloadFile(url, filepath string) error {
	// Perform the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	// Check HTTP response status
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected HTTP status: %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
	}

	// Create the destination file
	outFile, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", filepath, err)
	}
	defer outFile.Close()

	// Copy the response body to the destination file
	_, err = io.Copy(outFile, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write response body to file: %w", err)
	}

	return nil
}

// addBackticksToFile adds backticks to the start and end of the specified file.
func addBackticksToFile(filepath string) error {
	// Read the existing file contents
	content, err := os.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %w", filepath, err)
	}

	// Create the new content with backticks
	newContent := fmt.Sprintf("`%s`", content)

	// Write the modified content back to the file
	if err := os.WriteFile(filepath, []byte(newContent), 0644); err != nil {
		return fmt.Errorf("failed to write updated file %s: %w", filepath, err)
	}

	return nil
}
