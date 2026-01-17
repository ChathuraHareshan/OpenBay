package lk.karu.openbay.dto;

import java.io.Serializable;
import java.util.List;

public class CartDTO implements Serializable {

    private int cartId;
    private String title;
    private List<String> image;
    private int qty;
    private double price;
    private int variantSizeId;

    public int getCartId() {
        return cartId;
    }

    public void setCartId(int cartId) {
        this.cartId = cartId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getImage() {
        return image;
    }

    public void setImage(List<String> image) {
        this.image = image;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getVariantSizeId(Long id) {
        return variantSizeId;
    }

    public void setVariantSizeId(int variantSizeId) {
        this.variantSizeId = variantSizeId;
    }
}
