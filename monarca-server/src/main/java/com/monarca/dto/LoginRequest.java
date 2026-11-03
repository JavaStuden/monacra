package com.monarca.dto;

public class LoginRequest {
    private String phone;
    private String otp;

    public LoginRequest() {}

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
