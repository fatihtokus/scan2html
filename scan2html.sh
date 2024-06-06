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

  # Scan a local folder
  trivy scan2html fs --scanners vuln,secret,misconfig . interactive_result.html

  # Scan a k8s cluster
  trivy scan2html k8s cluster interactive_result.html

  # Scan a k8s cluster all
  trivy scan2html k8s --report=all all interactive_result.html

  # Scan a k8s cluster summary
  trivy scan2html k8s --report summary cluster interactive_result.html

  # Scan and generate SBOM(spdx) report
  trivy scan2html image --format spdx alpine:3.15 interactive_result.html

EOS
  exit
}

function replace_text() {
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

    # echo "Replacement complete. Text matching '$search_text' replaced with the content of '$replace_file' in '$input_file'."
}

function generateReportName() {
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

function scan {
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

  output="-o $BASEDIR/$tmp_result"
  echo "output: $output"

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
  reportName=$(generateReportName "$reportName")

  cat "$BASEDIR"/report_template.html >>"$reportName"

   # Check if the replace file exists
    if [ ! -f "$reportName" ]; then
        echo "Error: reportName: '$reportName' not found!"
        return 1
    fi

   result_json="$BASEDIR"/$tmp_result

   # Check if the replace file exists
    if [ ! -f "$result_json" ]; then
        echo "Error: result_json: '$result_json' not found!"
        return 1
    fi

    # Using replace_text function
   replace_text "$reportName" "{TEMP_DATA:sV}" "$result_json"

  echo "$reportName has been created!"
  trap 'rm -f $tmp_result' EXIT
  exit $exit_code
}

if [[ ($# -eq 0) || ($1 == "--help") || ($1 == "-h") ]]; then
  help
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