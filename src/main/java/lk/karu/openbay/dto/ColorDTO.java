package lk.karu.openbay.dto;

public class ColorDTO {
    private String name;
    private String hexCode;

    // Constructors
    public ColorDTO() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHexCode() { return hexCode; }
    public void setHexCode(String hexCode) { this.hexCode = hexCode; }
}