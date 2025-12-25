package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lk.karu.openbay.dto.*;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.UUID;

public class ProductService {

    public String addProduct(ProductDTO productDTO, HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        // Validate input
        if (!validateProductDTO(productDTO, responseObject)) {
            return AppUtil.GSON.toJson(responseObject);
        }

        Session session = null;
        Transaction tx = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();

            // Create main product
            Product product = new Product();
            product.setTitle(productDTO.getTitle().trim());
            product.setDescription(productDTO.getDescription().trim());

            // Handle category - check if it's ID or name
            String categoryStr = productDTO.getCategory();
            try {
                // Try to parse as Long (ID)
                Long categoryId = Long.parseLong(categoryStr);
                Category category = session.get(Category.class, categoryId);
                if (category == null) {
                    throw new IllegalArgumentException("Category not found with ID: " + categoryId);
                }
                product.setCategory(category);
            } catch (NumberFormatException e) {
                // If not a number, treat as category name
                Category category = session.createQuery(
                                "FROM Category c WHERE c.name = :name", Category.class)
                        .setParameter("name", categoryStr)
                        .uniqueResult();

                if (category == null) {
                    // Create new category if it doesn't exist
                    category = new Category();
                    category.setName(categoryStr);
                    session.persist(category);
                }
                product.setCategory(category);
            }

            product.setSku(productDTO.getSku() != null ? productDTO.getSku().trim() : "");

            // Add variants
            for (ProductVariantDTO vDTO : productDTO.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setColorName(vDTO.getColor().getName());
                variant.setColorHex(vDTO.getColor().getHexCode());
                variant.setProduct(product);

                // Add sizes
                for (SizeDTO sDTO : vDTO.getSizes()) {
                    VariantSize size = new VariantSize();
                    size.setSize(sDTO.getSize());
                    size.setPrice(sDTO.getPrice());
                    size.setQuantity(sDTO.getQuantity());
                    size.setVariant(variant);
                    variant.getSizes().add(size);
                }

                // Add images
                for (ProductImageDTO iDTO : vDTO.getImages()) {
                    try {
                        String path = saveImage(iDTO);

                        VariantImage image = new VariantImage();
                        image.setFileName(iDTO.getFileName());
                        image.setFileType(iDTO.getFileType());
                        image.setFilePath(path);
                        image.setVariant(variant);

                        variant.getImages().add(image);
                    } catch (Exception e) {
                        System.err.println("Failed to save image: " + e.getMessage());
                        // Continue with other images
                    }
                }

                product.getVariants().add(variant);
            }

            session.persist(product);
            tx.commit();

            status = true;
            message = "Product saved successfully!";

        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            status = false;
            message = "Error saving product: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private boolean validateProductDTO(ProductDTO productDTO, JsonObject responseObject) {
        // Validate title
        if (productDTO.getTitle() == null || productDTO.getTitle().trim().isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Product title is required");
            return false;
        }

        // Validate description
        if (productDTO.getDescription() == null || productDTO.getDescription().trim().isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Product description is required");
            return false;
        }

        // Validate category
        if (productDTO.getCategory() == null || productDTO.getCategory().trim().isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Product category is required");
            return false;
        }

        // Validate variants
        if (productDTO.getVariants() == null || productDTO.getVariants().isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "At least one product variant (color) is required");
            return false;
        }

        // Validate each variant
        for (int i = 0; i < productDTO.getVariants().size(); i++) {
            ProductVariantDTO variant = productDTO.getVariants().get(i);

            if (variant.getColor() == null ||
                    variant.getColor().getName() == null ||
                    variant.getColor().getName().trim().isEmpty()) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Color name is required for variant " + (i + 1));
                return false;
            }

            if (variant.getSizes() == null || variant.getSizes().isEmpty()) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "At least one size is required for color: " + variant.getColor().getName());
                return false;
            }

            // Validate each size
            for (int j = 0; j < variant.getSizes().size(); j++) {
                SizeDTO size = variant.getSizes().get(j);

                if (size.getSize() == null || size.getSize().trim().isEmpty()) {
                    responseObject.addProperty("status", false);
                    responseObject.addProperty("message", "Size is required for color: " + variant.getColor().getName());
                    return false;
                }

                if (size.getPrice() <= 0) {
                    responseObject.addProperty("status", false);
                    responseObject.addProperty("message", "Price must be greater than 0 for size: " + size.getSize());
                    return false;
                }

                if (size.getQuantity() < 0) {
                    responseObject.addProperty("status", false);
                    responseObject.addProperty("message", "Quantity cannot be negative for size: " + size.getSize());
                    return false;
                }
            }
        }

        return true;
    }

    private String saveImage(ProductImageDTO dto) throws Exception {
        try {
            // Ensure uploads directory exists
            java.nio.file.Path uploadsDir = Paths.get("uploads");
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }

            // Decode base64
            String base64Data = dto.getBase64Data();
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }

            byte[] data = Base64.getDecoder().decode(base64Data);

            // Generate unique filename
            String fileName = UUID.randomUUID() + "_" +
                    System.currentTimeMillis() + "_" +
                    dto.getFileName();

            String filePath = "uploads/" + fileName;

            // Save file
            Files.write(Paths.get(filePath), data, StandardOpenOption.CREATE);

            return filePath;
        } catch (Exception e) {
            throw new Exception("Failed to save image: " + e.getMessage());
        }
    }
}