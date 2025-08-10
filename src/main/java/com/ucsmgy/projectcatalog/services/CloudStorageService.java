package com.ucsmgy.projectcatalog.services;

import com.dropbox.core.DbxException;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface CloudStorageService {
    String uploadFile(MultipartFile file) throws IOException, DbxException;
}
