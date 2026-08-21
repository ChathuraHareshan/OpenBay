package lk.karu.openbay.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String sku;

    @OneToOne
    @JoinColumn(name = "status_id")
    private Status status;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductVariant> variants = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Set<ProductVariant> getVariants() { return variants; }
    public void setVariants(Set<ProductVariant> variants) { this.variants = variants; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Model getModel() { return model; }
    public void setModel(Model model) { this.model = model; }
}