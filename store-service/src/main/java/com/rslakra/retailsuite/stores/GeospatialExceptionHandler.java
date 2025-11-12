package com.rslakra.retailsuite.stores;

import org.springframework.data.mongodb.UncategorizedMongoDbException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.mongodb.MongoQueryException;

/**
 * Exception handler for geospatial query errors.
 * 
 * @author Rohtash Lakra
 */
@ControllerAdvice
public class GeospatialExceptionHandler {

    @ExceptionHandler(UncategorizedMongoDbException.class)
    public ResponseEntity<String> handleMongoException(UncategorizedMongoDbException e) {
        Throwable cause = e.getCause();
        
        if (cause instanceof MongoQueryException) {
            MongoQueryException mongoEx = (MongoQueryException) cause;
            String errorMessage = mongoEx.getErrorMessage();
            
            if (errorMessage != null) {
                if (errorMessage.contains("out of bounds for spherical query")) {
                    return ResponseEntity.badRequest()
                        .body("Invalid coordinates: Coordinates must be within valid bounds (longitude: -180 to 180, latitude: -90 to 90)");
                }
                if (errorMessage.contains("unable to find index for $geoNear query")) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Geospatial index not found. Please ensure the index is created on 'address.location' field.");
                }
            }
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Database error: " + e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

