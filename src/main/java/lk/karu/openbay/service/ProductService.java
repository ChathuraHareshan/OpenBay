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
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class ProductService {


    public String addProduct(ProductDTO productDTO, HttpServletRequest request) {
        JsonObject resp = new JsonObject();
        if (!validate(productDTO, resp)) return AppUtil.GSON.toJson(resp);

        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();

            Product product = new Product();
            product.setTitle(productDTO.getTitle().trim());
            product.setDescription(productDTO.getDescription().trim());
            product.setCategory(resolveCategory(session, productDTO.getCategory()));
            product.setModel(resolveModel(session, productDTO.getModel()));
            product.setSku(productDTO.getSku() != null ? productDTO.getSku().trim() : "");
            product.setStatus(activeStatus(session));

            session.persist(product);
            session.flush();

            buildAndAttachVariants(product, productDTO.getVariants(), request, product.getId());

            session.merge(product);
            tx.commit();

            resp.addProperty("status", true);
            resp.addProperty("message", "Product saved successfully!");

        } catch (Exception e) {
            rollback(tx);
            resp.addProperty("status", false);
            resp.addProperty("message", "Error saving product: " + e.getMessage());
            e.printStackTrace();
        } finally {
            close(session);
        }
        return AppUtil.GSON.toJson(resp);
    }



    public String updateProduct(ProductDTO productDTO, HttpServletRequest request) {
        JsonObject resp = new JsonObject();
        if (!validate(productDTO, resp)) return AppUtil.GSON.toJson(resp);

        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();

            Product product = session.createQuery(
                            "SELECT DISTINCT p FROM Product p " +
                                    "LEFT JOIN FETCH p.variants v " +
                                    "WHERE p.id = :id", Product.class)
                    .setParameter("id", productDTO.getProductId())
                    .uniqueResult();

            if (product == null) {
                resp.addProperty("status", false);
                resp.addProperty("message", "Product not found with ID: " + productDTO.getProductId());
                return AppUtil.GSON.toJson(resp);
            }

            List<String> oldImagePaths = new ArrayList<>();
            for (ProductVariant v : product.getVariants()) {
                List<VariantImage> imgs = session.createQuery(
                                "FROM VariantImage i WHERE i.variant.id = :vid", VariantImage.class)
                        .setParameter("vid", v.getId())
                        .getResultList();
                for (VariantImage img : imgs) {
                    if (img.getFilePath() != null && !img.getFilePath().isBlank()) {
                        oldImagePaths.add(img.getFilePath());
                    }
                }
            }


            product.getVariants().clear();
            session.flush();

            product.setTitle(productDTO.getTitle().trim());
            product.setDescription(productDTO.getDescription().trim());
            product.setCategory(resolveCategory(session, productDTO.getCategory()));
            product.setModel(resolveModel(session, productDTO.getModel()));
            product.setSku(productDTO.getSku() != null ? productDTO.getSku().trim() : "");
            product.setStatus(activeStatus(session));

            buildAndAttachVariants(product, productDTO.getVariants(), request, product.getId());

            session.merge(product);
            tx.commit();

            List<String> retainedPaths = productDTO.getVariants().stream()
                    .flatMap(v -> v.getImages().stream())
                    .filter(i -> i.getFilePath() != null && !i.getFilePath().isBlank())
                    .map(ProductImageDTO::getFilePath)
                    .collect(java.util.stream.Collectors.toList());

            oldImagePaths.removeAll(retainedPaths);
            deleteImageFiles(oldImagePaths, request);

            resp.addProperty("status", true);
            resp.addProperty("message", "Product updated successfully!");

        } catch (Exception e) {
            rollback(tx);
            resp.addProperty("status", false);
            resp.addProperty("message", "Error updating product: " + e.getMessage());
            e.printStackTrace();
        } finally {
            close(session);
        }
        return AppUtil.GSON.toJson(resp);
    }



    private void buildAndAttachVariants(Product product, List<ProductVariantDTO> variantDTOs, HttpServletRequest request, int productId) {
        for (ProductVariantDTO vDTO : variantDTOs) {
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
                VariantImage image = new VariantImage();

                boolean isNewUpload = iDTO.getBase64Data() != null && !iDTO.getBase64Data().isBlank();
                boolean isExisting  = iDTO.getFilePath()   != null && !iDTO.getFilePath().isBlank();

                if (isNewUpload) {

                    try {
                        String url = saveToDisk(iDTO.getBase64Data(), iDTO.getFileName(), productId, request);
                        image.setFilePath(url);
                    } catch (Exception e) {
                        System.err.println("Image save failed (" + iDTO.getFileName() + "): " + e.getMessage());
                        continue;
                    }
                } else if (isExisting) {

                    image.setFilePath(iDTO.getFilePath());
                } else {
                    System.err.println("Skipping image with no data or path: " + iDTO.getFileName());
                    continue;
                }

                image.setFileName(iDTO.getFileName());
                image.setFileType(iDTO.getFileType());
                image.setVariant(variant);
                variant.getImages().add(image);
            }

            product.getVariants().add(variant);
        }
    }



    private String saveToDisk(String base64Data, String originalName, int productId, HttpServletRequest request) throws Exception {

        Path dir = Paths.get(request.getServletContext().getRealPath("/uploads/product/" + productId));
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String raw = base64Data.contains(",") ? base64Data.split(",")[1] : base64Data;
        byte[] bytes = Base64.getDecoder().decode(raw);

        String fileName = System.currentTimeMillis() + "_" + originalName;
        Files.write(dir.resolve(fileName), bytes, StandardOpenOption.CREATE);

        return request.getContextPath() + "/uploads/product/" + productId + "/" + fileName;
    }

    private void deleteImageFiles(List<String> contextPaths, HttpServletRequest request) {
        String ctx = request.getContextPath();
        for (String path : contextPaths) {
            try {
                String rel = path.startsWith(ctx) ? path.substring(ctx.length()) : path;
                String real = request.getServletContext().getRealPath(rel);
                if (real != null) {
                    boolean deleted = Files.deleteIfExists(Paths.get(real));
                    System.out.println((deleted ? "Deleted" : "Not found") + " old image: " + real);
                }
            } catch (Exception e) {
                System.err.println("Could not delete image: " + path + " — " + e.getMessage());
            }
        }
    }



    private Status activeStatus(Session session) {
        return session.createNamedQuery("Status.findByValue", Status.class)
                .setParameter("value", String.valueOf(Status.Type.ACTIVE))
                .getSingleResult();
    }

    private Category resolveCategory(Session session, String input) {
        try {
            Long id = Long.parseLong(input);
            Category cat = session.get(Category.class, id);
            if (cat == null) throw new IllegalArgumentException("Category not found: " + id);
            return cat;
        } catch (NumberFormatException e) {
            Category cat = session.createQuery(
                            "FROM Category c WHERE c.name = :name", Category.class)
                    .setParameter("name", input).uniqueResult();
            if (cat == null) { cat = new Category(); cat.setName(input); session.persist(cat); }
            return cat;
        }
    }

    private Model resolveModel(Session session, String input) {
        try {
            Long id = Long.parseLong(input);
            Model m = session.get(Model.class, id);
            if (m == null) throw new IllegalArgumentException("Model not found: " + id);
            return m;
        } catch (NumberFormatException e) {
            Model m = session.createQuery(
                            "FROM Model m WHERE m.name = :name", Model.class)
                    .setParameter("name", input).uniqueResult();
            if (m == null) { m = new Model(); m.setName(input); session.persist(m); }
            return m;
        }
    }

    private void rollback(Transaction tx) {
        if (tx != null && tx.isActive()) { try { tx.rollback(); } catch (Exception ignored) {} }
    }

    private void close(Session session) {
        if (session != null && session.isOpen()) session.close();
    }



    private boolean validate(ProductDTO dto, JsonObject resp) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty())
            return fail(resp, "Product title is required");
        if (dto.getDescription() == null || dto.getDescription().trim().isEmpty())
            return fail(resp, "Product description is required");
        if (dto.getCategory() == null || dto.getCategory().trim().isEmpty())
            return fail(resp, "Product category is required");
        if (dto.getVariants() == null || dto.getVariants().isEmpty())
            return fail(resp, "At least one variant is required");

        for (int i = 0; i < dto.getVariants().size(); i++) {
            ProductVariantDTO v = dto.getVariants().get(i);
            if (v.getColor() == null || v.getColor().getName() == null || v.getColor().getName().trim().isEmpty())
                return fail(resp, "Color name required for variant " + (i + 1));
            if (v.getSizes() == null || v.getSizes().isEmpty())
                return fail(resp, "At least one size required for: " + v.getColor().getName());
            for (SizeDTO s : v.getSizes()) {
                if (s.getSize() == null || s.getSize().trim().isEmpty())
                    return fail(resp, "Size value required for: " + v.getColor().getName());
                if (s.getPrice() <= 0)
                    return fail(resp, "Price must be > 0 for size: " + s.getSize());
                if (s.getQuantity() < 0)
                    return fail(resp, "Quantity cannot be negative for size: " + s.getSize());
            }
        }
        return true;
    }

    private boolean fail(JsonObject resp, String message) {
        resp.addProperty("status", false);
        resp.addProperty("message", message);
        return false;
    }

    public String getProductStatistics() {
        JsonObject response = new JsonObject();
        Session session = HibernateUtil.getSessionFactory().openSession();

        try {
            Long totalProducts = session.createQuery(
                            "SELECT COUNT(p) FROM Product p WHERE p.status.id = :statusId", Long.class)
                    .setParameter("statusId", 1)
                    .uniqueResult();

            Long totalStock = session.createQuery(
                            "SELECT SUM(vs.quantity) FROM VariantSize vs", Long.class)
                    .uniqueResult();

            Long lowStockVariants = session.createQuery(
                            "SELECT COUNT(vs) FROM VariantSize vs WHERE vs.quantity <= :threshold", Long.class)
                    .setParameter("threshold", 5)
                    .uniqueResult();

            JsonObject stats = new JsonObject();
            stats.addProperty("totalProducts", totalProducts != null ? totalProducts : 0);
            stats.addProperty("totalStock", totalStock != null ? totalStock : 0);
            stats.addProperty("lowStockVariants", lowStockVariants != null ? lowStockVariants : 0);

            response.addProperty("status", true);
            response.add("data", stats);

        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Error fetching product statistics: " + e.getMessage());
            e.printStackTrace();
        } finally {
            close(session);
        }

        return AppUtil.GSON.toJson(response);
    }
}