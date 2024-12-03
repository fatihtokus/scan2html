package epss

import (
	"compress/gzip"
	"fmt"
	"io"
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
	fmt.Printf("Downloading EPSS Scores from: %s\n", epssDownloadUrl)

	// Perform the HTTP GET request
	resp, err := http.Get(epssDownloadUrl)
	if err != nil {
		return "", fmt.Errorf("failed to download EPSS data: %w", err)
	}
	defer func() {
		if cerr := resp.Body.Close(); cerr != nil {
			fmt.Printf("Warning: failed to close response body: %v\n", cerr)
		}
	}()

	// Check HTTP response status
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected HTTP status: %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
	}

	// Create the temporary compressed file
	outFile, err := os.Create(tmpEpssGZFilepath)
	if err != nil {
		return "", fmt.Errorf("failed to create file %s: %w", tmpEpssGZFilepath, err)
	}
	defer func() {
		if cerr := outFile.Close(); cerr != nil {
			fmt.Printf("Warning: failed to close output file: %v\n", cerr)
		}
	}()

	// Copy the response body to the compressed file
	if _, err = io.Copy(outFile, resp.Body); err != nil {
		return "", fmt.Errorf("failed to write response body to file: %w", err)
	}

	fmt.Printf("EPSS data downloaded to: %s\n", tmpEpssGZFilepath)

	// Open the compressed file for reading
	gzFile, err := os.Open(tmpEpssGZFilepath)
	if err != nil {
		return "", fmt.Errorf("failed to open compressed file %s: %w", tmpEpssGZFilepath, err)
	}
	defer func() {
		if cerr := gzFile.Close(); cerr != nil {
			fmt.Printf("Warning: failed to close compressed file: %v\n", cerr)
		}
	}()

	// Create a GZIP reader
	gzReader, err := gzip.NewReader(gzFile)
	if err != nil {
		return "", fmt.Errorf("failed to create GZIP reader: %w", err)
	}
	defer func() {
		if cerr := gzReader.Close(); cerr != nil {
			fmt.Printf("Warning: failed to close GZIP reader: %v\n", cerr)
		}
	}()

	// Create the uncompressed file
	uncompressedFile, err := os.Create(tmpEpssFilepath)
	if err != nil {
		return "", fmt.Errorf("failed to create uncompressed file %s: %w", tmpEpssFilepath, err)
	}
	defer func() {
		if cerr := uncompressedFile.Close(); cerr != nil {
			fmt.Printf("Warning: failed to close uncompressed file: %v\n", cerr)
		}
	}()

	// Copy the decompressed data to the uncompressed file
	if _, err = io.Copy(uncompressedFile, gzReader); err != nil {
		return "", fmt.Errorf("failed to write decompressed data to file: %w", err)
	}

	// Add backticks to the beginning and end of the file
	if err := addBackticksToFile(tmpEpssFilepath); err != nil {
		return "", fmt.Errorf("failed to add backticks to file: %w", err)
	}

	fmt.Printf("Unzipped and modified EPSS data saved to: %s\n", tmpEpssFilepath)
	return tmpEpssFilepath, nil
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