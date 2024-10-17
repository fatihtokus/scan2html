#!/bin/bash

# help
function help() {
  cat << EOS >&2
scan2html
Usage: trivy scan2html [-h,--help] command target filename
 A Trivy plugin that scans and output the results to a html file.
Options:
  -h, --help    Show usage.
Examples:
  # Scan an image
  trivy scan2html image alpine:latest interactive_result.html

  # Scan an image from local tar file
  trivy scan2html image --input ruby-3.1.tar interactive_report.html

  # Scan a local folder
  trivy scan2html fs --scanners vuln,secret,misconfig . interactive_result.html

  # Scan a k8s cluster
  trivy scan2html k8s cluster interactive_result.html

  # Scan a k8s cluster all
  trivy scan2html k8s --report=all interactive_result.html

  # Scan a k8s cluster summary
  trivy scan2html k8s --report summary cluster interactive_result.html

  # Scan and generate SBOM(spdx) report
  trivy scan2html image --format spdx alpine:3.15 interactive_result.html

  # Generate report from multiple scan results - experimental
  trivy scan2html generate interactive_result.html from vulnerabilities.json misconfigs.json secrets.json

  # Generate report with EPSS scores from multiple scan results - experimental
  trivy scan2html generate --with-epss interactive_result.html from vulnerabilities.json misconfigs.json secrets.json

EOS
  exit
}

