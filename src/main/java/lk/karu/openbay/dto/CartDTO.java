package lk.karu.openbay.dto;

import java.io.Serializable;

public class CartDTO implements Serializable {

    private int cartId;
    private String title;
    private String color;
    private String size;
    private String image;
    private int qty;
    private double price;
    private int variantSizeId;
    private long productId;
    private double totalPrice;



    public void setProductId(long productId) {
        this.productId = productId;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getCartId() {
        return cartId;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public int getVariantSizeId() {
        return variantSizeId;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
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
