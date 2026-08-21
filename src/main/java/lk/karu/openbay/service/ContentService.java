package lk.karu.openbay.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.protobuf.Message;
import lk.karu.openbay.dto.ColorDTO;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.dto.SizeDTO;
import lk.karu.openbay.dto.TopProductDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.query.Query;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ContentService {

    public String loadProductTab(){

        JsonObject responseObject =  new JsonObject();
        boolean status = false;
        String message = "";

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();


        try{

            List<Category> categories = hibernateSession.createQuery("FROM Category c WHERE c.viewStatus.id=:status order by c.id", Category.class)
                    .setParameter("status", 7).getResultList();

            JsonArray categoryArray = new JsonArray();
            JsonObject productsObject = new JsonObject();

            for(Category category : categories){
                JsonObject categoryObject = new JsonObject();
                categoryObject.addProperty("id", category.getId());
                categoryObject.addProperty("name", category.getName());
                categoryArray.add(categoryObject);

                List<Product> products = hibernateSession.createQuery("FROM Product p " +
                                " left join fetch p.variants v " +
                                "left join fetch v.sizes" +
                                " left join v.images " +
                                "WHERE p.category.id = :categoryId AND p.status.id=:status " +
                                "order by p.id desc ", Product.class)
                        .setParameter("categoryId", category.getId())
                        .setParameter("status", 1)
                        .setMaxResults(10)
                        .getResultList();

                List<TopProductDTO> categoryProducts = new ArrayList<>();

                for(Product product: products){
                    TopProductDTO dto = convertProductsToDTO(product);
                    categoryProducts.add(dto);
                }

                String categoryKey = category.getName().toLowerCase()
                        .replace("'s", "")
                        .replace(" ", "_")
                        .replace("_fashion","");

                productsObject.add(categoryKey, AppUtil.GSON.toJsonTree(categoryProducts));

            }

            responseObject.add("categories", categoryArray);
            responseObject.add("productsObject", productsObject);
            status = true;
            message = "Category Product load ok.";



        }catch (HibernateException e){
            message = e.getMessage();
            status = false;
        }finally {
            hibernateSession.close();
        }


        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private TopProductDTO convertProductsToDTO(Product products){

        TopProductDTO dto = new TopProductDTO();
        dto.setProductId(products.getId());
        dto.setTitle(products.getTitle());
        dto.setCategory(products.getCategory().getName());

        List<SizeDTO> sizeDTOList = new ArrayList<>();
        for (ProductVariant variant : products.getVariants()) {
            for (VariantSize size : variant.getSizes()) {
                SizeDTO sizeDTO = new SizeDTO();
                sizeDTO.setSize(size.getSize());
                sizeDTOList.add(sizeDTO);
            }
        }

        dto.setSizes(sizeDTOList);

        List<Double> prices = new ArrayList<>();
        for (ProductVariant variant : products.getVariants()) {
            for (VariantSize size : variant.getSizes()) {
                prices.add(size.getPrice());
            }
        }



        if (prices.isEmpty()) {
            dto.setMinPrice(0.0);
            dto.setMaxPrice(0.0);
        } else {
            dto.setMinPrice(Collections.min(prices));
            dto.setMaxPrice(Collections.max(prices));
        }

        List<String> images = new ArrayList<>();
        for (ProductVariant variant : products.getVariants()) {
            for (VariantImage image : variant.getImages()) {
                if (images.size() < 2) {
                    images.add(image.getFilePath());
                }
            }
            if (images.size() == 2) break;
        }
        dto.setImages(images);

        List<ColorDTO> colorDTOList = new ArrayList<>();
        for (ProductVariant variant : products.getVariants()) {
            ColorDTO colorDTO = new ColorDTO();
            colorDTO.setName(variant.getColorName());
            colorDTO.setHexCode(variant.getColorHex());
            colorDTOList.add(colorDTO);
        }
        dto.setColors(colorDTOList);

        return dto;

    }

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
                        if (images.size() < variant.getImages().size()) {
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

    public String searchProducts(String keyword) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message;
        JsonArray resultsArray = new JsonArray();

        if (keyword == null || keyword.trim().isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Search keyword is required");
            responseObject.add("results", resultsArray);
            return AppUtil.GSON.toJson(responseObject);
        }

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {

            List<Product> products = hibernateSession.createQuery(
                            "SELECT DISTINCT p FROM Product p " +
                                    "LEFT JOIN FETCH p.variants v " +
                                    "LEFT JOIN FETCH v.sizes " +
                                    "LEFT JOIN FETCH v.images " +
                                    "JOIN FETCH p.category c " +
                                    "WHERE p.status.id = :statusId " +
                                    "AND (LOWER(p.title) LIKE :keyword OR LOWER(c.name) LIKE :keyword) " +
                                    "ORDER BY p.id DESC",
                            Product.class
                    )
                    .setParameter("statusId", 1)
                    .setParameter("keyword", "%" + keyword.trim().toLowerCase() + "%")
                    .setMaxResults(20)
                    .getResultList();

            List<TopProductDTO> results = new ArrayList<>();
            for (Product product : products) {
                results.add(convertProductsToDTO(product));
            }

            resultsArray = AppUtil.GSON.toJsonTree(results).getAsJsonArray();
            status = true;
            message = "Search completed";

        } catch (HibernateException e) {
            message = e.getMessage();
        } finally {
            hibernateSession.close();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        responseObject.add("results", resultsArray);
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