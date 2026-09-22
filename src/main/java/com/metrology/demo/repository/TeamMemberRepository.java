package com.metrology.demo.repository;

import com.metrology.demo.model.TeamMember;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
	List<TeamMember> findAllByOrderByIdDesc();
	boolean existsByEmail(String email);
}
