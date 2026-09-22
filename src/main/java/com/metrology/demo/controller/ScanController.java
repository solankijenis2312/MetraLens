package com.metrology.demo.controller;

import com.metrology.demo.dto.ScanRequest;
import com.metrology.demo.dto.StatusUpdateRequest;
import com.metrology.demo.model.Scan;
import com.metrology.demo.model.ScanFinding;
import com.metrology.demo.repository.ScanRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inspections")
public class ScanController {

	private final ScanRepository scanRepository;

	public ScanController(ScanRepository scanRepository) {
		this.scanRepository = scanRepository;
	}

	@GetMapping
	public ResponseEntity<List<Scan>> getAllInspections() {
		return ResponseEntity.ok(scanRepository.findAllByOrderByScannedAtDesc());
	}

	@GetMapping("/my-inspections")
	public ResponseEntity<List<Scan>> getMyInspections(@RequestParam String email) {
		return ResponseEntity.ok(scanRepository.findByInspectorEmailOrderByScannedAtDesc(email));
	}

	@GetMapping("/review-queue")
	public ResponseEntity<List<Scan>> getReviewQueue() {
		return ResponseEntity.ok(scanRepository.findByStatusOrderByScannedAtDesc("Review needed"));
	}

	@PostMapping
	public ResponseEntity<?> createInspection(@RequestBody ScanRequest request) {
		if (request.productName == null || request.productName.isBlank()) {
			return ResponseEntity.badRequest().body("Product name is required");
		}

		Scan scan = new Scan();
		scan.setInspectorName(request.inspectorName);
		scan.setInspectorEmail(request.inspectorEmail);
		scan.setProductName(request.productName);
		scan.setCommodity(request.commodity);
		scan.setQuantity(request.quantity);
		scan.setMrp(request.mrp);
		scan.setUnitSalePrice(request.unitSalePrice);
		scan.setManufacturer(request.manufacturer);
		scan.setManufacturerAddress(request.manufacturerAddress);
		scan.setOriginCountry(request.originCountry);
		scan.setManufactureDate(request.manufactureDate);
		scan.setExpiryDate(request.expiryDate);
		scan.setShelfLife(request.shelfLife);
		scan.setCareDetails(request.careDetails);
		scan.setRawText(request.rawText);
		scan.setScore(request.score == null ? 0 : request.score);
		scan.setStatus(request.status == null || request.status.isBlank() ? "Review needed" : request.status);

		if (request.findings != null) {
			for (ScanRequest.FindingDto f : request.findings) {
				ScanFinding finding = new ScanFinding(f.label, f.detected, f.value);
				scan.addFinding(finding);
			}
		}

		Scan saved = scanRepository.save(scan);
		return ResponseEntity.ok(saved);
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
		Scan scan = scanRepository.findById(id).orElse(null);
		if (scan == null) {
			return ResponseEntity.notFound().build();
		}
		if (request.status == null || request.status.isBlank()) {
			return ResponseEntity.badRequest().body("Status is required");
		}
		scan.setStatus(request.status);
		Scan updated = scanRepository.save(scan);
		return ResponseEntity.ok(updated);
	}
}
