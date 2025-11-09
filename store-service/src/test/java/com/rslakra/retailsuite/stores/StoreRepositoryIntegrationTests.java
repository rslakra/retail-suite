
package com.rslakra.retailsuite.stores;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeospatialIndex;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.MatcherAssert.assertThat;

/**
 * Integration tests for {@link StoreRepository}.
 * 
 * @author Rohtash Lakra
 */
@SpringBootTest
public class StoreRepositoryIntegrationTests {

	@Autowired StoreRepository repository;
	@Autowired MongoTemplate mongoTemplate;

	@BeforeEach
	public void setUp() {
		repository.deleteAll();
		// Ensure geospatial index exists for location queries
		mongoTemplate.indexOps(Store.class).ensureIndex(
			new GeospatialIndex("address.location").typed(GeoSpatialIndexType.GEO_2DSPHERE)
		);
	}

    @AfterEach
    public void tearDown() {
        repository.deleteAll();
    }

	@Test
	public void findsStoresByLocation() {

		Point location = new Point(-73.995146, 40.740337);
		Store store = new Store("Foo", new Address("street", "city", "zip", location));

		store = repository.save(store);

		Page<Store> stores = repository.findByAddressLocationNear(location, new Distance(1.0, Metrics.KILOMETERS),
				PageRequest.of(0, 10));

		assertThat(stores.getContent(), hasSize(1));
		assertThat(stores.getContent(), hasItem(store));
	}
}
