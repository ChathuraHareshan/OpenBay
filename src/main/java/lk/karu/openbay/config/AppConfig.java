package lk.karu.openbay.config;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;

public class AppConfig extends ResourceConfig {
    public AppConfig() {
        packages("lk.karu.openbay.controller");
        packages("lk.karu.openbay.middleware");
        property(ServerProperties.WADL_FEATURE_DISABLE, true);

        register(org.glassfish.jersey.media.multipart.MultiPartFeature.class);
    }
}
