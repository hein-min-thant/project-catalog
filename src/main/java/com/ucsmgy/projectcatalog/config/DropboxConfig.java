package com.ucsmgy.projectcatalog.config;

import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.v2.DbxClientV2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DropboxConfig {

    @Value("${dropbox.access-token}")
    private String accessToken;

    @Value("${dropbox.client-identifier}")
    private String clientIdentifier;

    @Bean
    public DbxClientV2 dropboxClient() {
        DbxRequestConfig config = DbxRequestConfig.newBuilder(clientIdentifier).build();
        return new DbxClientV2(config, accessToken);
    }
}