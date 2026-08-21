package lk.karu.openbay.dto;

import java.util.List;

public class ProductVariantDTO {
    private ColorDTO color;
    private List<SizeDTO> sizes;
    private List<ProductImageDTO> images;


    public ColorDTO getColor() { return color; }
    public void setColor(ColorDTO color) { this.color = color; }

    public List<SizeDTO> getSizes() { return sizes; }
    public void setSizes(List<SizeDTO> sizes) { this.sizes = sizes; }

    public List<ProductImageDTO> getImages() { return images; }
    public void setImages(List<ProductImageDTO> images) { this.images = images; }
}