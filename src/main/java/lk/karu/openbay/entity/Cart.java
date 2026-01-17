package lk.karu.openbay.entity;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
public class Cart implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "variant_size_id", nullable = false)
    private VariantSize variantSize;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int qty;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public VariantSize getVariantSize() {
        return variantSize;
    }

    public void setVariantSize(VariantSize variantSize) {
        this.variantSize = variantSize;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }
}
