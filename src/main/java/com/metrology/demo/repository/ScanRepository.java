package com.metrology.demo.repository;

import com.metrology.demo.model.Scan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScanRepository extends JpaRepository<Scan, Long> {
	List<Scan> findAllByOrderByScannedAtDesc();
	List<Scan> findByInspectorEmailOrderByScannedAtDesc(String inspectorEmail);
	List<Scan> findByStatusOrderByScannedAtDesc(String status);
}
