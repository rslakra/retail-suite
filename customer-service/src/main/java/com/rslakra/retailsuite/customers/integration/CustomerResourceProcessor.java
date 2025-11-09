
package com.rslakra.retailsuite.customers.integration;

import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import com.rslakra.retailsuite.customers.Customer;
import com.rslakra.retailsuite.customers.Location;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

/**
 * @author Rohtash Lakra
 */
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CustomerResourceProcessor implements RepresentationModelProcessor<EntityModel<Customer>> {

	private static final String X_FORWARDED_HOST = "X-Forwarded-Host";
	private final StoreIntegration storeIntegration;
	private final ObjectProvider<HttpServletRequest> request;

	@Override
	public EntityModel<Customer> process(EntityModel<Customer> model) {

		Customer customer = model.getContent();
		if (customer != null && customer.getAddress() != null) {
			Location location = customer.getAddress().getLocation();
			if (location != null) {
				Map<String, Object> parameters = new HashMap<>();
				parameters.put("location", String.format("%s,%s", location.getLatitude(), location.getLongitude()));
				parameters.put("distance", "50km");
				String host = this.request.getIfAvailable() != null ? this.request.getIfAvailable().getHeader(X_FORWARDED_HOST) : null;
				Link link = this.storeIntegration.getStoresByLocationLink(parameters, host);
				if (link != null) {
					model.add(link.withRel("stores-nearby"));
				}
			}
		}

		return model;
	}
}
