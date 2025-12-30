package com.rslakra.retailsuite.ui.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Home Controller - Serves the Angular SPA index.html for SPA routes
 * 
 * Since Angular is a Single Page Application (SPA) with client-side routing,
 * we serve index.html for SPA routes. Angular Router handles the routing on the client side.
 * 
 * Note: This controller only handles specific SPA routes. API routes (/api/**) are
 * handled by ApiProxyController. Static resources are served by Spring Boot automatically.
 */
@RestController
public class HomeController {

    /**
     * Serve index.html for root and all SPA routes (excluding /api/**)
     * Angular Router will handle the actual routing on the client side
     * 
     * Note: This uses a catch-all pattern but explicitly excludes /api/** paths
     * in the method body to ensure ApiProxyController handles API requests.
     */
    @GetMapping({"/", "/index"})
    public ResponseEntity<Resource> serveIndex() {
        try {
            Resource index = new ClassPathResource("static/index.html");
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(index);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping({"/customers", "/customers/**", "/stores", "/stores/**", "/about", "/about/**"})
    public ResponseEntity<Resource> serveSpaRoutes(jakarta.servlet.http.HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // CRITICAL: Don't serve index.html for API requests
        // Spring should match /api/** to ApiProxyController first, but this is a safety check
        if (path != null && path.startsWith("/api")) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            Resource index = new ClassPathResource("static/index.html");
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(index);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
