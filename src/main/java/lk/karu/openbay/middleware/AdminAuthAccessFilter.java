package lk.karu.openbay.middleware;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

public class AdminAuthAccessFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;


        HttpSession httpSession = request.getSession(false);

        if (httpSession != null && httpSession.getAttribute("admin") != null) {
            response.sendRedirect("adminIndex.html");

        } else {
            filterChain.doFilter(servletRequest, servletResponse);
            response.setHeader("Cache-Control", "no-cache, no-store, revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setDateHeader("Expires", 0);

        }

    }
}
