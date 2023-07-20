FROM alpine:latest
RUN apk add --no-cache socat
CMD ["socat", "TCP-LISTEN:30003,fork,reuseaddr", "TCP:fr24-bc6a29c4a08a:30003"]

