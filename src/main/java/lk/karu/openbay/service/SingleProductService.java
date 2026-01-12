package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import lk.karu.openbay.dto.ColorDTO;
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

    public String getSingleProduct(String id){
        JsonObject responseObject = new JsonObject();
        boolean status = true;
        String message = "";
        if(id == null || id.isBlank()){
            status = false;
            message = "Product Not Found.";
        }else if(!id.matches(Validator.IS_INTEGER)){
            message = "Invalid product!";
        }else {

            Session hibernateSession = null;
            try {
                int productId = Integer.parseInt(id);
                hibernateSession = HibernateUtil.getSessionFactory().openSession();

                Product product = hibernateSession.createQuery("FROM Product p " +
                                " left join fetch p.variants v " +
                                "left join fetch v.sizes" +
                                " left join v.images " +
                                "JOIN FETCH p.category " +
                                "WHERE p.id = :proId AND p.status.id=:status ", Product.class)
                        .setParameter("proId", productId)
                        .setParameter("status", 1)
                        .getSingleResult();

                TopProductDTO productDTO = new TopProductDTO();
                productDTO.setProductId(product.getId());
                productDTO.setTitle(product.getTitle());
                productDTO.setCategory(product.getCategory().getName());
                productDTO.setDescription(product.getDescription());
                productDTO.setModel(product.getModel().getName());

                List<Double> prices = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    for (VariantSize size : variant.getSizes()) {
                        prices.add(size.getPrice());
                    }
                }

                if (prices.isEmpty()) {
                    productDTO.setMinPrice((double) 0);
                    productDTO.setMaxPrice((double) 0);
                } else {
                    double minPrice = Collections.min(prices);
                    double maxPrice = Collections.max(prices);

                    productDTO.setMinPrice(minPrice);
                    productDTO.setMaxPrice(maxPrice);

                }

                Set<String> imageSet = new LinkedHashSet<>(); // keeps order + removes duplicates

                for (ProductVariant variant : product.getVariants()) {
                    for (VariantImage image : variant.getImages()) {
                        imageSet.add(image.getFilePath());
                    }
                }

                productDTO.setImages(new ArrayList<>(imageSet));


                List<ColorDTO> colorDTOList = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    ColorDTO colorDTO = new ColorDTO();
                    colorDTO.setName(variant.getColorName());
                    colorDTO.setHexCode(variant.getColorHex());
                    colorDTOList.add(colorDTO);
                }

                productDTO.setColors(colorDTOList);
                responseObject.add("singleProduct", AppUtil.GSON.toJsonTree(productDTO));


            } catch (HibernateException e) {
                message = e.getMessage();
                status = false;
            } finally {
                hibernateSession.close();

            }

        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

}
