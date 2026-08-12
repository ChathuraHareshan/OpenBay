package lk.karu.openbay.service;

import com.google.gson.JsonObject;
import lk.karu.openbay.dto.InvoiceDTO;
import lk.karu.openbay.dto.InvoiceItemDTO;
import lk.karu.openbay.entity.*;
import lk.karu.openbay.util.AppUtil;
import lk.karu.openbay.util.HibernateUtil;
import lk.karu.openbay.validation.Validator;
import org.hibernate.Session;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class InvoiceService {

    private static final String INVOICE_PAID_STATUS = "PAID";


    public String getInvoiceData(String orderId) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        int oId = Integer.parseInt(orderId.replaceAll(Validator.NON_DIGIT_PATTERN, ""));

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        Order order = hibernateSession.find(Order.class, oId);

        if(order == null){
            message = "Invoice order details. Please check credentials!";
        }else{

            if(order.getStatus().getValue().equals(String.valueOf(Status.Type.COMPLETED))){

                InvoiceDTO invoiceDTO = new InvoiceDTO();
                invoiceDTO.setInvoiceNo("000" + order.getId());
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
                invoiceDTO.setInvoiceDate(formatter.format(order.getCreatedAt()));
                invoiceDTO.setShippingCharges(order.getShippingFee());

                User user = order.getUser();
                invoiceDTO.setBuyerName(user.getFname() + " " + user.getLname());
                Address address = hibernateSession.createQuery("FROM Address a where a.user=:user AND a.isPrimary=true", Address.class)
                        .setParameter("user", user)
                        .getSingleResult();

                invoiceDTO.setAddress(address.getLineOne() +
                        (address.getLineTwo() != null && !address.getLineTwo().isBlank() ? ", " + address.getLineTwo() : ""));
                invoiceDTO.setCityName(address.getCity().getName());

                invoiceDTO.setLineOne(address.getLineOne());
                invoiceDTO.setLineTwo(address.getLineTwo());
                invoiceDTO.setPcode(address.getPostalCode());

                invoiceDTO.setMobile(address.getMobile());

                invoiceDTO.setCountryName("Sri Lanka");
                invoiceDTO.setEmail(user.getEmail());

                List<InvoiceItemDTO> itemDTOS = new ArrayList<>();

                for(OrderItem orderItem: order.getOrderItems()){
                    InvoiceItemDTO itemDTO = new InvoiceItemDTO();
                    itemDTO.setItemName(orderItem.getVariantSize().getVariant().getProduct().getTitle());
                    itemDTO.setItemQty(orderItem.getQty());
                    itemDTO.setItemPrice(orderItem.getVariantSize().getPrice());
                    itemDTO.setColorName(orderItem.getVariantSize().getVariant().getColorName());
                    itemDTO.setSizeName(orderItem.getVariantSize().getSize());
                    itemDTOS.add(itemDTO);


                }

                invoiceDTO.setInvoiceItemDTOList(itemDTOS);
                invoiceDTO.setInvoiceStatus(InvoiceService.INVOICE_PAID_STATUS);

                status = true;
                responseObject.add("invoiceData", AppUtil.GSON.toJsonTree(invoiceDTO));


            }

        }

        hibernateSession.close();

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }
}
