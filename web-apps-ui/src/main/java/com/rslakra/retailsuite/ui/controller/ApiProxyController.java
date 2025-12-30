package com.rslakra.retailsuite.ui.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;

/**
 * API Proxy Controller - Proxies API requests to backend services
 * 
 * This controller acts as a gateway, forwarding requests from the Angular app
 * to the backend services (customer-service and store-service).
 * 
 * Routes:
 * - /api/customers/** -> http://localhost:8082/customers/**
 * - /api/stores/** -> http://localhost:8081/stores/**
 */
@RestController
@RequestMapping("/api")
public class ApiProxyController {

    private final RestTemplate restTemplate;
    
    @Value("${customer.service.uri:http://localhost:8082}")
    private String customerServiceUri;
    
    @Value("${store.service.uri:http://localhost:8081}")
    private String storeServiceUri;

    public ApiProxyController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Proxy all customer API requests to customer-service
     */
    @RequestMapping(value = "/customers/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<?> proxyCustomers(@RequestBody(required = false) Object body,
                                           @RequestHeader(required = false) HttpHeaders headers,
                                           HttpMethod method,
                                           HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        // Remove /api prefix, keep /customers and everything after
        String backendPath = path.replace("/api", "");
        String url = customerServiceUri + backendPath;
        
        HttpHeaders requestHeaders = new HttpHeaders();
        if (headers != null) {
            requestHeaders.putAll(headers);
        }
        requestHeaders.remove("host"); // Remove host header to avoid issues
        
        HttpEntity<Object> entity = new HttpEntity<>(body, requestHeaders);
        
        return restTemplate.exchange(url, method, entity, Object.class);
    }

    /**
     * Proxy all store API requests to store-service
     */
    @RequestMapping(value = "/stores/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
    public ResponseEntity<?> proxyStores(@RequestBody(required = false) Object body,
                                         @RequestHeader(required = false) HttpHeaders headers,
                                         HttpMethod method,
                                         HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        // Remove /api prefix, keep /stores and everything after
        String backendPath = path.replace("/api", "");
        String url = storeServiceUri + backendPath;
        
        HttpHeaders requestHeaders = new HttpHeaders();
        if (headers != null) {
            requestHeaders.putAll(headers);
        }
        requestHeaders.remove("host"); // Remove host header to avoid issues
        
        HttpEntity<Object> entity = new HttpEntity<>(body, requestHeaders);
        
        return restTemplate.exchange(url, method, entity, Object.class);
    }
}

