
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

	private final @Id String id;
	private final String name;
	private final Address address;

	public Store(String name, Address address) {

		this.name = name;
		this.address = address;
		this.id = null;
	}

	protected Store() {

		this.id = null;
		this.name = null;
		this.address = null;
	}
}
