#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "Creating a release..."

reportTemplate='report_template.html'  # Define the report template file

# Display the current directory
echo "Current directory:"
pwd

# Move up two levels in the directory structure
echo "Moving up two levels..."
cd ../.. || { echo "Failed to navigate to the parent directory"; exit 1; }
pwd

# Check if the report template file exists
if [ ! -f "src/frontend-app/dist/src/assets/app-template.html" ]; then
  echo "Error: app-template.html not found"
  exit 1
fi

# List the contents of the specified directories for debugging purposes
echo "Listing contents of src/frontend-app/dist/src/assets:"
ls src/frontend-app/dist/src/assets

echo "Listing contents of src/frontend-app/dist:"
ls src/frontend-app/dist

echo "Listing contents of current directory:"
ls

# Create the new report template by copying and modifying content
{
  # Copy the report file except the last 4 lines
  sed '$d' src/frontend-app/dist/src/assets/app-template.html

  # Append additional content
  cat src/frontend-app/dist/app.js
  echo ''
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > "$reportTemplate"  # Overwrite the report template with new content

# Display the current directory and list files
echo "Current directory after modification:"
pwd

echo "Files in the current directory:"
ls

# Display the content of the report template
echo "Content of $reportTemplate:"
cat "$reportTemplate"

# Create a tarball with the specified files
echo "Creating tarball scan2html.tar.gz..."
chmod +x scan2html.sh
tar -zcvf scan2html.tar.gz scan2html.sh "$reportTemplate" LICENSE results.json plugin.yaml

# List the contents of the current directory to show the created tarball
echo "Files in the current directory after tarball creation:"
ls
