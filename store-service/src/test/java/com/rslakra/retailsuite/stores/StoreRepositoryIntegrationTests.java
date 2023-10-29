
package com.rslakra.retailsuite.stores;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.test.context.junit4.SpringRunner;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertThat;

/**
 * Integration tests for {@link StoreRepository}.
 * 
 * @author Rohtash Lakra
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class StoreRepositoryIntegrationTests {

	@Autowired StoreRepository repository;

	@Before
	public void setUp() {
		repository.deleteAll();
	}

    @After
    public void tearDown() {
        repository.deleteAll();
    }

	@Test
	public void findsStoresByLocation() {

		Point location = new Point(-73.995146, 40.740337);
		Store store = new Store("Foo", new Address("street", "city", "zip", location));

		store = repository.save(store);

		Page<Store> stores = repository.findByAddressLocationNear(location, new Distance(1.0, Metrics.KILOMETERS),
				new PageRequest(0, 10));

		assertThat(stores.getContent(), hasSize(1));
		assertThat(stores.getContent(), hasItem(store));
	}
}
