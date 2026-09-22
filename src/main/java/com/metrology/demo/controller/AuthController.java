package com.metrology.demo.controller;

import com.metrology.demo.dto.AuthResponse;
import com.metrology.demo.dto.LoginRequest;
import com.metrology.demo.dto.RegisterRequest;
import com.metrology.demo.model.User;
import com.metrology.demo.repository.UserRepository;
import com.metrology.demo.security.JwtUtil;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final List<String> VALID_ROLES = List.of(
			"Enforcement officer", "Senior inspector", "Field inspector", "Administrator");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
		String email = normalize(request.email);
		if (isBlank(request.name) || isBlank(email) || isBlank(request.password) || isBlank(request.role)) {
			return ResponseEntity.badRequest().body("Name, email, password and role are required");
		}
		if (request.password.length() < 8) {
			return ResponseEntity.badRequest().body("Password must be at least 8 characters");
		}
		if (userRepository.existsByEmail(email)) {
			return ResponseEntity.badRequest().body("Email already registered");
		}
		if (!VALID_ROLES.contains(request.role)) {
			return ResponseEntity.badRequest().body("Invalid role");
		}

		User user = new User();
		user.setName(request.name.trim());
		user.setEmail(email);
		user.setPhone(request.phone == null ? "" : request.phone.trim());
		user.setPassword(passwordEncoder.encode(request.password));
		user.setRole(request.role);
		userRepository.save(user);

		return ResponseEntity.ok(toResponse(user));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request) {
		String email = normalize(request.email);
		if (isBlank(email) || isBlank(request.password) || isBlank(request.phone) || isBlank(request.role)) {
			return ResponseEntity.badRequest().body("Email, phone number, password, and role are required");
		}

		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
		}

		if (!passwordEncoder.matches(request.password, user.getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password for this user");
		}

		String reqPhoneDigits = sanitizePhone(request.phone);
		String userPhoneDigits = sanitizePhone(user.getPhone());
		if (!userPhoneDigits.isBlank() && !reqPhoneDigits.isBlank() && !userPhoneDigits.equals(reqPhoneDigits)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Phone number does not match user account");
		}

		if (!user.getRole().trim().equalsIgnoreCase(request.role.trim())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Selected role does not match user account role (" + user.getRole() + ")");
		}

		return ResponseEntity.ok(toResponse(user));
	}

	private static String sanitizePhone(String value) {
		if (value == null) return "";
		String digits = value.replaceAll("\\D", "");
		return digits.length() >= 10 ? digits.substring(digits.length() - 10) : digits;
	}

	private AuthResponse toResponse(User user) {
		return new AuthResponse(jwtUtil.generateToken(user.getEmail(), user.getRole()),
				user.getName(), user.getEmail(), user.getRole());
	}

	private static String normalize(String value) {
		return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
