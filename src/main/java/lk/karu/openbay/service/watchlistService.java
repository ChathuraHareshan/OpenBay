package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lk.karu.openbay.dto.ProductDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import org.hibernate.Session;

import java.util.List;

public class watchlistService {
    public String addToWatchlist(ProductDTO productDTO, HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if(productDTO.getProductId() == null){
            message = "Product ID not found!";
        }else{

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();



            Product product = hibernateSession.find(Product.class, productDTO.getProductId());



            if(product == null){
                message = "Product not found.";
            }else{





            }
            hibernateSession.close();

        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }

    public String getAllUserwatchlists(HttpServletRequest request) {
        return "";
    }

    public String removeCartItem(int cartId, HttpServletRequest request) {
        return "";
    }
}
