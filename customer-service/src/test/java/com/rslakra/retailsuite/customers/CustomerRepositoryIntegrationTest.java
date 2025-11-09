package com.rslakra.retailsuite.customers;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;



/**
 * @author Rohtash Lakra
 */
@SpringBootTest
public class CustomerRepositoryIntegrationTest {

	@Autowired CustomerRepository repository;

	@Test
	public void testname() {

		Customer customer = new Customer();
		customer.setFirstname("Dave");
		customer.setLastname("Matthews");
		customer.setAddress(new Address("street", "zipCode", "city", new Location(55.349451, -131.673817)));

		customer = repository.save(customer);

		assertThat(repository.findById(customer.id), is(customer));
	}
}
