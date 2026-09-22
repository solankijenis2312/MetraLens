package com.metrology.demo;

import com.metrology.demo.model.Scan;
import com.metrology.demo.model.ScanFinding;
import com.metrology.demo.model.TeamMember;
import com.metrology.demo.model.User;
import com.metrology.demo.repository.ScanRepository;
import com.metrology.demo.repository.TeamMemberRepository;
import com.metrology.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	CommandLineRunner initUsers(UserRepository userRepository, TeamMemberRepository teamMemberRepository, ScanRepository scanRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByEmail("jay.chauhan@aletheia.gov.in")) {
				User user1 = new User();
				user1.setName("Jay Chauhan");
				user1.setEmail("jay.chauhan@aletheia.gov.in");
				user1.setPhone("9898098482");
				user1.setPassword(passwordEncoder.encode("inspection2026"));
				user1.setRole("Enforcement officer");
				userRepository.save(user1);
			}

			if (!userRepository.existsByEmail("kabir.singh@aletheia.gov.in")) {
				User user2 = new User();
				user2.setName("Kabir Singh");
				user2.setEmail("kabir.singh@aletheia.gov.in");
				user2.setPhone("9898098484");
				user2.setPassword(passwordEncoder.encode("inspection2026"));
				user2.setRole("Field inspector");
				userRepository.save(user2);
			}

			if (!userRepository.existsByEmail("meera.joshi@aletheia.gov.in")) {
				User user3 = new User();
				user3.setName("Meera Joshi");
				user3.setEmail("meera.joshi@aletheia.gov.in");
				user3.setPhone("9898098483");
				user3.setPassword(passwordEncoder.encode("inspection2026"));
				user3.setRole("Senior inspector");
				userRepository.save(user3);
			}

			if (!userRepository.existsByEmail("arjun.sharma@aletheia.gov.in")) {
				User user4 = new User();
				user4.setName("Arjun Sharma");
				user4.setEmail("arjun.sharma@aletheia.gov.in");
				user4.setPhone("9898098485");
				user4.setPassword(passwordEncoder.encode("inspection2026"));
				user4.setRole("Administrator");
				userRepository.save(user4);
			}

			if (teamMemberRepository.count() == 0) {
				teamMemberRepository.save(new TeamMember("Arjun Sharma", "arjun.sharma@aletheia.gov.in", "Enforcement officer", "Active", 248, "2 min ago"));
				teamMemberRepository.save(new TeamMember("Meera Joshi", "meera.joshi@aletheia.gov.in", "Senior inspector", "Active", 186, "18 min ago"));
				teamMemberRepository.save(new TeamMember("Kabir Singh", "kabir.singh@aletheia.gov.in", "Field inspector", "Away", 94, "1 hr ago"));
			}

			if (scanRepository.count() == 0) {
				Scan scan1 = new Scan();
				scan1.setProductName("EverClean Detergent");
				scan1.setCommodity("Liquid detergent");
				scan1.setQuantity("2 L");
				scan1.setMrp("Rs. 248");
				scan1.setManufacturer("Apex Consumer Products Ltd");
				scan1.setManufacturerAddress("Plot 14, Industrial Area, Sector 62, Noida, UP");
				scan1.setOriginCountry("India");
				scan1.setManufactureDate("08/2026");
				scan1.setExpiryDate("08/2028");
				scan1.setScore(96);
				scan1.setStatus("Compliant");
				scan1.setInspectorName("Kabir Singh");
				scan1.setInspectorEmail("kabir.singh@aletheia.gov.in");
				scan1.addFinding(new ScanFinding("Name of Commodity", true, "Liquid detergent"));
				scan1.addFinding(new ScanFinding("Net Quantity", true, "2 L"));
				scan1.addFinding(new ScanFinding("MRP", true, "Rs. 248"));
				scan1.addFinding(new ScanFinding("Manufacturer Details", true, "Apex Consumer Products Ltd"));
				scanRepository.save(scan1);

				Scan scan2 = new Scan();
				scan2.setProductName("Nilgiri Gold Tea");
				scan2.setCommodity("Black Tea");
				scan2.setQuantity("250 g");
				scan2.setMrp("Rs. 185");
				scan2.setManufacturer("Nilgiri Plantations Pvt Ltd");
				scan2.setManufacturerAddress("Coonoor, Tamil Nadu");
				scan2.setOriginCountry("India");
				scan2.setManufactureDate("07/2026");
				scan2.setExpiryDate("07/2027");
				scan2.setScore(86);
				scan2.setStatus("Review needed");
				scan2.setInspectorName("Kabir Singh");
				scan2.setInspectorEmail("kabir.singh@aletheia.gov.in");
				scan2.addFinding(new ScanFinding("Name of Commodity", true, "Black Tea"));
				scan2.addFinding(new ScanFinding("Net Quantity", true, "250 g"));
				scan2.addFinding(new ScanFinding("MRP", true, "Rs. 185"));
				scan2.addFinding(new ScanFinding("Manufacturer Details", false, "Missing state pin code"));
				scanRepository.save(scan2);

				Scan scan3 = new Scan();
				scan3.setProductName("SunPure Cooking Oil");
				scan3.setCommodity("Edible Oil");
				scan3.setQuantity("1 L");
				scan3.setMrp("Rs. 165");
				scan3.setManufacturer("SunPure Organics Ltd");
				scan3.setManufacturerAddress("Kandla, Gujarat");
				scan3.setOriginCountry("India");
				scan3.setManufactureDate("06/2026");
				scan3.setExpiryDate("12/2026");
				scan3.setScore(78);
				scan3.setStatus("Non-compliant");
				scan3.setInspectorName("Arjun Sharma");
				scan3.setInspectorEmail("arjun.sharma@aletheia.gov.in");
				scan3.addFinding(new ScanFinding("Name of Commodity", true, "Edible Oil"));
				scan3.addFinding(new ScanFinding("Net Quantity", true, "1 L"));
				scan3.addFinding(new ScanFinding("MRP", false, "Unit sale price missing"));
				scanRepository.save(scan3);
			}
		};
	}
}
