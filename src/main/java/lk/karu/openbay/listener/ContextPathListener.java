package lk.karu.openbay.listener;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import lk.karu.openbay.provider.MailServiceProvider;

@WebListener
public class ContextPathListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        MailServiceProvider.getInstance().start();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        MailServiceProvider.getInstance().shutdown();
    }
}
