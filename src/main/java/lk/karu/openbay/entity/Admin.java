package lk.karu.openbay.entity;

import jakarta.persistence.*;




@Entity
@Table(name = "admin")
@NamedQuery(name = "Admin.getByEmail",
        query = "FROM Admin a WHERE a.email=:email")

public class Admin extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "first_name", nullable = false, length = 45)
    private String fname;

    @Column(name = "last_name", nullable = false, length = 45)
    private String lname;

    @Column(nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "verification_code",  length = 15)
    private String verificationCode;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public String getLname() {
        return lname;
    }

    public void setLname(String lname) {
        this.lname = lname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

}
