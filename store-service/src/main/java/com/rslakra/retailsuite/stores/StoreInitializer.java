
package com.rslakra.retailsuite.stores;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.separator.DefaultRecordSeparatorPolicy;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.geo.Point;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Component initializing a handful of Starbucks stores and persisting them through a {@link StoreRepository}.
 *
 * @author Rohtash Lakra
 */
@Slf4j
@Component
public class StoreInitializer {

    @Autowired
    public StoreInitializer(StoreRepository repository) throws Exception {

        if (repository.count() != 0) {
            return;
        }

        List<Store> stores = readStores();
        log.info("Importing {} stores into MongoDB…", stores.size());
        repository.saveAll(stores);
        log.info("Successfully imported {} stores.", repository.count());
    }

    /**
     * Reads a file {@code starbucks.csv} from the class path and parses it into {@link Store} instances about to
     * persisted.
     *
     * @return
     * @throws Exception
     */
    public static List<Store> readStores() throws Exception {

        ClassPathResource resource = new ClassPathResource("starbucks.csv");
        Scanner scanner = new Scanner(resource.getInputStream());
        String line = scanner.nextLine();
        scanner.close();

        FlatFileItemReader<Store> itemReader = new FlatFileItemReader<Store>();
        itemReader.setResource(resource);

        // DelimitedLineTokenizer defaults to comma as its delimiter
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames(line.split(","));
        tokenizer.setStrict(false);

        DefaultLineMapper<Store> lineMapper = new DefaultLineMapper<Store>();
        lineMapper.setLineTokenizer(tokenizer);
        lineMapper.setFieldSetMapper(StoreFieldSetMapper.INSTANCE);
        itemReader.setLineMapper(lineMapper);
        itemReader.setRecordSeparatorPolicy(new DefaultRecordSeparatorPolicy());
        itemReader.setLinesToSkip(1);
        itemReader.open(new ExecutionContext());

        List<Store> stores = new ArrayList<>();
        Store store = null;

        do {
            store = itemReader.read();
            if (store != null) {
                stores.add(store);
            }
        } while (store != null);

        return stores;
    }

    private static enum StoreFieldSetMapper implements FieldSetMapper<Store> {

        INSTANCE;

        /*
         * (non-Javadoc)
         * @see org.springframework.batch.item.file.mapping.FieldSetMapper#mapFieldSet(org.springframework.batch.item.file.transform.FieldSet)
         */
        @Override
        public Store mapFieldSet(FieldSet fields) throws BindException {

            Point location = new Point(fields.readDouble("Longitude"), fields.readDouble("Latitude"));
            Address address = new Address(fields.readString("Street Address"), fields.readString("City"),
                                          fields.readString("Zip"), location);

            return new Store(fields.readString("Name"), address);
        }
    }
}
