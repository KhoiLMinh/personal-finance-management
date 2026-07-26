package com.personal.finance.backend.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Service MKhoi doc")
                        .version("v1.0.0")
                        .description("d")
                        .license(new License()
                                .name("API")
                                .url("http://domain.vn/license")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/")
                ));
    }
}
