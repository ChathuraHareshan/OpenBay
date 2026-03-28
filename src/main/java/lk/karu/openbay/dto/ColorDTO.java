package lk.karu.openbay.dto;

import java.util.List;

public class ColorDTO {
    private String name;
    private String hexCode;
    private List<SizeDTO> sizes;


    // Constructors
    public ColorDTO() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHexCode() { return hexCode; }
    public void setHexCode(String hexCode) { this.hexCode = hexCode; }

    public List<SizeDTO> getSizes() {
        return sizes;
    }

    public void setSizes(List<SizeDTO> sizes) {
        this.sizes = sizes;
    }
}