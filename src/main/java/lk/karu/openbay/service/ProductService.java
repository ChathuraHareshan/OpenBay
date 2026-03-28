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
import java.util.*;

public class ProductService {

    // ADD ─────────────────────────────────────────────────────────────────────

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

            for (ProductVariantDTO vDTO : productDTO.getVariants()) {
                ProductVariant variant = buildVariant(vDTO, product);
                for (ProductImageDTO iDTO : vDTO.getImages()) {
                    attachImage(iDTO, variant, product.getId(), request);
                }
                product.getVariants().add(variant);
            }

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

    // UPDATE ──────────────────────────────────────────────────────────────────
    // Per-variant, per-image smart reconciliation:
    //   Variant matched by colorHex:
    //     - EXISTS in DB + in form  -> update sizes, reconcile images
    //     - NEW in form only        -> insert variant + all images
    //     - EXISTS in DB but not in form -> delete variant + image files
    //   Per image inside a matched variant:
    //     - has base64Data          -> new upload, save to disk + insert DB row
    //     - has filePath only       -> existing image, keep DB row unchanged
    //     - in DB but not in form   -> remove DB row + delete disk file

    public String updateProduct(ProductDTO productDTO, HttpServletRequest request) {
        JsonObject resp = new JsonObject();
        if (!validate(productDTO, resp)) return AppUtil.GSON.toJson(resp);

        Session session = null;
        Transaction tx = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            tx = session.beginTransaction();

            // Load product + variants (single join - safe)
            Product product = session.createQuery(
                            "SELECT DISTINCT p FROM Product p " +
                                    "LEFT JOIN FETCH p.variants v " +
                                    "WHERE p.id = :id", Product.class)
                    .setParameter("id", productDTO.getProductId())
                    .uniqueResult();

            if (product == null) {
                resp.addProperty("status", false);
                resp.addProperty("message", "Product not found: " + productDTO.getProductId());
                return AppUtil.GSON.toJson(resp);
            }

            // Load sizes and images per variant (separate queries = no bag conflict)
            for (ProductVariant v : product.getVariants()) {
                List<VariantSize> sizes = session.createQuery(
                                "FROM VariantSize s WHERE s.variant.id = :vid", VariantSize.class)
                        .setParameter("vid", v.getId()).getResultList();
                v.getSizes().addAll(sizes);

                List<VariantImage> images = session.createQuery(
                                "FROM VariantImage i WHERE i.variant.id = :vid", VariantImage.class)
                        .setParameter("vid", v.getId()).getResultList();
                v.getImages().addAll(images);
            }

            // Update basic product fields
            product.setTitle(productDTO.getTitle().trim());
            product.setDescription(productDTO.getDescription().trim());
            product.setCategory(resolveCategory(session, productDTO.getCategory()));
            product.setModel(resolveModel(session, productDTO.getModel()));
            product.setSku(productDTO.getSku() != null ? productDTO.getSku().trim() : "");
            product.setStatus(activeStatus(session));

            int productId = product.getId();
            List<String> filesToDelete = new ArrayList<>();

            // Map existing DB variants by colorHex for O(1) lookup
            Map<String, ProductVariant> existingByHex = new LinkedHashMap<>();
            for (ProductVariant v : product.getVariants()) {
                existingByHex.put(v.getColorHex().toLowerCase(), v);
            }

            // Track which colors the form still has
            Set<String> submittedHexes = new HashSet<>();

            for (ProductVariantDTO vDTO : productDTO.getVariants()) {
                String hex = vDTO.getColor().getHexCode().toLowerCase();
                submittedHexes.add(hex);

                ProductVariant variant = existingByHex.get(hex);

                if (variant == null) {
                    // ── Completely new variant ────────────────────────────────
                    variant = buildVariant(vDTO, product);
                    for (ProductImageDTO iDTO : vDTO.getImages()) {
                        attachImage(iDTO, variant, productId, request);
                    }
                    product.getVariants().add(variant);

                } else {
                    // ── Existing variant: update name + reconcile ─────────────
                    variant.setColorName(vDTO.getColor().getName());
                    variant.setColorHex(vDTO.getColor().getHexCode());

                    // Sizes: replace entirely (no disk files involved)
                    variant.getSizes().clear();
                    for (SizeDTO sDTO : vDTO.getSizes()) {
                        VariantSize sz = new VariantSize();
                        sz.setSize(sDTO.getSize());
                        sz.setPrice(sDTO.getPrice());
                        sz.setQuantity(sDTO.getQuantity());
                        sz.setVariant(variant);
                        variant.getSizes().add(sz);
                    }

                    // Images: smart reconcile
                    // Step A: build map of what currently exists in DB for this variant
                    Map<String, VariantImage> dbImagesByPath = new LinkedHashMap<>();
                    for (VariantImage img : variant.getImages()) {
                        if (img.getFilePath() != null) {
                            dbImagesByPath.put(img.getFilePath(), img);
                        }
                    }

                    // Step B: process each image the client submitted
                    Set<String> retainedPaths = new HashSet<>();
                    for (ProductImageDTO iDTO : vDTO.getImages()) {
                        boolean hasNewData = iDTO.getBase64Data() != null
                                && !iDTO.getBase64Data().isBlank();
                        boolean hasExistingPath = iDTO.getFilePath() != null
                                && !iDTO.getFilePath().isBlank();

                        if (hasNewData) {
                            // New image — save to disk + create DB row
                            try {
                                String url = saveToDisk(iDTO.getBase64Data(),
                                        iDTO.getFileName(), productId, request);
                                VariantImage img = new VariantImage();
                                img.setFileName(iDTO.getFileName());
                                img.setFileType(iDTO.getFileType());
                                img.setFilePath(url);
                                img.setVariant(variant);
                                variant.getImages().add(img);
                            } catch (Exception e) {
                                System.err.println("Image save failed: " + e.getMessage());
                            }
                        } else if (hasExistingPath
                                && dbImagesByPath.containsKey(iDTO.getFilePath())) {
                            // Existing image the user kept — retain it
                            retainedPaths.add(iDTO.getFilePath());
                        }
                        // else: no data, no matching path → skip
                    }

                    // Step C: remove images that were in DB but NOT retained
                    Iterator<VariantImage> imgIt = variant.getImages().iterator();
                    while (imgIt.hasNext()) {
                        VariantImage img = imgIt.next();
                        if (dbImagesByPath.containsKey(img.getFilePath())
                                && !retainedPaths.contains(img.getFilePath())) {
                            filesToDelete.add(img.getFilePath());
                            imgIt.remove(); // orphanRemoval removes the DB row
                        }
                    }
                }
            }

            // Remove variants that were deleted from the form entirely
            Iterator<ProductVariant> varIt = product.getVariants().iterator();
            while (varIt.hasNext()) {
                ProductVariant v = varIt.next();
                if (!submittedHexes.contains(v.getColorHex().toLowerCase())) {
                    for (VariantImage img : v.getImages()) {
                        if (img.getFilePath() != null) filesToDelete.add(img.getFilePath());
                    }
                    varIt.remove(); // orphanRemoval cascades to sizes + images DB rows
                }
            }

            session.merge(product);
            tx.commit();

            // Delete obsolete files from disk only after a successful commit
            deleteImageFiles(filesToDelete, request);

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

    // HELPERS ─────────────────────────────────────────────────────────────────

    private ProductVariant buildVariant(ProductVariantDTO vDTO, Product product) {
        ProductVariant v = new ProductVariant();
        v.setColorName(vDTO.getColor().getName());
        v.setColorHex(vDTO.getColor().getHexCode());
        v.setProduct(product);
        for (SizeDTO sDTO : vDTO.getSizes()) {
            VariantSize sz = new VariantSize();
            sz.setSize(sDTO.getSize()); sz.setPrice(sDTO.getPrice());
            sz.setQuantity(sDTO.getQuantity()); sz.setVariant(v);
            v.getSizes().add(sz);
        }
        return v;
    }

    private void attachImage(ProductImageDTO iDTO, ProductVariant variant,
                             int productId, HttpServletRequest request) {
        boolean hasNew  = iDTO.getBase64Data() != null && !iDTO.getBase64Data().isBlank();
        boolean hasPath = iDTO.getFilePath()   != null && !iDTO.getFilePath().isBlank();
        String url = null;
        if (hasNew) {
            try { url = saveToDisk(iDTO.getBase64Data(), iDTO.getFileName(), productId, request); }
            catch (Exception e) { System.err.println("Image failed: " + e.getMessage()); return; }
        } else if (hasPath) {
            url = iDTO.getFilePath();
        } else { return; }

        VariantImage img = new VariantImage();
        img.setFileName(iDTO.getFileName());
        img.setFileType(iDTO.getFileType());
        img.setFilePath(url);
        img.setVariant(variant);
        variant.getImages().add(img);
    }

    private String saveToDisk(String base64, String name,
                              int productId, HttpServletRequest req) throws Exception {
        Path dir = Paths.get(req.getServletContext().getRealPath("/uploads/product/" + productId));
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String raw = base64.contains(",") ? base64.split(",")[1] : base64;
        String fname = System.currentTimeMillis() + "_" + name;
        Files.write(dir.resolve(fname), Base64.getDecoder().decode(raw), StandardOpenOption.CREATE);
        return req.getContextPath() + "/uploads/product/" + productId + "/" + fname;
    }

    private void deleteImageFiles(List<String> paths, HttpServletRequest req) {
        String ctx = req.getContextPath();
        for (String p : paths) {
            try {
                String rel  = p.startsWith(ctx) ? p.substring(ctx.length()) : p;
                String real = req.getServletContext().getRealPath(rel);
                if (real != null) Files.deleteIfExists(Paths.get(real));
            } catch (Exception e) { System.err.println("Delete failed: " + p); }
        }
    }

    private Status activeStatus(Session s) {
        return s.createNamedQuery("Status.findByValue", Status.class)
                .setParameter("value", String.valueOf(Status.Type.ACTIVE)).getSingleResult();
    }

    private Category resolveCategory(Session session, String input) {
        try {
            Long id = Long.parseLong(input);
            Category c = session.get(Category.class, id);
            if (c == null) throw new IllegalArgumentException("Not found: " + id);
            return c;
        } catch (NumberFormatException e) {
            Category c = session.createQuery("FROM Category c WHERE c.name=:n", Category.class)
                    .setParameter("n", input).uniqueResult();
            if (c == null) { c = new Category(); c.setName(input); session.persist(c); }
            return c;
        }
    }

    private Model resolveModel(Session session, String input) {
        try {
            Long id = Long.parseLong(input);
            Model m = session.get(Model.class, id);
            if (m == null) throw new IllegalArgumentException("Not found: " + id);
            return m;
        } catch (NumberFormatException e) {
            Model m = session.createQuery("FROM Model m WHERE m.name=:n", Model.class)
                    .setParameter("n", input).uniqueResult();
            if (m == null) { m = new Model(); m.setName(input); session.persist(m); }
            return m;
        }
    }

    private void rollback(Transaction tx) {
        if (tx != null && tx.isActive()) { try { tx.rollback(); } catch (Exception ignored) {} }
    }

    private void close(Session s) { if (s != null && s.isOpen()) s.close(); }

    private boolean validate(ProductDTO dto, JsonObject resp) {
        if (empty(dto.getTitle()))       return fail(resp, "Product title is required");
        if (empty(dto.getDescription())) return fail(resp, "Product description is required");
        if (empty(dto.getCategory()))    return fail(resp, "Product category is required");
        if (dto.getVariants() == null || dto.getVariants().isEmpty())
            return fail(resp, "At least one variant is required");
        for (int i = 0; i < dto.getVariants().size(); i++) {
            ProductVariantDTO v = dto.getVariants().get(i);
            if (v.getColor()==null || empty(v.getColor().getName()))
                return fail(resp, "Color name required for variant " + (i+1));
            if (v.getSizes()==null || v.getSizes().isEmpty())
                return fail(resp, "At least one size required for: " + v.getColor().getName());
            for (SizeDTO s : v.getSizes()) {
                if (empty(s.getSize()))  return fail(resp, "Size value required");
                if (s.getPrice() <= 0)   return fail(resp, "Price must be > 0 for: " + s.getSize());
                if (s.getQuantity() < 0) return fail(resp, "Quantity cannot be negative");
            }
        }
        return true;
    }

    private boolean empty(String s) { return s == null || s.trim().isEmpty(); }
    private boolean fail(JsonObject r, String m) {
        r.addProperty("status", false); r.addProperty("message", m); return false;
    }
}