# Use the official Trivy image as a base
FROM aquasec/trivy:latest

# Install bash and other required packages
USER root
RUN apk update && apk add --no-cache curl jq bash git

# Set the working directory inside the container
WORKDIR /usr/src/app

COPY results.json .
# Copy the bash script into the container
COPY script.sh .

COPY scan2html.sh .

# Make the script executable
RUN chmod +x script.sh

# Make the script executable
RUN chmod +x scan2html.sh

# Run the script
ENTRYPOINT ["./script.sh"]