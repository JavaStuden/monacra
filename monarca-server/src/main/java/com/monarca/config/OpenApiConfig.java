package com.monarca.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Monarca Iraq Digital Boutique REST API")
                        .version("v4.7.0")
                        .description("Backend RESTful Services & Backoffice Admin System for Iraq E-commerce App. " +
                                "Implements dual-sourcing fulfillment (Iraq in-stock vs China pre-order), " +
                                "USD pricing, COD eligibility restrictions, and Iraq address validation.")
                        .contact(new Contact().name("Monarca Engineering Team"))
                        .license(new License().name("Proprietary").url("https://monarca.iq")));
    }
}
