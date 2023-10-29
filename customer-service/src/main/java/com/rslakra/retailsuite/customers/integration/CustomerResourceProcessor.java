
package com.rslakra.retailsuite.customers.integration;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.rslakra.retailsuite.customers.Customer;
import com.rslakra.retailsuite.customers.Location;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.springframework.stereotype.Component;

/**
 * @author Rohtash Lakra
 */
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CustomerResourceProcessor implements ResourceProcessor<Resource<Customer>> {

	private static final String X_FORWARDED_HOST = "X-Forwarded-Host";
	private final StoreIntegration storeIntegration;
	private final ObjectProvider<HttpServletRequest> request;

	@Override
	public Resource<Customer> process(Resource<Customer> resource) {

		Customer customer = resource.getContent();
		Location location = customer.getAddress().getLocation();

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("location", String.format("%s,%s", location.getLatitude(), location.getLongitude()));
		parameters.put("distance", "50km");
		String host = this.request.getIfAvailable().getHeader(X_FORWARDED_HOST);
		Link link = this.storeIntegration.getStoresByLocationLink(parameters, host);
		if (link != null) {
			resource.add(link.withRel("stores-nearby"));
		}

		return resource;
	}
}
