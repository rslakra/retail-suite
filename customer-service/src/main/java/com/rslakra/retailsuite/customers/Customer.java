
package com.rslakra.retailsuite.customers;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

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
