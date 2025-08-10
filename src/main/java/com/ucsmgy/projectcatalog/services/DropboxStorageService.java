package com.ucsmgy.projectcatalog.services;

import com.dropbox.core.DbxException;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.files.FileMetadata;
import com.dropbox.core.v2.files.WriteMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class DropboxStorageService implements CloudStorageService {

    private final DbxClientV2 dropboxClient;

    @Autowired
    public DropboxStorageService(DbxClientV2 dropboxClient) {
        this.dropboxClient = dropboxClient;
    }

    @Override
    public String uploadFile(MultipartFile multipartFile) throws IOException, DbxException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        // 1. Generate a unique filename to avoid conflicts
        String originalFilename = multipartFile.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String dropboxPath = "/" + uniqueFilename; // Path in the user's root Dropbox folder

        // 2. Upload the file
        try (InputStream in = multipartFile.getInputStream()) {
            FileMetadata metadata = dropboxClient.files().uploadBuilder(dropboxPath)
                    .withMode(WriteMode.ADD)
                    .uploadAndFinish(in);
        }

        // 3. Create a sharable link for the uploaded file and return it
        return dropboxClient.sharing().createSharedLinkWithSettings(dropboxPath).getUrl();
    }
}