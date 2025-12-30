package com.rslakra.retailsuite.ui.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration - Configures static resource paths
 * 
 * Maps static resource paths to the static directory:
 * - /css/** -> classpath:/static/css/
 * - /js/** -> classpath:/static/js/
 * - /scripts/** -> classpath:/static/scripts/ (for Angular build output)
 * - /styles/** -> classpath:/static/styles/ (for Angular build output)
 * - /images/** -> classpath:/static/images/
 * - /fonts/** -> classpath:/static/fonts/
 * - /assets/** -> classpath:/static/assets/
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // CSS resources
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        
        // JavaScript resources (old structure)
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        
        // Scripts (Angular build output)
        registry.addResourceHandler("/scripts/**")
                .addResourceLocations("classpath:/static/scripts/");
        
        // Styles (Angular build output)
        registry.addResourceHandler("/styles/**")
                .addResourceLocations("classpath:/static/styles/");
        
        // Images
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
        
        // Fonts
        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("classpath:/static/fonts/");
        
        // Assets
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
        
        // Favicon and root static files
        registry.addResourceHandler("/favicon.ico", "/robots.txt")
                .addResourceLocations("classpath:/static/");
    }
}

