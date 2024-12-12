#!/bin/bash

# help
function help() {
  cat << EOS >&2
scan2html
Usage: trivy scan2html [-h,--help] command target filename
 A Trivy plugin that scans and output the results to a html file.
Usage: trivy scan2html [-h,--help] command target filename
  trivy scan2html <trivy [global flags] command [flags] target> --scan2html-flags [scan2html flags]
  trivy scan2html generate --scan2html-flags [scan2html flags]

Utility Commands
  generate    Generate a report from multiple json scan results
  help        Help about any command
  version     Print the version

Flags:
  -h, --help      Show usage.
  --output        Report name
  --report-title  Report title
  --with-epss     Include EPSS data
  --from          Comma separated json scan result files

Examples:
   # Scan an image
  trivy scan2html image alpine:latest --scan2html-flags --output interactive_report.html

  # Scan an image from local tar file
  trivy scan2html image --input ruby-3.1.tar --scan2html-flags --output interactive_report.html

  # Scan a local folder
  trivy scan2html fs --scanners vuln,secret,misconfig . --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster
  trivy scan2html k8s cluster --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster all
  trivy scan2html k8s --report=all --scan2html-flags --output interactive_report.html

  # Scan a k8s cluster summary
  trivy scan2html k8s --report summary cluster --scan2html-flags --output interactive_report.html

  # Scan and generate SBOM(spdx) report
  trivy scan2html image --format spdx alpine:3.15 --scan2html-flags --output interactive_report.html

  # Generate a report from multiple json scan results - experimental
  trivy scan2html generate --scan2html-flags --output interactive_report.html --from vulnerabilities.json,misconfigs.json,secrets.json

  # Generate report with EPSS scores from multiple scan results - experimental
  trivy scan2html generate --scan2html-flags --with-epss --output interactive_report.html --from vulnerabilities.json,misconfigs.json,secrets.json


EOS
  exit
}

function replaceTextByText() {
    echo "function replaceTextByText"
    local input_file="$1"
    local search_text="$2"
    local replace_content="$3"

    # Check if the input file exists
    if [ ! -f "$input_file" ]; then
        echo "Error: Input file '$input_file' not found!"
        return 1
    fi


    # Temporary file for storing modified content
    local temp_file=$(mktemp)


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

    echo "Replacement complete. Text matching '$search_text' replaced with the content in '$input_file'."
}

function replaceTextByFile() {
    echo "function replaceTextByFile"
    local input_file="$1"
    local search_text="$2"
    local replace_file="$3"

    # Check if the replace file exists
    if [ ! -f "$replace_file" ]; then
        echo "Error: Replace file '$replace_file' not found!"
        return 1
    fi

    # Temporary file for storing modified content
    local temp_file=$(mktemp)

    # Read the content of the replace file
    local replace_content="$(<"$replace_file")"

    replaceTextByText "$input_file" "$search_text" "$replace_content"
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

    FILENAME="epss_scores-current.csv.gz"
    FILENAMECSV="epss_scores-current.csv"

    if [ -f "$BASEDIR/$FILENAME" ]; then
      echo "Deleting existing file: $BASEDIR/$FILENAME"
      rm -f "$BASEDIR/$FILENAME"
    fi
    EPSS_URL="https://epss.cyentia.com"
    echo "Downloading EPSS Scores from: $EPSS_URL/$FILENAME"

    # Download the file directly to the target directory
    curl --progress-bar --max-time 60 -L -o "$BASEDIR/$FILENAME" $EPSS_URL/$FILENAME

    # Check if the download succeeded and if the file size is non-zero
    if [ $? -eq 0 ] && [ -s "$BASEDIR/$FILENAME" ]; then
        echo "Download completed. Decompressing file..."
        # Check if the file already exists and delete it
        if [ -f "$BASEDIR/$FILENAMECSV" ]; then
          echo "Deleting existing file: $BASEDIR/$FILENAMECSV"
          rm -f "$BASEDIR/$FILENAMECSV"
        fi
        gzip -d "$BASEDIR/$FILENAME"
        trap 'echo "Cleaning up: $BASEDIR/$FILENAME"; rm -f "$BASEDIR/$FILENAME"' EXIT
        trap 'echo "Cleaning up: $BASEDIR/$FILENAMECSV"; rm -f "$BASEDIR/$FILENAMECSV"' EXIT
    else
        echo "Downloading EPSS Scores failed or file is empty: $EPSS_URL/$FILENAME"
    fi

    # Prepend the backtick to the first line of the file
    echo -n '`' > "$epssData" && cat "$BASEDIR/$FILENAMECSV" >> "$epssData" && echo '`' >> "$epssData"
}

