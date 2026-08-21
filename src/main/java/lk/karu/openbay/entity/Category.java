package lk.karu.openbay.entity;

import jakarta.persistence.*;

import java.io.Serializable;


@Entity
@Table(name = "categories")
public class Category implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToOne
    @JoinColumn(name = "view_id")
    private Status viewStatus;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Status getViewStatus() {
        return viewStatus;
    }

    public void setViewStatus(Status viewStatus) {
        this.viewStatus = viewStatus;
    }
}
