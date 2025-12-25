package lk.karu.openbay.dto;

import com.google.gson.JsonObject;

public class ApiResponseDTO {
    private boolean status;
    private String message;
    private JsonObject data;

    // Constructors
    public ApiResponseDTO() {}

    public ApiResponseDTO(boolean status, String message) {
        this.status = status;
        this.message = message;
    }

    public ApiResponseDTO(boolean status, String message, JsonObject data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // Getters and Setters
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public JsonObject getData() { return data; }
    public void setData(JsonObject data) { this.data = data; }
}