package com.rslakra.retailsuite.customers;

import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;



/**
 * @author Rohtash Lakra
 */
@RunWith(SpringRunner.class)
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
