package com.cims.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for User response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String businessUnit;
    private String location;
    private String phoneNumber;
    private String profilePictureUrl;
    private String status;
    private Set<String> roles;
    private LocalDateTime lastLogin;
    private Boolean emailVerified;
    private Boolean mfaEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}

// Made with Bob
