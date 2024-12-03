package common

import (
	"reflect"
	"testing"
)

func TestRetrievePluginFlagsAndCommand2(t *testing.T) {
	tests := []struct {
		name         string
		args         []string
		wantPlugin   Flags
		wantTrivyCmd []string
	}{
		{
			name: "All plugin flags",
			args: []string{"ingored_flag", "image", "--format", "spdx", "ghcr.io/zalando/spilo-15:3.0-p1", "--scan2html-flags", "--output", "interactive_report.html", "--report-title", "Trivy Report Test", "--with-epss"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--output":          "interactive_report.html",
				"--report-title":    "Trivy Report Test",
			},
			wantTrivyCmd: []string{"image", "--format", "spdx", "ghcr.io/zalando/spilo-15:3.0-p1"},
		},
		{
			name: "Smoke Test - 1 : File scanning",
			args: []string{"ingored_flag", "fs", "--scanners", "vuln,secret,misconfig", ".", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"fs", "--scanners", "vuln,secret,misconfig", "."},
		},
		{
			name: "Smoke Test - 2 : K8s cluster scanning",
			args: []string{"ingored_flag", "k8s", "cluster", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster"},
		},
		{
			name: "Smoke Test - 3 : K8s scanning all",
			args: []string{"ingored_flag", "k8s", "--report=all", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "--report=all"},
		},
		{
			name: "Smoke Test - 4 : K8s cluster summary scanning",
			args: []string{"ingored_flag", "k8s", "--report", "summary", "cluster", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "--report", "summary", "cluster"},
		},
		{
			name: "Smoke Test - 5 : Image scanning for SPDX",
			args: []string{"ingored_flag", "image", "--format", "spdx", "alpine:3.15", "--scan2html-flags", "--output", "interactive_report.html"},

			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--output":          "interactive_report.html",
			},
			wantTrivyCmd: []string{"image", "--format", "spdx", "alpine:3.15"},
		},
		{
			name: "Smoke Test - 6 : Generate report from json results",
			args: []string{"ingored_flag", "generate", "--scan2html-flags", "--with-epss", "--output", "interactive_report.html", "--from", "vulnerabilities.json,misconfigs.json,secrets.json"},

			wantPlugin: Flags{
				"generate":          "",
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--output":          "interactive_report.html",
				"--from":            "vulnerabilities.json,misconfigs.json,secrets.json",
			},
			wantTrivyCmd: []string{},
		},
		{
			name: "Only boolean plugin flags",
			args: []string{"ingored_flag", "k8s", "cluster", "--scan2html-flags", "--with-epss"},
			wantPlugin: Flags{
				"--scan2html-flags": "",
				"--with-epss":       "",
				"--output":          "cluster",
			},
			wantTrivyCmd: []string{"k8s"},
		},
		{
			name: "Boolean and value flags",
			args: []string{"ingored_flag", "k8s", "cluster", "--with-epss", "--output", "report.html"},
			wantPlugin: Flags{
				"--with-epss": "",
				"--output":    "report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster"},
		},
		{
			name: "Missing --scan2html-flags - depricated usage",
			args: []string{"ingored_flag", "k8s", "cluster", "interactive_report.html"},

			wantPlugin: Flags{
				"--output": "interactive_report.html",
			},
			wantTrivyCmd: []string{"k8s", "cluster"},
		},
		{
			name: "Unknown flags treated as Trivy command",
			args: []string{"ingored_flag", "--unknown-flag", "scan"},
			wantPlugin: Flags{
				"--output": "scan",
			},
			wantTrivyCmd: []string{
				"--unknown-flag",
			},
		},
		{
			name: "Mixed plugin and Trivy flags",
			args: []string{"ingored_flag", "--with-epss", "--unknown-flag", "scan", "--output", "report.html"},
			wantPlugin: Flags{
				"--with-epss": "",
				"--output":    "report.html",
			},
			wantTrivyCmd: []string{
				"--unknown-flag",
				"scan",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotPlugin, gotTrivyCmd := RetrievePluginFlagsAndCommand(tt.args)
			if !reflect.DeepEqual(gotPlugin, tt.wantPlugin) {
				t.Errorf("RetrievePluginFlagsAndCommand() gotPlugin = %v, want %v", gotPlugin, tt.wantPlugin)
			}
			if !reflect.DeepEqual(gotTrivyCmd, tt.wantTrivyCmd) {
				t.Errorf("RetrievePluginFlagsAndCommand() gotTrivyCmd = %v, want %v", gotTrivyCmd, tt.wantTrivyCmd)
			}
		})
	}
}