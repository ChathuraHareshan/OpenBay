package lk.karu.openbay.dto;

public class SizeDTO {
    private String size;
    private Double price;
    private Integer quantity;

    public SizeDTO() {}

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}