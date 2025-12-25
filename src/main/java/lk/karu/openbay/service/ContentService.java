package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import lk.karu.openbay.entity.Category;
import lk.karu.openbay.entity.City;
import lk.karu.openbay.entity.Color;
import lk.karu.openbay.entity.Size;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;

import java.util.List;

public class ContentService {

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
