#!/bin/bash
set -e

echo "Updating package lists and installing required packages..."
apk update && apk add --no-cache curl jq bash git

echo "Fetching the latest version of Trivy..."
TRIVY_VERSION=$(curl -s "https://api.github.com/repos/aquasecurity/trivy/releases/latest" | grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/')
echo "Installing Trivy version $TRIVY_VERSION..."
#wget https://github.com/aquasecurity/trivy/releases/download/v$TRIVY_VERSION/trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz
#tar zxvf trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz
#mv trivy /usr/local/bin/

echo "Listing Trivy plugins..."
trivy plugin list

echo "Installing the scan2html plugin..."
trivy plugin install github.com/fatihtokus/scan2html

echo "Listing Trivy plugins again to confirm installation..."
trivy plugin list

echo "Listing files in the current directory..."
ls



echo "Listing files in the current directory again... /root/.trivy/plugins/"
ls /root/.trivy/plugins/

ls ../../../root/.trivy/plugins/scan2html

mv scan2html.sh ../../../root/.trivy/plugins/scan2html
rm ../../../root/.trivy/plugins/scan2html/results.json
mv results.json ../../../root/.trivy/plugins/scan2html
printf "Checking directory %s with Trivy\n" .
# Uncomment the next line if you want to clone the repository
# echo "Cloning the scan2html-test repository..."
git clone --branch test-issue-47 "https://gitlab.com/fatih.tokus/scan2html-test.git"
#trivy fs --scanners vuln,misconfig --exit-code 0 . --format json -o result.json
#cat result.json
trivy scan2html fs --scanners vuln,misconfig --exit-code 0 . --format json report.html
output_dir=/usr/src/app/report
pwd
mkdir -p $output_dir
#cat report.html
mv report.html $output_dir
