
package com.rslakra.retailsuite.stores;

import lombok.Value;

import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;

/**
 * Value object to represent an {@link Address}.
 * 
 * @author Rohtash Lakra
 */
@Value
public class Address {

	private final String street;
	private final String city;
	private final String zip;
	private final @GeoSpatialIndexed Point location;
}
