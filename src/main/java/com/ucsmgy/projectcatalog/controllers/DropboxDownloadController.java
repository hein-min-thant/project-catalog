package com.ucsmgy.projectcatalog.controllers;

import com.dropbox.core.DbxException;
import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.files.FileMetadata;
import com.dropbox.core.v2.files.DownloadErrorException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
public class DropboxDownloadController {

    @Value("${dropbox.access-token}")
    private String ACCESS_TOKEN;

    private DbxClientV2 getClient() {
        DbxRequestConfig config = DbxRequestConfig.newBuilder("project-catalog/1.0").build();
        return new DbxClientV2(config, ACCESS_TOKEN);
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam String path) {
        DbxClientV2 client = getClient();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            FileMetadata metadata = client.files().downloadBuilder(path).download(outputStream);
            byte[] fileBytes = outputStream.toByteArray();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getName() + "\"")
                    .body(fileBytes);

        } catch (DbxException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
