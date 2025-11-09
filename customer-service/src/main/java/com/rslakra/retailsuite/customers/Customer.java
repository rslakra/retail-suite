
package com.rslakra.retailsuite.customers;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import lombok.Data;

/**
 * @author Rohtash Lakra
 */
@Entity
@Data
public class Customer {

	@Id @GeneratedValue Long id;
	String firstname, lastname;
	Address address;
}
