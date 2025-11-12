package com.rslakra.retailsuite.stores;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.geo.Point;
import org.springframework.stereotype.Component;

/**
 * Custom converter for Point that validates coordinates.
 * Handles both "latitude,longitude" and "longitude,latitude" formats.
 * 
 * @author Rohtash Lakra
 */
@Component
public class PointConverter implements Converter<String, Point> {

    @Override
    public Point convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            throw new IllegalArgumentException("Location cannot be empty");
        }

        String[] parts = source.split(",");
        if (parts.length != 2) {
            throw new IllegalArgumentException(
                "Invalid location format. Expected 'latitude,longitude' or 'longitude,latitude'");
        }

        try {
            double coord1 = Double.parseDouble(parts[0].trim());
            double coord2 = Double.parseDouble(parts[1].trim());

            double longitude, latitude;

            // Determine if input is lat,lng or lng,lat
            // If first coord is in latitude range and second in longitude range, assume lat,lng
            if (Math.abs(coord1) <= 90 && Math.abs(coord2) <= 180) {
                // Likely latitude,longitude format
                latitude = coord1;
                longitude = coord2;
            } else if (Math.abs(coord1) <= 180 && Math.abs(coord2) <= 90) {
                // Likely longitude,latitude format
                longitude = coord1;
                latitude = coord2;
            } else {
                // Try to infer: if coord1 is larger in absolute value, it's likely longitude
                if (Math.abs(coord1) > Math.abs(coord2)) {
                    longitude = coord1;
                    latitude = coord2;
                } else {
                    latitude = coord1;
                    longitude = coord2;
                }
            }

            // Validate bounds
            if (longitude < -180 || longitude > 180) {
                throw new IllegalArgumentException(
                    String.format("Longitude must be between -180 and 180, got: %f", longitude));
            }
            if (latitude < -90 || latitude > 90) {
                throw new IllegalArgumentException(
                    String.format("Latitude must be between -90 and 90, got: %f", latitude));
            }

            // Point constructor: (longitude, latitude)
            return new Point(longitude, latitude);

        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                "Invalid location format. Coordinates must be valid numbers: " + source, e);
        }
    }
}

