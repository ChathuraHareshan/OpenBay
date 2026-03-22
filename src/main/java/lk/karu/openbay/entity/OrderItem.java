package lk.karu.openbay.entity;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "order_items")
public class OrderItem implements Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private int qty;

    @Column(nullable = false)
    private int rating;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(cascade = CascadeType.ALL , fetch =  FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private VariantSize variantSize;

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public VariantSize getVariantSize() {
        return variantSize;
    }

    public void setVariantSize(VariantSize variantSize) {
        this.variantSize = variantSize;
    }
}
