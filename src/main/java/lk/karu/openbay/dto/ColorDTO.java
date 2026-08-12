package lk.karu.openbay.dto;

import java.util.ArrayList;
import java.util.List;

public class ColorDTO {

    private String name;
    private String hexCode;
    private List<SizeDTO> sizes = new ArrayList<>();

    private List<String> images = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHexCode() { return hexCode; }
    public void setHexCode(String hexCode) { this.hexCode = hexCode; }

    public List<SizeDTO> getSizes() { return sizes; }
    public void setSizes(List<SizeDTO> sizes) { this.sizes = sizes; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}