function generateHtmlReport {
  echo "function generateHtmlReport"

  # Assign and echo parameters for clarity
  base_dir="$1"
  with_epss="$2"
  report_title="$3"
  report_name="$4"
  echo "Base Directory: $base_dir"
  echo "With EPSS: $with_epss"
  echo "Report Title: $report_title"
  echo "Report Name: $report_name"

  tmp_result="results.json"
  result_json="$base_dir/$tmp_result"

  # Generate report name
  report_name=$(generateReportName "$report_name")

  # Append report template to the report file
  cat "$base_dir/report_template.html" >> "$report_name"

  # Check if the report file was created successfully
  if [ ! -f "$report_name" ]; then
      echo "Error: Report file '$report_name' not found!"
      exit 1
  fi

  # Replace placeholders with actual content
  replaceTextByText "$report_name" "{REPORT_TITLE:\"Temp Trivy Report\"}" "{REPORT_TITLE:'$report_title'}"
  replaceTextByFile "$report_name" "{TEMP_RESULTS:0}" "$result_json"

  # Handle EPSS data if enabled
  if [[ "$with_epss" == "true" ]]; then
    echo "EPSS enabled!"
    epss_data="$base_dir/epss_scores_tmp.csv"
    prepareEpssData "$base_dir" "$epss_data"
    replaceTextByFile "$report_name" "\"TEMP_EPSS_DATA\"" "$epss_data"
    echo "EPSS data imported!"
    trap 'rm -f $epss_data' EXIT
  fi

  echo "$report_name has been created successfully!"
}

# Global variables
with_epss="false"
report_title="Trivy Report"
output_file=""
before_args=()
after_args=()
input_files=()

# Function to parse the arguments
function parseArguments {
  scan2html_flags=false

  while [[ $# -gt 0 ]]; do
    arg="$1"
    if [[ $scan2html_flags == true ]]; then
      # Process arguments after --scan2html-args
      case "$arg" in
        --with-epss)
          with_epss="true"
          shift
          ;;
        --report-title)
          report_title="$2"
          shift 2  # Skip the value of --report-title
          ;;
        --output)
          output_file="$2"
          shift 2  # Skip the value of --output
          ;;
        --from)
          # Split comma-separated list into an array
          IFS=',' read -ra input_files <<< "$2"
          shift 2 # Skip the value of --from
          ;;
        *)
          echo "Unknown option after --scan2html-args: $arg"
          exit 1
          ;;
      esac
    elif [[ $arg == "--scan2html-flags" ]]; then
      # Switch flag when --scan2html-flags is encountered
      scan2html_flags=true
      shift
    else
      # Arguments before --scan2html-flags
      before_args+=("$arg")
      shift
    fi
  done

   if [[ $scan2html_flags == false ]]; then
    echo "Deprecated use of scan2html plugin. Please, refer to help to see the new usage!"
    # Get the last argument as the report name
    output_file=${before_args[${#before_args[@]}-1]}
    before_args=("${before_args[@]:0:${#before_args[@]}-1}")
  fi
}

# Main generate function
function generate {
  echo "function generate"
  echo "all_params: $@"

  # Call parseArguments with the remaining arguments
  parseArguments "$@"

  # Output parsed values for debugging
  echo "With EPSS: $with_epss"
  echo "Report Title: $report_title"
  echo "Output File: $output_file"
  echo "Input Files: ${input_files[@]}"

  # Directory and result file setup
  base_dir=$(dirname "$0")
  tmp_result="results.json"
  result_json="$base_dir/$tmp_result"

  # Combine reports using the input files
  combineReports "$result_json" "${input_files[@]}"

  # Generate HTML report with parsed parameters
  generateHtmlReport "$base_dir" "$with_epss" "$report_title" "$output_file"

  exit_code=$?
  echo "Exit code $exit_code"
  exit $exit_code
}


function scan {
  echo "function scan"

  # Define paths and initial variables
  tmp_result="results.json"
  base_dir=$(dirname "$0")
  result_json="$base_dir/$tmp_result"
  output="-o $result_json"
  output_format="--format json"

  # Call parseArguments with all script arguments
  parseArguments "$@"


  # Output parsed values for debugging
  allParamsExceptTrivy=${before_args[@]}
  echo "Trivy Args: $allParamsExceptTrivy"
  echo "Scan2html Args:"
  echo "With EPSS: $with_epss"
  echo "Report Title: $report_title"
  echo "Output File: $output_file"

  outputFormat="--format json"
  echo "outputFormat: $outputFormat"

  if [[ $allParamsExceptTrivy == *"--format spdx"* ]]; then
      echo "It's an SBOM report!"
      # Removing --format spdx from the params
      allParamsExceptTrivy=${allParamsExceptTrivy/--format spdx/}
      echo "allParamsExceptTrivy: $allParamsExceptTrivy"
      outputFormat="--format spdx-json"
  fi

  # Check if a local `trivy` command exists
  trivy="trivy"
  if command -v ./trivy &> /dev/null; then
    trivy="./trivy"
  fi

  # Execute the trivy command with before_args and output options
  echo "Executing command:"
  echo "$trivy $allParamsExceptTrivy $output_format $output"
  $trivy $allParamsExceptTrivy $output_format $output
  exit_code=$?

  # Generate the HTML report
  generateHtmlReport "$base_dir" "$with_epss" "$report_title" "$output_file"
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