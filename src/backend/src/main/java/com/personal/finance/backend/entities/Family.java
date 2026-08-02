package com.personal.finance.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Family extends Base {

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true)
    private String inviteCode;

    @OneToOne
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    @JsonIgnore
    private User owner;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<FamilyMember> members = new ArrayList<>();
}