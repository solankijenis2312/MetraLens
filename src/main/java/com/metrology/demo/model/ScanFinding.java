package com.metrology.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "scan_findings")
public class ScanFinding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String label;
	private Boolean detected;
	private String value;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "scan_id")
	@JsonIgnore
	private Scan scan;

	public ScanFinding() {}

	public ScanFinding(String label, Boolean detected, String value) {
		this.label = label;
		this.detected = detected;
		this.value = value;
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getLabel() { return label; }
	public void setLabel(String label) { this.label = label; }

	public Boolean getDetected() { return detected; }
	public void setDetected(Boolean detected) { this.detected = detected; }

	public String getValue() { return value; }
	public void setValue(String value) { this.value = value; }

	public Scan getScan() { return scan; }
	public void setScan(Scan scan) { this.scan = scan; }
}
