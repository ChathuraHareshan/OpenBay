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
import java.util.Collections;
import java.util.List;

public class ContentService {


    public String loadModelDetails(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (id <= 0) {
            message = "Please select a brand!";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Category category = hibernateSession.find(Category.class, id);
            if (category == null) {
                message = "Please provide correct brand!";
            } else {
                List<Model> modelList = hibernateSession.createQuery("FROM Model m WHERE m.category=:category", Model.class)
                        .setParameter("category", category)
                        .getResultList();
                if (modelList.isEmpty()) {
                    message = "No models found!";
                } else {
                    responseObject.add("models", AppUtil.GSON.toJsonTree(ContentService.models(modelList)));
                    status = true;
                    message = "Models data loading successful";
                }
            }
            hibernateSession.close();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private static List<JsonObject> models(List<Model> modelList) {
        List<JsonObject> brandJson = new ArrayList<>();
        for (Model b : modelList) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", b.getId());
            obj.addProperty("name", b.getName());
            brandJson.add(obj);
        }
        return brandJson;
    }

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
                                    "JOIN FETCH p.category " +
                                    "ORDER BY p.createdAt DESC",
                            Product.class
                    )
                    .setMaxResults(10)
                    .getResultList();


            for (Product product : products) {

                TopProductDTO dto = new TopProductDTO();
                dto.setProductId(product.getId());
                dto.setTitle(product.getTitle());
                dto.setCategory(product.getCategory().getName());

                List<Double> prices = new ArrayList<>();

                for (ProductVariant variant : product.getVariants()) {
                    for (VariantSize size : variant.getSizes()) {
                        prices.add(size.getPrice());
                    }
                }

                if (prices.isEmpty()) {
                    dto.setMinPrice((double) 0);
                    dto.setMaxPrice((double) 0);
                } else {
                    double minPrice = Collections.min(prices);
                    double maxPrice = Collections.max(prices);

                    dto.setMinPrice(minPrice);
                    dto.setMaxPrice(maxPrice);
                }


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
