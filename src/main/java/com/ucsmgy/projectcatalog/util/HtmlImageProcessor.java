package com.ucsmgy.projectcatalog.util;

import com.ucsmgy.projectcatalog.services.ImgbbService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class HtmlImageProcessor {

    public static String processImages(String html, ImgbbService imgbbService) {
        Document doc = Jsoup.parse(html);
        Elements imgs = doc.select("img");

        for (Element img : imgs) {
            String src = img.attr("src");
            if (src.startsWith("data:image")) {
                try {
                    String uploadedUrl = imgbbService.uploadBase64Image(src);
                    img.attr("src", uploadedUrl);
                } catch (Exception e) {
                    System.err.println("Image upload failed: " + e.getMessage());
                }
            }
        }

        return doc.body().html();
    }
}
