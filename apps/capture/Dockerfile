# Use a base image with necessary tools
FROM alpine:latest

# Install dependencies
RUN apk add --no-cache netcat-openbsd coreutils dcron

# Copy the script to capture and store the data
COPY capture.sh /capture.sh
RUN chmod +x /capture.sh

# Copy the cronjob script
COPY cronjob.sh /cronjob.sh
RUN chmod +x /cronjob.sh

# Add cronjob entry
RUN echo "0 0 * * * /cronjob.sh" > /crontab.txt
RUN crontab /crontab.txt

# Create the data directory
RUN mkdir /data

RUN touch /data/adsb.csv

# Set environment variable for hosts
ENV HOSTS ""

# Start the cron service and the script with the passed hosts
CMD ["sh", "-c", "echo \"$HOSTS\" | tr ',' '\n' > /data/hosts.txt && (/capture.sh &) && crond -f"]
