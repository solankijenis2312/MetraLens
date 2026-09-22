package com.metrology.demo.controller;

import com.metrology.demo.dto.TeamMemberRequest;
import com.metrology.demo.model.TeamMember;
import com.metrology.demo.repository.TeamMemberRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/team")
public class TeamController {

	private final TeamMemberRepository teamMemberRepository;

	public TeamController(TeamMemberRepository teamMemberRepository) {
		this.teamMemberRepository = teamMemberRepository;
	}

	@GetMapping
	public ResponseEntity<List<TeamMember>> getTeamMembers() {
		return ResponseEntity.ok(teamMemberRepository.findAllByOrderByIdDesc());
	}

	@PostMapping
	public ResponseEntity<?> addTeamMember(@RequestBody TeamMemberRequest request) {
		if (request.name == null || request.name.isBlank() || request.email == null || request.email.isBlank()) {
			return ResponseEntity.badRequest().body("Name and email are required");
		}
		if (teamMemberRepository.existsByEmail(request.email.trim().toLowerCase())) {
			return ResponseEntity.badRequest().body("Team member with this email already exists");
		}

		TeamMember member = new TeamMember();
		member.setName(request.name.trim());
		member.setEmail(request.email.trim().toLowerCase());
		member.setRole(request.role == null ? "Field inspector" : request.role);
		member.setStatus("Active");
		member.setScans(0);
		member.setLastActive("Just added");

		TeamMember saved = teamMemberRepository.save(member);
		return ResponseEntity.ok(saved);
	}
}
