package com.example.application;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Random;
import java.util.stream.Collectors;

import com.vaadin.flow.spring.annotation.SpringComponent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.vaadin.exampledata.DataType;
import com.vaadin.exampledata.ExampleDataGenerator;

@SpringComponent
public class DataGenerator {

    @Bean
    public CommandLineRunner loadData(ContactRepository contactRepository) {

        return args -> {
            Logger logger = LoggerFactory.getLogger(getClass());
            if (contactRepository.count() != 0L) {
                logger.info("Using existing database");
                return;
            }
            int seed = 123;

            logger.info("Generating demo data");

            logger.info("... generating 1234 Contact entities...");
            var contactGenerator = new ExampleDataGenerator<>(Contact.class, LocalDateTime.now());
            contactGenerator.setData(Contact::setFirstName, DataType.FIRST_NAME);
            contactGenerator.setData(Contact::setLastName, DataType.LAST_NAME);
            contactGenerator.setData(Contact::setEmail, DataType.EMAIL);
            contactGenerator.setData(Contact::setDate, DataType.DATE_LAST_1_YEAR);

            Random r = new Random(seed);
            var contacts = contactGenerator.create(1234, seed).stream().map(contact -> {
                return contact;
            }).collect(Collectors.toList());

            contacts.forEach(contact -> {
                var date = contact.getDate();
                var newDate = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                contact.setDate(newDate);
            });

            contactRepository.saveAll(contacts);

            logger.info("Generated demo data");
        };
    }

}
