package com.metrology.demo.dto;

public class AuthResponse {
	public String token;
	public String name;
	public String email;
	public String role;

	public AuthResponse(String token, String name, String email, String role) {
		this.token = token;
		this.name = name;
		this.email = email;
		this.role = role;
	}
}
