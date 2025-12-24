package lk.karu.openbay.config;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

public class AppConfig extends ResourceConfig {
    public AppConfig(){
        packages("lk.karu.openbay.controller");
        packages("lk.karu.openbay.middleware");
        register(org.glassfish.jersey.media.multipart.MultiPartFeature.class);
    }
}
