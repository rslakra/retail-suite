
package com.rslakra.retailsuite.stores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.List;

import jakarta.annotation.PostConstruct;

/**
 * Spring configuration class main application bootstrap point.
 *
 * @author Rohtash Lakra
 */
@SpringBootApplication
@EnableDiscoveryClient
public class StoreServiceApplication implements RepositoryRestConfigurer {

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        config.exposeIdsFor(Store.class);
    }

    @PostConstruct
    public void exposeIds() {
    }

    /**
     * @param args
     */
    public static void main(String[] args) {
        SpringApplication.run(StoreServiceApplication.class, args);
    }

    @Controller
    public static class SimpleStoresController {

        @Autowired
        StoreRepository repository;


        @RequestMapping("/simple/stores")
        @ResponseBody
        List<Store> getStores() {
            Page<Store> all = repository.findAll(PageRequest.of(0, 10));
            return all.getContent();
        }
    }

}
