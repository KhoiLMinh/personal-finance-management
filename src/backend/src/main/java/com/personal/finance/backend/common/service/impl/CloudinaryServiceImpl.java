package com.personal.finance.backend.common.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.personal.finance.backend.common.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "finmanage_avatars",
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Lỗi upload ảnh lên Cloudinary: ", e);
            throw new RuntimeException("Không thể tải ảnh lên máy chủ. Vui lòng thử lại!");
        }
    }
}