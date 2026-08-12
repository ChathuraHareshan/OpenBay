package lk.karu.openbay.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lk.karu.openbay.dto.ColorDTO;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.dto.SizeDTO;
import lk.karu.openbay.dto.TopProductDTO;
import lk.karu.openbay.entity.Product;
import lk.karu.openbay.entity.ProductVariant;
import lk.karu.openbay.entity.VariantImage;
import lk.karu.openbay.entity.VariantSize;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.HibernateException;
import org.hibernate.Session;

import java.util.*;

public class SingleProductService {

    public String getSingleProduct(String id) {
        JsonObject responseObject = new JsonObject();
        boolean status = true;
        String message = "";

        if (id == null || id.isBlank()) {
            status = false;
            message = "Product Not Found.";
        } else if (!id.matches(Validator.IS_INTEGER)) {
            message = "Invalid product!";
        } else {

            Session hibernateSession = null;
            try {
                int productId = Integer.parseInt(id);
                hibernateSession = HibernateUtil.getSessionFactory().openSession();

                Product product = hibernateSession.createQuery(
                                "SELECT DISTINCT p FROM Product p " +
                                        "LEFT JOIN FETCH p.variants v " +
                                        "JOIN FETCH p.category " +
                                        "WHERE p.id = :proId AND p.status.id = :status",
                                Product.class)
                        .setParameter("proId", productId)
                        .setParameter("status", 1)
                        .getSingleResult();

                for (ProductVariant variant : product.getVariants()) {
                    List<VariantSize> sizes = hibernateSession.createQuery(
                                    "FROM VariantSize s WHERE s.variant.id = :vid", VariantSize.class)
                            .setParameter("vid", variant.getId())
                            .getResultList();
                    variant.getSizes().addAll(sizes);

                    List<VariantImage> images = hibernateSession.createQuery(
                                    "FROM VariantImage i WHERE i.variant.id = :vid", VariantImage.class)
                            .setParameter("vid", variant.getId())
                            .getResultList();
                    variant.getImages().addAll(images);
                }

                TopProductDTO productDTO = new TopProductDTO();
                productDTO.setProductId(product.getId());
                productDTO.setTitle(product.getTitle());
                productDTO.setCategory(product.getCategory().getName());
                productDTO.setDescription(product.getDescription());
                productDTO.setModel(product.getModel() != null ? product.getModel().getName() : "");

                List<Double> prices = new ArrayList<>();
                for (ProductVariant variant : product.getVariants()) {
                    for (VariantSize size : variant.getSizes()) {
                        prices.add(size.getPrice());
                    }
                }
                productDTO.setMinPrice(prices.isEmpty() ? 0.0 : Collections.min(prices));
                productDTO.setMaxPrice(prices.isEmpty() ? 0.0 : Collections.max(prices));

                List<String> allImages = new ArrayList<>();
                for (ProductVariant variant : product.getVariants()) {
                    for (VariantImage image : variant.getImages()) {
                        allImages.add(image.getFilePath());
                    }
                }
                productDTO.setImages(allImages);

                List<ColorDTO> colorDTOList = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    ColorDTO colorDTO = new ColorDTO();
                    colorDTO.setName(variant.getColorName());
                    colorDTO.setHexCode(variant.getColorHex());

                    List<SizeDTO> sizeDTOList = new ArrayList<>();
                    for (VariantSize vs : variant.getSizes()) {
                        SizeDTO sizeDTO = new SizeDTO();
                        sizeDTO.setSize(vs.getSize());
                        sizeDTO.setPrice(vs.getPrice());
                        sizeDTO.setQuantity(vs.getQuantity());
                        sizeDTOList.add(sizeDTO);
                    }
                    colorDTO.setSizes(sizeDTOList);

                    List<String> variantImagePaths = new ArrayList<>();
                    for (VariantImage image : variant.getImages()) {
                        variantImagePaths.add(image.getFilePath());
                    }
                    colorDTO.setImages(variantImagePaths); // ← each color has its own images

                    colorDTOList.add(colorDTO);
                }

                productDTO.setColors(colorDTOList);
                responseObject.add("singleProduct", AppUtil.GSON.toJsonTree(productDTO));

            } catch (HibernateException e) {
                message = e.getMessage();
                status = false;
            } finally {
                if (hibernateSession != null) hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String getColorHasSize(ProductDTO productDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (productDTO.getColorName() == null || productDTO.getColorName().isBlank()) {
            message = "Color Not Found.";
        } else if (productDTO.getProductId() == null) {
            message = "ProductId Not Found.";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            try {
                ProductVariant productVariant = hibernateSession.createQuery(
                                "FROM ProductVariant pv WHERE pv.product.id = :pid AND pv.colorName = :cname",
                                ProductVariant.class)
                        .setParameter("pid", productDTO.getProductId())
                        .setParameter("cname", productDTO.getColorName())
                        .uniqueResult();

                if (productVariant == null) {
                    message = "Product color and sizes not found!";
                } else {
                    List<VariantSize> sizes = hibernateSession.createQuery(
                                    "FROM VariantSize vs WHERE vs.variant = :variant", VariantSize.class)
                            .setParameter("variant", productVariant)
                            .list();

                    if (sizes == null || sizes.isEmpty()) {
                        message = "No sizes available for this color!";
                    } else {
                        JsonArray sizesArray = new JsonArray();
                        for (VariantSize vs : sizes) {
                            JsonObject sizeObj = new JsonObject();
                            sizeObj.addProperty("size", vs.getSize());
                            sizeObj.addProperty("price", vs.getPrice());
                            sizeObj.addProperty("quantity", vs.getQuantity());
                            sizesArray.add(sizeObj);
                        }
                        responseObject.addProperty("status", true);
                        responseObject.add("sizes", sizesArray);
                        return responseObject.toString();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                message = "Error: " + e.getMessage();
            } finally {
                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", false);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }
}