function replaceText() {
    echo "function replaceText"
    local input_file="$1"
    local search_text="$2"
    local replace_file="$3"

    # Check if the input file exists
    if [ ! -f "$input_file" ]; then
        echo "Error: Input file '$input_file' not found!"
        return 1
    fi

    # Check if the replace file exists
    if [ ! -f "$replace_file" ]; then
        echo "Error: Replace file '$replace_file' not found!"
        return 1
    fi

    # Temporary file for storing modified content
    local temp_file=$(mktemp)

    # Read the content of the replace file
    local replace_content="$(<"$replace_file")"

    # Loop through each line in the input file
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Check if the line contains the search_text
        if [[ $line == *"$search_text"* ]]; then
            # Extract the part before the search_text
            before=${line%%"$search_text"*}
            # Extract the part after the search_text
            after=${line#*"$search_text"}
            # Combine before, replace_content, and after
            replaced_line="$before$replace_content$after"
        else
            replaced_line="$line"
        fi
        echo "$replaced_line" >> "$temp_file"
    done < "$input_file"

    # Overwrite the input file with the modified content
    mv "$temp_file" "$input_file"

    echo "Replacement complete. Text matching '$search_text' replaced with the content of '$replace_file' in '$input_file'."
}

function generateReportName() {
  echo "function generateReportName" >&2
  local reportName="$1"
  if [ -f $reportName ]; then
    timestamp=$(date +%s)
    timeUserFriendly=$(date +%Y%m%d%H%M%S)
    #Append time to the report name by replacing '.html' with '(<timeStamp>)'
    newReportName=${reportName/.html/($timeUserFriendly)}
    newReportName=$newReportName".html"
    # log as error(>&2) to not affect return value of function!
    echo "$reportName already exists, creating $newReportName instead!" >&2
    reportName="$newReportName"
  fi

  echo "$reportName"
}

function combineReports {
  echo "function combineReports"
  combinedResultFile="$1"
  args=("${@:2:$#0}")
  resultsFiles="${args[@]}"

  echo "combinedResultFile: $combinedResultFile"
  echo "args: $args"
  echo "resultsFiles: $resultsFiles"
  resultFileContents=""

  # Empty results.json file
  echo -n > "$combinedResultFile"

  for file in $resultsFiles; do
    if [[ -f "$file" ]]; then
      echo "Reading contents of $file:"
      resultFileContent=$(cat "$file")
      if [[ -n "$resultFileContents" ]]; then
        resultFileContents+=","
      fi
      resultFileContents+="$resultFileContent"
    else
      echo "File $file does not exist."
      exit 1
    fi
  done

  echo "$resultFileContents" > "$combinedResultFile"
  echo "Content written to $combinedResultFile"
}

function prepareEpssData {
  echo "function prepareEpssData"
  echo "all_params: $@"
  BASEDIR="$1"
  epssData="$2"
  # Prepend the backtick to the first line of the file
  echo -n '`' > "$epssData" && cat "$BASEDIR"/epss_scores.csv >> "$epssData" && echo '`' >> "$epssData"
  #cat $epssData
}

function generateHtmlReport {
  echo "function generateHtmlReport"
  echo "all_params: $@"
  BASEDIR="$1"
  echo "BASEDIR: $BASEDIR"
  reportName="$2"
  echo "reportName: $reportName"
  withEpss="$3"
  echo "withEpss: $withEpss"
  tmp_result="results.json"
  result_json="$BASEDIR"/$tmp_result

  reportName=$(generateReportName "$reportName")

  cat "$BASEDIR"/report_template.html >>"$reportName"


  # Check if the replace file exists
  if [ ! -f "$reportName" ]; then
      echo "Error: reportName: '$reportName' not found!"
      exit 1
  fi

  replaceText "$reportName" "{TEMP_RESULTS:0}" "$result_json"

 if [[ "$withEpss" == "true" ]]; then
    echo "Epss enabled!"
    epssData="$BASEDIR"/epss_scores_tmp.csv
    prepareEpssData "$BASEDIR" "$epssData"
    replaceText "$reportName" "\"TEMP_EPSS_DATA\"" "$epssData"
    echo "Epss imported!"
    trap 'rm -f $epssData' EXIT
  fi

  echo "$reportName has been created!"
}

function generate {
  echo "function generate"
  echo "all_params: $@"
  withEpss=false;
  reportName="$2";
  args=("${@:4:$#0}")
  if [[ "$reportName" == "--with-epss" ]]; then
    withEpss=true
    reportName="$3"
    args=("${@:5}")  # Extract arguments from position 5 onwards
  fi

  echo "reportName: $reportName"
  BASEDIR=$(dirname "$0")
  tmp_result="results.json"
  result_json="$BASEDIR"/$tmp_result
  echo "BASEDIR: $BASEDIR"
  resultsFiles="${args[@]}"
  echo "resultsFiles: $resultsFiles"

  combineReports "$result_json" "$resultsFiles"
  generateHtmlReport "$BASEDIR" "$reportName" "$withEpss"
  
  exit
}

function scan {
  echo "function scan"
  tmp_result="results.json"
  BASEDIR=$(dirname "$0")
  args=("${@:2:$#-2}")
  reportName="${!#}"
  echo "reportName: $reportName"
  scanner="$1"
  echo "scanner: $scanner"
  set -- "$1" "${args[@]}" "$reportName"
  echo "BASEDIR: $BASEDIR"
  echo "all_params: $@"
  echo "args: $args"
  echo "reportName: $reportName"
  allParamsExceptTrivy="${args[@]}"
  echo "allParamsExceptTrivy: $allParamsExceptTrivy"

  result_json="$BASEDIR"/$tmp_result
  output="-o $result_json"
  echo "output: $output"

  # create an empty results.json file
  echo -n > "$result_json"

  outputFormat="--format json"
  echo "outputFormat: $outputFormat"

  if [[ $allParamsExceptTrivy == *"--format spdx"* ]]; then
      echo "It's an SBOM report!"
      # Removing --format spdx from the params
      allParamsExceptTrivy=${allParamsExceptTrivy/--format spdx/}
      echo "allParamsExceptTrivy: $allParamsExceptTrivy"
      outputFormat="--format spdx-json"
  fi

  trivy="trivy"
  if  command -v ./trivy &> /dev/null; then
      echo "'./trivy' command is found so it will be used instead of 'trivy'"
      trivy="./trivy"
  fi
  echo "Executing following command"
  echo "$trivy $scanner $allParamsExceptTrivy $outputFormat $output"
  $trivy $scanner $allParamsExceptTrivy $outputFormat $output
  exit_code=$?
  echo "Exit code $exit_code"
  generateHtmlReport "$BASEDIR" "$reportName" 
  trap 'rm -f $tmp_result' EXIT
  exit $exit_code
}

if [[ ($# -eq 0) || ($1 == "--help") || ($1 == "-h") ]]; then
  help
fi

if [[ ($1 == "generate") ]]; then
  generate "$@"
fi

# comment out following line for testing
 scan "$@"

# uncomment following lines for testing
#report_template="$1"
#result_json="$2"
#report_name=$(generateReportName "$3")
#echo "Generating Report: $report_name"
#cat "$report_template" >>"$report_name"
#replace_text "$report_name" "{TEMP_DATA:_7}" "$result_json"
## regex didn't work
## replace_text "$report_name" "\{TEMP_DATA:(.)++\}" "$result_json"
#echo "Generated Report: $report_name"