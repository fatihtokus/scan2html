# Use the official Trivy image as a base
FROM aquasec/trivy:latest@sha256:53e6715d5c67e80e629f0dfa3bd6ed2bc74bdcaa4bdbe934a5a1811a249db6b9

# Install bash and other required packages
USER root
RUN apk update && apk add --no-cache curl jq bash git

# Set the working directory inside the container
WORKDIR /usr/src/app

COPY results.json .
# Copy the bash script into the container
COPY script.sh .

COPY scan2html.sh .

# Make the script executable - refactor this for golang
RUN chmod +x script.sh

# Make the script executable
RUN chmod +x scan2html.sh

# Run the script
ENTRYPOINT ["./script.sh"]