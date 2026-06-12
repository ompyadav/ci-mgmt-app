package com.cims.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot Application Class for Continuous Improvement Management System (CIMS)
 * 
 * @author CIMS Development Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class CimsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CimsApplication.class, args);
        System.out.println("=================================================");
        System.out.println("Continuous Improvement Management System Started");
        System.out.println("=================================================");
        System.out.println("API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("API Docs JSON: http://localhost:8080/api-docs");
        System.out.println("Health Check: http://localhost:8080/actuator/health");
        System.out.println("=================================================");
    }
}

// Made with Bob
