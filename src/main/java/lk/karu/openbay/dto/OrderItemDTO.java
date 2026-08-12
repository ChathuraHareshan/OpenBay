package lk.karu.openbay.dto;

public class OrderItemDTO {
    private int id;
    private int orderId;
    private int qty;
    private int rating;
    private double price;
    private double total;
    private String size;
    private String colorName;
    private String colorHex;
    private String productTitle;
    private int productId;
    private int variantSizeId;
    private String variantImageUrl;

    // Constructors
    public OrderItemDTO() {}

    public OrderItemDTO(int id, int qty, double price, String size, String productTitle) {
        this.id = id;
        this.qty = qty;
        this.price = price;
        this.total = price * qty;
        this.size = size;
        this.productTitle = productTitle;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getVariantSizeId() {
        return variantSizeId;
    }

    public void setVariantSizeId(int variantSizeId) {
        this.variantSizeId = variantSizeId;
    }

    public String getVariantImageUrl() {
        return variantImageUrl;
    }

    public void setVariantImageUrl(String variantImageUrl) {
        this.variantImageUrl = variantImageUrl;
    }

    @Override
    public String toString() {
        return "OrderItemDTO{" +
                "id=" + id +
                ", qty=" + qty +
                ", price=" + price +
                ", total=" + total +
                ", size='" + size + '\'' +
                ", productTitle='" + productTitle + '\'' +
                '}';
    }
}