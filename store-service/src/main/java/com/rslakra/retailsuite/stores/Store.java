
package com.rslakra.retailsuite.stores;

import lombok.Data;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entity to represent a {@link Store}.
 * 
 * @author Rohtash Lakra
 */
@Data
@Document
public class Store {

	private @Id String id;
	private String name;
	private Address address;

	public Store(String name, Address address) {
		this.name = name;
		this.address = address;
	}

	protected Store() {
		// Default constructor for Spring Data
	}
}
