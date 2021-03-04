# Booking Microservice 

This Microservice is responsible for managing the bookings in the Utopia Airline. It exposes some REST APIs to its consumers. 

## API EXAMPLE

`GET /api/bookings/?queryParams`

## AUTHENTICATION

Most of the end-points in this microservice requires users to be logged in. Authentication is implemented using JWT Token authentication. In order to login(Get a valid token) you need to consume the `auth` microservice first. 