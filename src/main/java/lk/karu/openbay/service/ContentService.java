package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import com.google.protobuf.Message;
import lk.karu.openbay.dto.ColorDTO;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.dto.TopProductDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.HibernateException;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class ContentService {
    private static final int MAX_RESULT = 10;

    public String loadTopProduct() {

        JsonObject responseObject = new JsonObject();
        Session session = HibernateUtil.getSessionFactory().openSession();

        List<TopProductDTO> homeProductList = new ArrayList<>();

        try {

            List<Product> products = session.createQuery(
                    "SELECT DISTINCT p FROM Product p " +
                            "LEFT JOIN FETCH p.variants v " +
                            "LEFT JOIN FETCH v.sizes " +
                            "LEFT JOIN FETCH v.images " +
                            "LEFT JOIN FETCH p.category",
                    Product.class
            ).setMaxResults(8).getResultList(); // home page limit

            for (Product product : products) {

                TopProductDTO dto = new TopProductDTO();
                dto.setProductId(product.getId());
                dto.setTitle(product.getTitle());
                dto.setCategory(product.getCategory().getName());

                // MIN / MAX PRICE
                double minPrice = Double.MAX_VALUE;
                double maxPrice = 0;

                for (ProductVariant variant : product.getVariants()) {
                    for (VariantSize size : variant.getSizes()) {
                        double price = size.getPrice();

                        if (price < minPrice) {
                            minPrice = price;
                        }
                        if (price > maxPrice) {
                            maxPrice = price;
                        }
                    }
                }

                dto.setMinPrice(minPrice == Double.MAX_VALUE ? 0 : minPrice);
                dto.setMaxPrice(maxPrice);

                // GET ONLY 2 IMAGES
                List<String> images = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    for (VariantImage image : variant.getImages()) {
                        if (images.size() < 2) {
                            images.add(image.getFilePath());
                        }
                    }
                    if (images.size() == 2) break;
                }

                dto.setImages(images);

                // COLORS FROM VARIANTS
                List<ColorDTO> colorDTOList = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    ColorDTO colorDTO = new ColorDTO();
                    colorDTO.setName(variant.getColorName());
                    colorDTO.setHexCode(variant.getColorHex());
                    colorDTOList.add(colorDTO);
                }

                dto.setColors(colorDTOList);

                homeProductList.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            session.close();
        }

        responseObject.add("newArrivals",
                AppUtil.GSON.toJsonTree(homeProductList));

        return AppUtil.GSON.toJson(responseObject);
    }


    public String loadAllCities(){
        JsonObject responseObject = new JsonObject();


        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        List<City> cityList = hibernateSession.createQuery("FROM City c", City.class).getResultList();
        responseObject.add("cities", AppUtil.GSON.toJsonTree(cityList));
        hibernateSession.close();


        return AppUtil.GSON.toJson(responseObject);

    }

    public String loadAllCategory(){

        JsonObject responseObject = new JsonObject();

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        List<Category> categoryList = hibernateSession.createQuery("FROM Category c", Category.class).getResultList();
        responseObject.add("categories", AppUtil.GSON.toJsonTree(categoryList));
        hibernateSession.close();


        return AppUtil.GSON.toJson(responseObject);
    }

    public String loadAllColors() {
        JsonObject responseObject = new JsonObject();

        try {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

            // Query to get all active colors
            List<Color> colorList = hibernateSession.createQuery(
                    "FROM Color c ",
                    Color.class
            ).getResultList();

            responseObject.addProperty("status", true);
            responseObject.add("colors", AppUtil.GSON.toJsonTree(colorList));

            hibernateSession.close();

        } catch (Exception e) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading colors: " + e.getMessage());
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String loadAllSizes() {
        JsonObject responseObject = new JsonObject();

        try {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

            // Query to get all sizes (you might want to add status filter if needed)
            List<Size> sizeList = hibernateSession.createQuery(
                    "FROM Size s ORDER BY s.id",
                    Size.class
            ).getResultList();



            responseObject.addProperty("status", true);
            responseObject.add("sizes", AppUtil.GSON.toJsonTree(sizeList));

            hibernateSession.close();

        } catch (Exception e) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading sizes: " + e.getMessage());
        }

        return AppUtil.GSON.toJson(responseObject);
    }


}
