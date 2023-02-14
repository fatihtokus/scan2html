#!/bin/bash

# help
function help() {
  cat << EOS >&2
scan2html v0.0.1

Usage: trivy scan2html [-h,--help] command target filename
 A Trivy plugin that scans and output the results to a html file.
Options:
  -h, --help    Show usage.
Examples:
  # Scan `alpine:latest` image
  trivy scan2html image alpine:latest result.html

  # Scan local folder
  trivy scan2html fs . result.html
EOS
  exit
}

function scan {
  BASEDIR=$(dirname "$0")
  trivy $1 --format template --template @$BASEDIR/html.tpl --output $3 $2
}

if [[ ($# -eq 0) || ($1 == "--help") || ($1 == "-h") ]]; then
  help
fi

scan "$@"
