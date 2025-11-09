
package com.rslakra.retailsuite.customers;

import jakarta.persistence.Embeddable;

import lombok.AllArgsConstructor;
import lombok.Value;

/**
 * @author Rohtash Lakra
 */
@Value
@Embeddable
@AllArgsConstructor
public class Location {

	private final double latitude, longitude;

	protected Location() {
		this.latitude = 0.0;
		this.longitude = 0.0;
	}
}
