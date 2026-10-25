package com.poster35;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PosterApplication {
    public static void main(String[] args) {
        SpringApplication.run(PosterApplication.class, args);
        System.out.println("================================================");
        System.out.println("  POSTER35 Spring Boot 3 Enterprise API Active  ");
        System.out.println("  Pricing: Fixed ₹35 Per Poster                 ");
        System.out.println("================================================");
    }
}
