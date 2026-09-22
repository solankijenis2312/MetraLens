package com.metrology.demo.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scans")
public class Scan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "inspector_name")
	private String inspectorName;

	@Column(name = "inspector_email")
	private String inspectorEmail;

	@Column(name = "product_name", nullable = false)
	private String productName;

	private String commodity;
	private String quantity;
	private String mrp;

	@Column(name = "unit_sale_price")
	private String unitSalePrice;

	private String manufacturer;

	@Column(name = "manufacturer_address", columnDefinition = "TEXT")
	private String manufacturerAddress;

	@Column(name = "origin_country")
	private String originCountry;

	@Column(name = "manufacture_date")
	private String manufactureDate;

	@Column(name = "expiry_date")
	private String expiryDate;

	@Column(name = "shelf_life")
	private String shelfLife;

	@Column(name = "care_details", columnDefinition = "TEXT")
	private String careDetails;

	@Column(name = "raw_text", columnDefinition = "TEXT")
	private String rawText;

	private Integer score;
	private String status;

	@Column(name = "scanned_at")
	private LocalDateTime scannedAt;

	@OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private List<ScanFinding> findings = new ArrayList<>();

	public Scan() {
		this.scannedAt = LocalDateTime.now();
	}

	public void addFinding(ScanFinding finding) {
		findings.add(finding);
		finding.setScan(this);
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }

	public String getInspectorName() { return inspectorName; }
	public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

	public String getInspectorEmail() { return inspectorEmail; }
	public void setInspectorEmail(String inspectorEmail) { this.inspectorEmail = inspectorEmail; }

	public String getProductName() { return productName; }
	public void setProductName(String productName) { this.productName = productName; }

	public String getCommodity() { return commodity; }
	public void setCommodity(String commodity) { this.commodity = commodity; }

	public String getQuantity() { return quantity; }
	public void setQuantity(String quantity) { this.quantity = quantity; }

	public String getMrp() { return mrp; }
	public void setMrp(String mrp) { this.mrp = mrp; }

	public String getUnitSalePrice() { return unitSalePrice; }
	public void setUnitSalePrice(String unitSalePrice) { this.unitSalePrice = unitSalePrice; }

	public String getManufacturer() { return manufacturer; }
	public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

	public String getManufacturerAddress() { return manufacturerAddress; }
	public void setManufacturerAddress(String manufacturerAddress) { this.manufacturerAddress = manufacturerAddress; }

	public String getOriginCountry() { return originCountry; }
	public void setOriginCountry(String originCountry) { this.originCountry = originCountry; }

	public String getManufactureDate() { return manufactureDate; }
	public void setManufactureDate(String manufactureDate) { this.manufactureDate = manufactureDate; }

	public String getExpiryDate() { return expiryDate; }
	public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

	public String getShelfLife() { return shelfLife; }
	public void setShelfLife(String shelfLife) { this.shelfLife = shelfLife; }

	public String getCareDetails() { return careDetails; }
	public void setCareDetails(String careDetails) { this.careDetails = careDetails; }

	public String getRawText() { return rawText; }
	public void setRawText(String rawText) { this.rawText = rawText; }

	public Integer getScore() { return score; }
	public void setScore(Integer score) { this.score = score; }

	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }

	public LocalDateTime getScannedAt() { return scannedAt; }
	public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

	public List<ScanFinding> getFindings() { return findings; }
	public void setFindings(List<ScanFinding> findings) { this.findings = findings; }
}
