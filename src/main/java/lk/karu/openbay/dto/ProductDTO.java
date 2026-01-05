package lk.karu.openbay.dto;

import java.util.List;

public class ProductDTO {
    private Long productId;
    private String title;
    private String description;
    private String category;
    private String model;
    private String sku;
    private List<ProductVariantDTO> variants;


    // Constructors
    public ProductDTO() {}

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }



    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public List<ProductVariantDTO> getVariants() { return variants; }
    public void setVariants(List<ProductVariantDTO> variants) { this.variants = variants; }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}