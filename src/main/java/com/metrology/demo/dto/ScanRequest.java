package com.metrology.demo.dto;

import java.util.List;

public class ScanRequest {
	public String inspectorName;
	public String inspectorEmail;
	public String productName;
	public String commodity;
	public String quantity;
	public String mrp;
	public String unitSalePrice;
	public String manufacturer;
	public String manufacturerAddress;
	public String originCountry;
	public String manufactureDate;
	public String expiryDate;
	public String shelfLife;
	public String careDetails;
	public String rawText;
	public Integer score;
	public String status;
	public List<FindingDto> findings;

	public static class FindingDto {
		public String label;
		public Boolean detected;
		public String value;
	}
}
