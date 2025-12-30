package com.rslakra.retailsuite.ui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(excludeName = {
    "org.springframework.cloud.config.client.ConfigClientAutoConfiguration",
    "org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration"
})
@ComponentScan(basePackages = "com.rslakra.retailsuite.ui")
public class WebAppsServiceApplication {

    /**
     * @param args
     */
    public static void main(String[] args) {
        new SpringApplication(WebAppsServiceApplication.class).run(args);
    }
}
