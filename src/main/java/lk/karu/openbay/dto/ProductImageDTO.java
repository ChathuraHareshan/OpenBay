package lk.karu.openbay.dto;

public class ProductImageDTO {

    private String fileName;
    private String fileType;
    private String base64Data;  // present only for NEW uploads
    private String filePath;    // present only for EXISTING images (returned from server)

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getBase64Data() { return base64Data; }
    public void setBase64Data(String base64Data) { this.base64Data = base64Data; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
}