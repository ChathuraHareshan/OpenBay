package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import lk.karu.openbay.entity.City;
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

}
