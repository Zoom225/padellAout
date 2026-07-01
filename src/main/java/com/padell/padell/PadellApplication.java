package com.padell.padell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PadellApplication {

	public static void main(String[] args) {
		SpringApplication.run(PadellApplication.class, args);
	}

}
