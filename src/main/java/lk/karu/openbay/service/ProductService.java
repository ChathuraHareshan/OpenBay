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
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;

public class ProductService {

    public String addProduct(ProductDTO productDTO, HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (!validateProductDTO(productDTO, responseObject)) {
            return AppUtil.GSON.toJson(responseObject);
        }

        Session session = null;
        Transaction tx = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();

            Product product = new Product();
            product.setTitle(productDTO.getTitle().trim());
            product.setDescription(productDTO.getDescription().trim());

            String categoryStr = productDTO.getCategory();
            Category category = null;

            try {
                Long categoryId = Long.parseLong(categoryStr);
                category = session.get(Category.class, categoryId);
                if (category == null) {
                    throw new IllegalArgumentException("Category not found with ID: " + categoryId);
                }
            } catch (NumberFormatException e) {
                category = session.createQuery("FROM Category c WHERE c.name = :name", Category.class)
                        .setParameter("name", categoryStr)
                        .uniqueResult();
                if (category == null) {
                    category = new Category();
                    category.setName(categoryStr);
                    session.persist(category);
                }
            }
            product.setCategory(category);

            String modelStr = productDTO.getModel();
            Model model = null;

            try {
                Long modelId = Long.parseLong(modelStr);
                model = session.get(Model.class, modelId);
                if (model == null) {
                    throw new IllegalArgumentException("Model not found with ID: " + modelId);
                }
            } catch (NumberFormatException e) {
                model = session.createQuery("FROM Model m WHERE m.name = :name", Model.class)
                        .setParameter("name", modelStr)
                        .uniqueResult();
                if (model == null) {
                    model = new Model();
                    model.setName(modelStr);
                    session.persist(model);
                }
            }
            product.setModel(model);

            product.setSku(productDTO.getSku() != null ? productDTO.getSku().trim() : "");

            Status activeStatus = session.createNamedQuery("Status.findByValue", Status.class)
                    .setParameter("value", String.valueOf(Status.Type.ACTIVE))
                    .getSingleResult();

            product.setStatus(activeStatus);

            session.persist(product);
            session.flush();
            int productId = product.getId();

            for (ProductVariantDTO vDTO : productDTO.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setColorName(vDTO.getColor().getName());
                variant.setColorHex(vDTO.getColor().getHexCode());
                variant.setProduct(product);

                for (SizeDTO sDTO : vDTO.getSizes()) {
                    VariantSize size = new VariantSize();
                    size.setSize(sDTO.getSize());
                    size.setPrice(sDTO.getPrice());
                    size.setQuantity(sDTO.getQuantity());
                    size.setVariant(variant);
                    variant.getSizes().add(size);
                }

                for (ProductImageDTO iDTO : vDTO.getImages()) {
                    try {
                        String url = saveImage(iDTO, productId, request);

                        VariantImage image = new VariantImage();
                        image.setFileName(iDTO.getFileName());
                        image.setFileType(iDTO.getFileType());
                        image.setFilePath(url);
                        image.setVariant(variant);

                        variant.getImages().add(image);
                    } catch (Exception e) {
                        System.err.println("Failed to save image: " + e.getMessage());
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

            if (variant.getColor() == null || variant.getColor().getName() == null ||
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

    private String saveImage(ProductImageDTO dto, int productId, HttpServletRequest request) throws Exception {
        try {
            // Get real path to webapp/uploads
            String uploadsPathStr = request.getServletContext().getRealPath("/uploads/product/" + productId);
            Path uploadsDir = Paths.get(uploadsPathStr);

            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }

            // Decode Base64
            String base64Data = dto.getBase64Data();
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            byte[] data = Base64.getDecoder().decode(base64Data);

            // Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + dto.getFileName();
            Path filePath = uploadsDir.resolve(fileName);

            // Save file
            Files.write(filePath, data, StandardOpenOption.CREATE);

            // Generate full HTTP URL
            String contextPath = request.getContextPath(); // e.g., /openbay
            String fullUrl = contextPath + "/uploads/product/" + productId + "/" + fileName;

            return fullUrl;
        } catch (Exception e) {
            throw new Exception("Failed to save image: " + e.getMessage());
        }
    }

}
