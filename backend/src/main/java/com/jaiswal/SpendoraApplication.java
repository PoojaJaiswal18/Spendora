package com.jaiswal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableCaching
@EnableMongoAuditing
@EnableAsync
@EnableTransactionManagement
public class SpendoraApplication {

	public static void main(String[] args) {
		System.setProperty("spring.profiles.default", "dev");
		SpringApplication app = new SpringApplication(SpendoraApplication.class);
		app.setAdditionalProfiles("dev");
		app.run(args);
	}
}
