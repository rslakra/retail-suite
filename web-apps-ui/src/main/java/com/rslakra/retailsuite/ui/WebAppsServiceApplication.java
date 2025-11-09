package com.rslakra.retailsuite.ui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.stereotype.Controller;

@EnableDiscoveryClient
@SpringBootApplication
@Controller
public class WebAppsServiceApplication {

    /**
     * @param args
     */
    public static void main(String[] args) {
        new SpringApplication(WebAppsServiceApplication.class).run(args);
    }
}
