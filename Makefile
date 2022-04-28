all:
	docker build -t twilio_server .
	docker run -t twilio_server