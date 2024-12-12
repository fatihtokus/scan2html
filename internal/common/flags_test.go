package common

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestRetrievePluginFlagsAndCommand(t *testing.T) {
	// Get the system temporary directory and expected report path
	tempDir := os.TempDir()
	expectedTempReportPath := filepath.Join(tempDir, "scan2html-temp-report.json")

	tests := []struct {
		name         string
		args         []string
		wantPlugin   Flags
		wantTrivyCmd []string
	}{
		{
			name: "All plugin flags",
			args: []string{"ignored_flag", "image", "ghcr.io/zalando/spilo-15:3.0-p1", "--scan2html-flags", "--output", "interactive_report.html", "--report-title", "Trivy Report Test", "--with-epss"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--output":          "interactive_report.html",
				"--report-title":    "Trivy Report Test",
			},
			wantTrivyCmd: []string{"image", "ghcr.io/zalando/spilo-15:3.0-p1", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 1 : File scanning",
			args: []string{"ingored_flag", "fs", "--scanners", "vuln,secret,misconfig", ".", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"fs", "--scanners", "vuln,secret,misconfig", ".", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 2 : K8s cluster scanning",
			args: []string{"ingored_flag", "k8s", "cluster", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 3 : K8s scanning all",
			args: []string{"ingored_flag", "k8s", "--report=all", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "--report=all", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 4 : K8s cluster summary scanning",
			args: []string{"ingored_flag", "k8s", "--report", "summary", "cluster", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "--report", "summary", "cluster", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 5 : Image scanning for SPDX",
			args: []string{"ingored_flag", "image", "--format", "spdx", "alpine:3.15", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"image", "--format", "spdx-json", "alpine:3.15", "--output", expectedTempReportPath},
		},
		{
			name: "Smoke Test - 6 : Generate report from json results",
			args: []string{"ingored_flag", "generate", "--scan2html-flags", "--with-epss", "--output", "interactive_report.html", "--from", "vulnerabilities.json,misconfigs.json,secrets.json"},

			wantPlugin: Flags{
				"generate":          "",
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--report-title":    "Trivy Report",
				"--output":          "interactive_report.html",
				"--from":            "vulnerabilities.json,misconfigs.json,secrets.json",
			},
			wantTrivyCmd: []string{"--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Only boolean plugin flags",
			args: []string{"ingored_flag", "k8s", "cluster", "--scan2html-flags", "--with-epss"},
			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--report-title":    "Trivy Report",
				"--output":          "cluster",
			},
			wantTrivyCmd: []string{"k8s", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Boolean and value flags",
			args: []string{"ingored_flag", "k8s", "cluster", "--with-epss", "--output", "report.html"},
			wantPlugin: Flags{
				"--with-epss":    "",
				"--report-title": "Trivy Report",
				"--output":       "report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Missing --scan2html-flags - depricated usage",
			args: []string{"ingored_flag", "k8s", "cluster", "interactive_report.html"},

			wantPlugin: Flags{
				"--report-title": "Trivy Report",
				"--output":       "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster", "--format", "json", "--output", expectedTempReportPath},
		},
		{
			name: "Unknown flags treated as Trivy command",
			args: []string{"ingored_flag", "--unknown-flag", "scan"},
			wantPlugin: Flags{
				"--report-title": "Trivy Report",
				"--output":       "scan",
			},
			wantTrivyCmd: []string{
				"--unknown-flag", "--format", "json", "--output", expectedTempReportPath,
			},
		},
		{
			name: "Mixed plugin and Trivy flags",
			args: []string{"ingored_flag", "--with-epss", "--unknown-flag", "scan", "--output", "report.html"},
			wantPlugin: Flags{
				"--with-epss":    "",
				"--report-title": "Trivy Report",
				"--output":       "report.html",
			},
			wantTrivyCmd: []string{
				"--unknown-flag",
				"scan", "--format", "json", "--output", expectedTempReportPath,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotPlugin, gotTrivyCmd := RetrievePluginFlagsAndCommand(tt.args)

			// Check plugin flags
			if !reflect.DeepEqual(gotPlugin, tt.wantPlugin) {
				t.Errorf("RetrievePluginFlagsAndCommand() gotPlugin = %v, want %v", gotPlugin, tt.wantPlugin)
			}

			// Check Trivy command flags
			if !reflect.DeepEqual(gotTrivyCmd, tt.wantTrivyCmd) {
				t.Errorf("RetrievePluginFlagsAndCommand() gotTrivyCmd = %v, want %v", gotTrivyCmd, tt.wantTrivyCmd)
			}
		})
	}
}