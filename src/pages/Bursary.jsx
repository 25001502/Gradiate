import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import db from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaExternalLinkAlt,
  FaUserCircle,
  FaPencilAlt,
  FaGraduationCap,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUniversity,
  FaFilter,
} from "react-icons/fa";

// ── South African bursary data ──────────────────────────────────────────────
const BURSARIES = [
  // ── Government / Public Sector ──
  {
    id: "nsfas",
    name: "NSFAS Bursary",
    provider: "National Student Financial Aid Scheme",
    fields: ["All Fields"],
    province: "All Provinces",
    deadline: "Usually November each year",
    description:
      "Government-funded financial aid covering tuition, accommodation, meals, books and living allowances for students from households earning under R350,000 per year.",
    applyUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
    tags: ["government", "undergraduate"],
    covers: "Tuition, Accommodation, Living Allowance, Books",
  },
  {
    id: "funza-lushaka",
    name: "Funza Lushaka Bursary",
    provider: "Department of Basic Education",
    fields: ["Education", "Teaching"],
    province: "All Provinces",
    deadline: "Usually January each year",
    description:
      "Full-cost bursary for students pursuing a teaching qualification. Recipients are required to teach at a public school for the same number of years they received the bursary.",
    applyUrl: "https://www.funzalushaka.doe.gov.za/",
    tags: ["government", "teaching", "undergraduate"],
    covers: "Tuition, Accommodation, Books, Living Allowance",
  },
  {
    id: "dhet-bursary",
    name: "DHET Bursary",
    provider: "Department of Higher Education and Training",
    fields: ["All Fields"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries administered by the Department of Higher Education for students at public universities and TVET colleges, focusing on scarce skills areas.",
    applyUrl: "https://www.dhet.gov.za/",
    tags: ["government", "undergraduate"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "dept-agriculture",
    name: "Department of Agriculture Bursary",
    provider: "Department of Agriculture, Land Reform and Rural Development",
    fields: ["Agriculture", "Environmental Science", "Veterinary Science"],
    province: "All Provinces",
    deadline: "Usually September each year",
    description:
      "Bursaries for South African citizens studying agriculture-related fields. Applicants must be willing to work for the department after completing their studies.",
    applyUrl: "https://www.dalrrd.gov.za/",
    tags: ["government", "agriculture"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "dept-water",
    name: "Department of Water and Sanitation Bursary",
    provider: "Department of Water and Sanitation",
    fields: ["Engineering", "Environmental Science", "Hydrology", "Chemistry"],
    province: "All Provinces",
    deadline: "Usually September each year",
    description:
      "Aimed at students in water-related fields of study including civil engineering, chemistry, hydrology, environmental science and water resource management.",
    applyUrl: "https://www.dws.gov.za/",
    tags: ["government", "engineering", "science"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "saps-bursary",
    name: "SAPS Bursary",
    provider: "South African Police Service",
    fields: ["Policing", "Forensic Science", "Law", "IT"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students interested in careers with the South African Police Service, covering fields such as forensic science, policing, IT, and law.",
    applyUrl: "https://www.saps.gov.za/careers/bursaries.php",
    tags: ["government", "law enforcement"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "dept-transport",
    name: "Department of Transport Bursary",
    provider: "Department of Transport",
    fields: ["Engineering", "Transport Management", "Logistics", "Maritime Studies"],
    province: "All Provinces",
    deadline: "Usually August – September",
    description:
      "Supports students in transport-related fields including civil engineering, logistics, maritime studies, and transport economics.",
    applyUrl: "https://www.transport.gov.za/",
    tags: ["government", "engineering", "transport"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "dept-energy",
    name: "Department of Mineral Resources and Energy Bursary",
    provider: "Department of Mineral Resources and Energy",
    fields: ["Mining Engineering", "Geology", "Energy Studies", "Chemical Engineering"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students pursuing qualifications in mining, geology, energy, and related fields to address the skills shortage in the minerals and energy sector.",
    applyUrl: "https://www.dmr.gov.za/",
    tags: ["government", "mining", "energy"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "gcis-bursary",
    name: "GCIS Bursary",
    provider: "Government Communication and Information System",
    fields: ["Communication", "Journalism", "Media Studies", "IT"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursary opportunities for students pursuing communication, journalism, media, and information technology-related studies.",
    applyUrl: "https://www.gcis.gov.za/",
    tags: ["government", "media", "communications"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "dept-public-works",
    name: "Department of Public Works Bursary",
    provider: "Department of Public Works and Infrastructure",
    fields: ["Engineering", "Architecture", "Quantity Surveying", "Construction"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students studying built environment disciplines including architecture, civil engineering, quantity surveying, and construction management.",
    applyUrl: "https://www.publicworks.gov.za/",
    tags: ["government", "engineering", "construction"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "rand-water",
    name: "Rand Water Bursary",
    provider: "Rand Water",
    fields: ["Engineering", "Chemistry", "Environmental Science", "IT"],
    province: "Gauteng",
    deadline: "Usually September each year",
    description:
      "Bursaries for students pursuing studies in fields related to water supply and management, including engineering, chemistry, and environmental sciences.",
    applyUrl: "https://www.randwater.co.za/",
    tags: ["public entity", "engineering", "science"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "umgeni-water",
    name: "Umgeni Water Bursary",
    provider: "Umgeni Water",
    fields: ["Engineering", "Chemistry", "Environmental Science"],
    province: "KwaZulu-Natal",
    deadline: "Usually September each year",
    description:
      "Supports students in KwaZulu-Natal studying water-related disciplines. Recipients are required to complete vacation work with Umgeni Water.",
    applyUrl: "https://www.umgeni.co.za/",
    tags: ["public entity", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "idc-bursary",
    name: "IDC Bursary",
    provider: "Industrial Development Corporation",
    fields: ["Engineering", "Finance", "Economics", "IT"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "The IDC provides bursaries to South African citizens studying towards qualifications in scarce-skills fields aligned to the organisation's mandate.",
    applyUrl: "https://www.idc.co.za/",
    tags: ["public entity", "finance", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "dbsa-bursary",
    name: "DBSA Bursary",
    provider: "Development Bank of Southern Africa",
    fields: ["Economics", "Finance", "Engineering", "Environmental Science"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for academically talented students in fields supporting development financing across Southern Africa.",
    applyUrl: "https://www.dbsa.org/",
    tags: ["public entity", "finance", "development"],
    covers: "Tuition, Accommodation",
  },
  // ── Mining / Resources ──
  {
    id: "sasol-bursary",
    name: "Sasol Bursary",
    provider: "Sasol Limited",
    fields: ["Chemical Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemistry", "IT"],
    province: "All Provinces",
    deadline: "Usually March – June each year",
    description:
      "One of South Africa's most comprehensive bursary programmes covering tuition, accommodation, meals, books and a personal allowance for STEM students.",
    applyUrl: "https://www.sasol.com/careers/students-and-graduates",
    tags: ["corporate", "energy", "engineering"],
    covers: "Tuition, Accommodation, Books, Meals, Personal Allowance",
  },
  {
    id: "anglo-american",
    name: "Anglo American Bursary",
    provider: "Anglo American",
    fields: ["Mining Engineering", "Geology", "Metallurgy", "Mechanical Engineering", "Electrical Engineering"],
    province: "All Provinces",
    deadline: "Usually March – April",
    description:
      "Bursaries for students in mining-related disciplines, covering full tuition and living costs. Vacation work opportunities included.",
    applyUrl: "https://www.angloamerican.com/careers/students-and-graduates",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "de-beers",
    name: "De Beers Bursary",
    provider: "De Beers Group",
    fields: ["Mining Engineering", "Geology", "Mechanical Engineering", "Electrical Engineering"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Bursaries for South African students in mining and engineering fields. Includes vacation work placement at De Beers operations.",
    applyUrl: "https://www.debeersgroup.com/careers",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "harmony-gold",
    name: "Harmony Gold Bursary",
    provider: "Harmony Gold Mining Company",
    fields: ["Mining Engineering", "Geology", "Metallurgy", "Electrical Engineering"],
    province: "Free State, Gauteng",
    deadline: "Usually March – April",
    description:
      "Bursaries for students pursuing mining-related qualifications. Includes practical work experience during vacations.",
    applyUrl: "https://www.harmony.co.za/careers/bursary-programme",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "sibanye-stillwater",
    name: "Sibanye-Stillwater Bursary",
    provider: "Sibanye-Stillwater",
    fields: ["Mining Engineering", "Metallurgy", "Chemical Engineering", "Geology"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Comprehensive bursaries for students in the mining, metallurgy, and geological fields with vacation work opportunities.",
    applyUrl: "https://www.sibanyestillwater.com/careers/",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "anglogold-ashanti",
    name: "AngloGold Ashanti Bursary",
    provider: "AngloGold Ashanti",
    fields: ["Mining Engineering", "Geology", "Metallurgy", "Mechanical Engineering"],
    province: "All Provinces",
    deadline: "Usually March – April",
    description:
      "Bursaries for university students pursuing qualifications relevant to the gold mining industry.",
    applyUrl: "https://www.anglogoldashanti.com/careers/",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "implats",
    name: "Impala Platinum (Implats) Bursary",
    provider: "Impala Platinum Holdings",
    fields: ["Mining Engineering", "Chemical Engineering", "Metallurgy", "Geology"],
    province: "Limpopo, North West, Gauteng",
    deadline: "Usually March each year",
    description:
      "Full bursaries for students in platinum mining-related studies, with vacation work at Implats operations.",
    applyUrl: "https://www.implats.co.za/bursaries.php",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "kumba-iron-ore",
    name: "Kumba Iron Ore Bursary",
    provider: "Kumba Iron Ore (Anglo American)",
    fields: ["Mining Engineering", "Mechanical Engineering", "Electrical Engineering", "Geology"],
    province: "Northern Cape, Gauteng",
    deadline: "Usually March – April",
    description:
      "Bursaries for students pursuing mining and engineering qualifications, with vacation work at Sishen or Kolomela mines.",
    applyUrl: "https://www.angloamericankumba.com/careers",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "samancor",
    name: "Samancor Chrome Bursary",
    provider: "Samancor Chrome",
    fields: ["Mining Engineering", "Metallurgy", "Chemical Engineering", "Mechanical Engineering"],
    province: "Mpumalanga, Limpopo, North West",
    deadline: "Usually March each year",
    description:
      "Full bursaries for students studying mining and metallurgy-related disciplines with vacation work opportunities.",
    applyUrl: "https://www.samancorcr.com/",
    tags: ["corporate", "mining"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "arcelormittal",
    name: "ArcelorMittal SA Bursary",
    provider: "ArcelorMittal South Africa",
    fields: ["Metallurgy", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering"],
    province: "Gauteng, Mpumalanga, KwaZulu-Natal",
    deadline: "Usually September each year",
    description:
      "Bursaries for students pursuing engineering and metallurgical qualifications relevant to the steel manufacturing industry.",
    applyUrl: "https://southafrica.arcelormittal.com/",
    tags: ["corporate", "manufacturing", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Energy / Utilities ──
  {
    id: "eskom-bursary",
    name: "Eskom Bursary",
    provider: "Eskom Holdings",
    fields: ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "IT", "Finance"],
    province: "All Provinces",
    deadline: "Usually August – October",
    description:
      "Full bursaries for students in engineering, IT, and finance disciplines with compulsory vacation work at Eskom facilities.",
    applyUrl: "https://www.eskom.co.za/careers/bursary/",
    tags: ["public entity", "energy", "engineering"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "transnet-bursary",
    name: "Transnet Bursary",
    provider: "Transnet SOC Ltd",
    fields: ["Engineering", "IT", "Logistics", "Supply Chain", "Finance"],
    province: "All Provinces",
    deadline: "Usually August – September",
    description:
      "Comprehensive bursary programme for students in engineering, IT, logistics, and finance with vacation work at Transnet.",
    applyUrl: "https://www.transnet.net/Careers/Pages/Bursaries.aspx",
    tags: ["public entity", "transport", "engineering"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  // ── Banking / Financial Services ──
  {
    id: "allan-gray",
    name: "Allan Gray Orbis Foundation Scholarship",
    provider: "Allan Gray Orbis Foundation",
    fields: ["Commerce", "Finance", "Entrepreneurship", "Accounting", "Business"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Prestigious scholarship for high-performing learners with entrepreneurial potential. Covers full cost of study at select South African universities plus entrepreneurship development.",
    applyUrl: "https://www.allangrayorbis.org/",
    tags: ["foundation", "finance", "entrepreneurship"],
    covers: "Tuition, Accommodation, Books, Living Allowance, Mentorship",
  },
  {
    id: "standard-bank",
    name: "Standard Bank Bursary",
    provider: "Standard Bank Group",
    fields: ["Finance", "Accounting", "IT", "Data Science", "Actuarial Science", "Engineering"],
    province: "All Provinces",
    deadline: "Usually March – April",
    description:
      "Bursaries for top-performing students in finance, IT, and STEM fields with vacation work experience at Standard Bank.",
    applyUrl: "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers",
    tags: ["corporate", "banking", "finance"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "absa-bursary",
    name: "Absa Bursary",
    provider: "Absa Group",
    fields: ["Finance", "Accounting", "IT", "Actuarial Science", "Data Science"],
    province: "All Provinces",
    deadline: "Usually March – April",
    description:
      "Bursaries for outstanding students studying towards qualifications in banking and financial services-related fields.",
    applyUrl: "https://www.absa.co.za/about-us/careers/students-and-graduates/",
    tags: ["corporate", "banking", "finance"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "fnb-fund",
    name: "FNB Fund Bursary",
    provider: "First National Bank",
    fields: ["IT", "Finance", "Accounting", "Data Analytics"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "FNB offers bursaries to academically excelling students in IT, finance, and analytics fields, with internship opportunities.",
    applyUrl: "https://www.fnb.co.za/about-fnb/careers/students-graduates.html",
    tags: ["corporate", "banking", "IT"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "nedbank-bursary",
    name: "Nedbank Bursary",
    provider: "Nedbank Group",
    fields: ["Finance", "Accounting", "IT", "Actuarial Science", "Mathematics"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Nedbank provides bursaries for academically strong students in finance, technology, and quantitative fields with vacation work.",
    applyUrl: "https://www.nedbank.co.za/content/nedbank/desktop/gt/en/careers.html",
    tags: ["corporate", "banking", "finance"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "capitec-bursary",
    name: "Capitec Bursary",
    provider: "Capitec Bank",
    fields: ["IT", "Finance", "Actuarial Science", "Data Science"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for innovative students in technology and finance-related fields with opportunities for graduate employment.",
    applyUrl: "https://www.capitecbank.co.za/about-us/careers/",
    tags: ["corporate", "banking", "IT"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "investec-bursary",
    name: "Investec Bursary",
    provider: "Investec",
    fields: ["Finance", "Accounting", "IT", "Actuarial Science", "Economics"],
    province: "Gauteng, Western Cape",
    deadline: "Usually March each year",
    description:
      "Bursaries for high-achieving students in finance and technology disciplines, with structured vacation work at Investec.",
    applyUrl: "https://www.investec.com/en_za/welcome-to-investec/careers/graduates.html",
    tags: ["corporate", "banking", "finance"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "old-mutual",
    name: "Old Mutual Bursary",
    provider: "Old Mutual",
    fields: ["Actuarial Science", "Finance", "Accounting", "IT", "Data Science", "Mathematics"],
    province: "All Provinces",
    deadline: "Usually March – April",
    description:
      "Comprehensive bursary programme for students pursuing qualifications in financial services, IT, and data fields.",
    applyUrl: "https://www.oldmutual.co.za/careers/",
    tags: ["corporate", "insurance", "finance"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "sanlam-bursary",
    name: "Sanlam Bursary",
    provider: "Sanlam",
    fields: ["Actuarial Science", "Finance", "Accounting", "IT", "Mathematics"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Sanlam offers bursaries for talented students in actuarial, financial, and technology-related studies.",
    applyUrl: "https://www.sanlam.co.za/careers/Pages/default.aspx",
    tags: ["corporate", "insurance", "finance"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "liberty-bursary",
    name: "Liberty Bursary",
    provider: "Liberty Group",
    fields: ["Actuarial Science", "Finance", "IT", "Mathematics"],
    province: "Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for students in actuarial, mathematical, and financial fields with work-integrated learning opportunities.",
    applyUrl: "https://www.liberty.co.za/careers",
    tags: ["corporate", "insurance", "finance"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "momentum-bursary",
    name: "Momentum Bursary",
    provider: "Momentum Metropolitan",
    fields: ["Actuarial Science", "Finance", "IT", "Accounting"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries aimed at students pursuing actuarial science, finance, and IT qualifications with mentorship support.",
    applyUrl: "https://www.momentum.co.za/momentum/careers",
    tags: ["corporate", "insurance", "finance"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "discovery-bursary",
    name: "Discovery Bursary",
    provider: "Discovery Limited",
    fields: ["Actuarial Science", "Data Science", "IT", "Finance", "Health Sciences"],
    province: "Gauteng",
    deadline: "Usually March each year",
    description:
      "Bursaries for top students in actuarial science, data, and health sciences with graduate programme pathway.",
    applyUrl: "https://www.discovery.co.za/corporate/careers-graduates",
    tags: ["corporate", "insurance", "health"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Accounting / Professional Services ──
  {
    id: "thuthuka-bursary",
    name: "Thuthuka Bursary Fund",
    provider: "SAICA (South African Institute of Chartered Accountants)",
    fields: ["Accounting", "Finance"],
    province: "All Provinces",
    deadline: "Usually September each year",
    description:
      "One of the top accounting bursaries in SA covering tuition, accommodation, and mentoring for students pursuing CA(SA) qualification.",
    applyUrl: "https://www.thuthukabursaryfund.co.za/",
    tags: ["professional body", "accounting"],
    covers: "Tuition, Accommodation, Books, Mentorship",
  },
  {
    id: "deloitte-bursary",
    name: "Deloitte Bursary",
    provider: "Deloitte South Africa",
    fields: ["Accounting", "Finance", "IT", "Audit"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students pursuing CTA/PGDA and CA(SA) qualifications with work experience at one of the Big Four firms.",
    applyUrl: "https://www2.deloitte.com/za/en/careers/students.html",
    tags: ["corporate", "big four", "accounting"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "pwc-bursary",
    name: "PwC Bursary",
    provider: "PricewaterhouseCoopers",
    fields: ["Accounting", "Finance", "IT", "Audit"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "PwC offers bursaries to academically strong accounting students with vacation work and articles placement.",
    applyUrl: "https://www.pwc.co.za/en/careers/student-careers.html",
    tags: ["corporate", "big four", "accounting"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "kpmg-bursary",
    name: "KPMG Bursary",
    provider: "KPMG South Africa",
    fields: ["Accounting", "Finance", "Audit"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "KPMG provides bursaries for aspiring chartered accountants with vacation work and graduate employment opportunities.",
    applyUrl: "https://home.kpmg/za/en/home/careers/students-and-graduates.html",
    tags: ["corporate", "big four", "accounting"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "ey-bursary",
    name: "EY Bursary",
    provider: "Ernst & Young South Africa",
    fields: ["Accounting", "Finance", "Audit", "IT"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "EY offers bursaries for top-performing accounting students with vacation work and a pathway to an articles traineeship.",
    applyUrl: "https://www.ey.com/en_za/careers/students",
    tags: ["corporate", "big four", "accounting"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Telecom / Tech ──
  {
    id: "vodacom-bursary",
    name: "Vodacom Bursary",
    provider: "Vodacom",
    fields: ["IT", "Engineering", "Data Science", "Computer Science"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Bursaries for students in technology and engineering fields with vacation work at Vodacom. Aimed at building digital talent.",
    applyUrl: "https://www.vodacom.co.za/vodacom/careers/",
    tags: ["corporate", "telecom", "IT"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "mtn-bursary",
    name: "MTN SA Foundation Bursary",
    provider: "MTN Foundation",
    fields: ["IT", "Engineering", "Computer Science", "Mathematics"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "MTN Foundation provides bursaries for deserving students in STEM fields with a focus on bridging the digital divide.",
    applyUrl: "https://www.mtn.co.za/Pages/MTN-SA-Foundation.aspx",
    tags: ["corporate", "telecom", "IT"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "telkom-bursary",
    name: "Telkom Bursary",
    provider: "Telkom SA SOC",
    fields: ["IT", "Engineering", "Computer Science", "Finance"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in IT, engineering, and commerce fields with vacation work placements at Telkom.",
    applyUrl: "https://www.telkom.co.za/about-us/careers/",
    tags: ["corporate", "telecom", "IT"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "multichoice-bursary",
    name: "MultiChoice Bursary",
    provider: "MultiChoice Group",
    fields: ["IT", "Engineering", "Media", "Data Science", "Finance"],
    province: "Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for students pursuing qualifications relevant to the media, entertainment, and technology industries.",
    applyUrl: "https://www.multichoice.com/careers/",
    tags: ["corporate", "media", "IT"],
    covers: "Tuition, Accommodation",
  },
  // ── Retail / FMCG ──
  {
    id: "shoprite-bursary",
    name: "Shoprite Bursary",
    provider: "Shoprite Holdings",
    fields: ["Retail Management", "IT", "Finance", "Supply Chain", "Food Technology"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in retail, supply chain, IT, and food technology fields with graduate programme opportunities.",
    applyUrl: "https://www.shopriteholdings.co.za/careers.html",
    tags: ["corporate", "retail"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "pick-n-pay",
    name: "Pick n Pay Bursary",
    provider: "Pick n Pay",
    fields: ["Retail Management", "IT", "Finance", "Supply Chain"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Pick n Pay provides bursaries and graduate programmes for students in retail-related fields.",
    applyUrl: "https://www.pnp.co.za/careers",
    tags: ["corporate", "retail"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "woolworths-bursary",
    name: "Woolworths SA Bursary",
    provider: "Woolworths Holdings",
    fields: ["Retail Management", "Fashion Design", "IT", "Finance", "Food Science"],
    province: "Western Cape, Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for students in fashion, food science, IT, and finance with internship opportunities at Woolworths.",
    applyUrl: "https://www.woolworths.co.za/corporate/careers",
    tags: ["corporate", "retail", "fashion"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "tiger-brands",
    name: "Tiger Brands Bursary",
    provider: "Tiger Brands Limited",
    fields: ["Food Science", "Engineering", "Supply Chain", "Finance"],
    province: "Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for students in food science, engineering, and supply chain fields relevant to FMCG manufacturing.",
    applyUrl: "https://www.tigerbrands.com/careers",
    tags: ["corporate", "FMCG", "manufacturing"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "sab-bursary",
    name: "SAB (AB InBev) Bursary",
    provider: "South African Breweries (AB InBev)",
    fields: ["Engineering", "Finance", "Supply Chain", "Marketing"],
    province: "All Provinces",
    deadline: "Usually March each year",
    description:
      "Bursaries for students in engineering, finance, supply chain, and marketing with vacation work at SAB facilities.",
    applyUrl: "https://www.ab-inbev.com/careers/students-and-graduates/",
    tags: ["corporate", "FMCG", "manufacturing"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Automotive ──
  {
    id: "toyota-sa",
    name: "Toyota SA Bursary",
    provider: "Toyota South Africa",
    fields: ["Mechanical Engineering", "Electrical Engineering", "Industrial Engineering", "IT"],
    province: "KwaZulu-Natal, Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for students in engineering and IT fields with vacation work at Toyota's manufacturing plants.",
    applyUrl: "https://www.toyota.co.za/careers",
    tags: ["corporate", "automotive", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "bmw-sa",
    name: "BMW SA Bursary",
    provider: "BMW Group South Africa",
    fields: ["Mechanical Engineering", "Electrical Engineering", "Mechatronics", "IT"],
    province: "Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for engineering and technology students with work-integrated learning at BMW's Rosslyn plant.",
    applyUrl: "https://www.bmw.co.za/en/topics/offers-and-services/careers.html",
    tags: ["corporate", "automotive", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  {
    id: "mercedes-sa",
    name: "Mercedes-Benz SA Bursary",
    provider: "Mercedes-Benz South Africa",
    fields: ["Mechanical Engineering", "Electrical Engineering", "Industrial Engineering"],
    province: "Eastern Cape, Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for engineering students with vacation work at the Mercedes-Benz East London manufacturing plant.",
    applyUrl: "https://www.mercedes-benz.co.za/passengercars/being-an-owner/careers.html",
    tags: ["corporate", "automotive", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Forestry / Paper ──
  {
    id: "sappi-bursary",
    name: "Sappi Bursary",
    provider: "Sappi Limited",
    fields: ["Chemical Engineering", "Mechanical Engineering", "Forestry", "Pulp & Paper Technology"],
    province: "KwaZulu-Natal, Mpumalanga, Gauteng",
    deadline: "Usually August – September",
    description:
      "Bursaries for students in engineering and forestry disciplines relevant to the pulp and paper manufacturing industry.",
    applyUrl: "https://www.sappi.com/careers",
    tags: ["corporate", "forestry", "engineering"],
    covers: "Tuition, Accommodation, Books, Stipend",
  },
  {
    id: "mondi-bursary",
    name: "Mondi Bursary",
    provider: "Mondi Group",
    fields: ["Chemical Engineering", "Mechanical Engineering", "Electrical Engineering", "Forestry"],
    province: "KwaZulu-Natal, Mpumalanga",
    deadline: "Varies annually",
    description:
      "Bursaries for students in engineering and forestry fields with vacation work at Mondi's operations.",
    applyUrl: "https://www.mondigroup.com/en/careers/",
    tags: ["corporate", "forestry", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Healthcare ──
  {
    id: "netcare-bursary",
    name: "Netcare Bursary",
    provider: "Netcare Limited",
    fields: ["Nursing", "Pharmacy", "Health Sciences"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in nursing and health science fields with practical placements at Netcare hospitals.",
    applyUrl: "https://www.netcare.co.za/Netcare-Nursing",
    tags: ["corporate", "healthcare"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "life-healthcare",
    name: "Life Healthcare Bursary",
    provider: "Life Healthcare Group",
    fields: ["Nursing", "Health Sciences", "Pharmacy"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for aspiring nurses and healthcare professionals with practical training at Life Healthcare facilities.",
    applyUrl: "https://www.lifehealthcare.co.za/careers/",
    tags: ["corporate", "healthcare"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "mediclinic-bursary",
    name: "Mediclinic Bursary",
    provider: "Mediclinic International",
    fields: ["Nursing", "Pharmacy", "Health Sciences"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for nursing and healthcare students with clinical training at Mediclinic hospitals across South Africa.",
    applyUrl: "https://www.mediclinic.co.za/en/corporate/careers.html",
    tags: ["corporate", "healthcare"],
    covers: "Tuition, Accommodation",
  },
  // ── Construction / Infrastructure ──
  {
    id: "murray-roberts",
    name: "Murray & Roberts Bursary",
    provider: "Murray & Roberts Holdings",
    fields: ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Quantity Surveying"],
    province: "Gauteng",
    deadline: "Varies annually",
    description:
      "Bursaries for engineering and built environment students with vacation work at Murray & Roberts projects.",
    applyUrl: "https://www.murrob.com/careers",
    tags: ["corporate", "construction", "engineering"],
    covers: "Tuition, Accommodation, Books",
  },
  // ── Services / Other ──
  {
    id: "clicks-bursary",
    name: "Clicks Group Bursary",
    provider: "Clicks Group",
    fields: ["Pharmacy", "Retail Management", "IT"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for pharmacy students with graduate pharmacist internships at Clicks stores nationwide.",
    applyUrl: "https://clicks.co.za/careers",
    tags: ["corporate", "pharmacy", "retail"],
    covers: "Tuition, Accommodation",
  },
  {
    id: "bidvest-bursary",
    name: "Bidvest Bursary",
    provider: "The Bidvest Group",
    fields: ["Finance", "Engineering", "IT", "Supply Chain"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in financial, engineering, and logistics disciplines aligned with Bidvest's diversified business.",
    applyUrl: "https://www.bidvest.co.za/careers.php",
    tags: ["corporate", "services"],
    covers: "Tuition, Accommodation",
  },
  // ── SETAs ──
  {
    id: "merseta",
    name: "merSETA Bursary",
    provider: "Manufacturing, Engineering and Related Services SETA",
    fields: ["Engineering", "Manufacturing", "Mechatronics"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in engineering and manufacturing disciplines to develop scarce skills in the sector.",
    applyUrl: "https://www.merseta.org.za/",
    tags: ["SETA", "engineering", "manufacturing"],
    covers: "Tuition, Stipend",
  },
  {
    id: "bankseta",
    name: "BankSETA Bursary",
    provider: "Banking Sector Education and Training Authority",
    fields: ["Finance", "Accounting", "IT", "Risk Management"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students pursuing qualifications in banking, finance, and IT to address scarce skills in the banking sector.",
    applyUrl: "https://www.bankseta.org.za/",
    tags: ["SETA", "banking", "finance"],
    covers: "Tuition, Stipend",
  },
  {
    id: "ewseta",
    name: "EWSETA Bursary",
    provider: "Energy and Water Sector Education and Training Authority",
    fields: ["Engineering", "Environmental Science", "Energy Studies"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in energy and water-related fields of study to build capacity in these critical sectors.",
    applyUrl: "https://www.ewseta.org.za/",
    tags: ["SETA", "energy", "engineering"],
    covers: "Tuition, Stipend",
  },
  {
    id: "chieta",
    name: "CHIETA Bursary",
    provider: "Chemical Industries Education and Training Authority",
    fields: ["Chemical Engineering", "Chemistry", "Biotechnology"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in chemical engineering and chemistry fields to develop skills for the chemical industry.",
    applyUrl: "https://www.chieta.org.za/",
    tags: ["SETA", "chemical", "engineering"],
    covers: "Tuition, Stipend",
  },
  {
    id: "mict-seta",
    name: "MICT SETA Bursary",
    provider: "Media, Information and Communication Technologies SETA",
    fields: ["IT", "Media", "Film", "Telecommunications"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in IT, media, film, and telecommunications fields to build capacity in the digital economy.",
    applyUrl: "https://www.mict.org.za/",
    tags: ["SETA", "IT", "media"],
    covers: "Tuition, Stipend",
  },
  {
    id: "hwseta",
    name: "HWSETA Bursary",
    provider: "Health and Welfare Sector Education and Training Authority",
    fields: ["Nursing", "Social Work", "Psychology", "Public Health"],
    province: "All Provinces",
    deadline: "Varies annually",
    description:
      "Bursaries for students in health and social development fields to address scarce skills in hospitals and social services.",
    applyUrl: "https://www.hwseta.org.za/",
    tags: ["SETA", "healthcare", "social work"],
    covers: "Tuition, Stipend",
  },
];

// All unique fields and provinces for filter dropdowns
const ALL_FIELDS = [...new Set(BURSARIES.flatMap((b) => b.fields))].sort();
const ALL_PROVINCES = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];
const ALL_CATEGORIES = ["All", "government", "corporate", "public entity", "foundation", "professional body", "SETA"];

const BOOKMARK_FOLDERS = ["General", "Top Choice", "Backup", "Applied"];

// ── Component ────────────────────────────────────────────────────────────────
export default function Bursary() {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkMeta, setBookmarkMeta] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isGuest = !user?.uid;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  // ── Firestore bookmark helpers ──
  const saveBursaryBookmark = useCallback(
    async (bursaryId, overrides = {}) => {
      if (!user?.uid) return;
      const b = BURSARIES.find((item) => item.id === bursaryId);
      if (!b) return;
      await setDoc(
        doc(db, "users", user.uid, "bursaryBookmarks", bursaryId),
        {
          name: b.name,
          folder: "General",
          notes: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...overrides,
        },
        { merge: true }
      );
    },
    [user?.uid]
  );

  const removeBursaryBookmark = async (bursaryId) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, "users", user.uid, "bursaryBookmarks", bursaryId));
  };

  const loadBursaryBookmarks = useCallback(async () => {
    if (!user?.uid) return { ids: [], metaById: {} };
    const snapshot = await getDocs(collection(db, "users", user.uid, "bursaryBookmarks"));
    const ids = snapshot.docs.map((d) => d.id);
    const metaById = {};
    snapshot.docs.forEach((d) => {
      metaById[d.id] = d.data() || {};
    });
    return { ids, metaById };
  }, [user?.uid]);

  // ── Sync bookmarks with Firestore ──
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if (!user?.uid) return;
      try {
        const cloud = await loadBursaryBookmarks();
        if (!cancelled) {
          setBookmarks(cloud.ids);
          setBookmarkMeta(cloud.metaById);
        }
      } catch (err) {
        console.error("Failed to sync bursary bookmarks", err);
      }
    };
    sync();
    return () => { cancelled = true; };
  }, [loadBursaryBookmarks, user?.uid]);

  useEffect(() => {
    if (!isGuest) return;
    setBookmarks([]);
    setBookmarkMeta({});
    if (activeTab === "saved") setActiveTab("all");
  }, [activeTab, isGuest]);

  const toggleBookmark = (id) => {
    if (isGuest) { navigate("/auth"); return; }
    setBookmarks((prev) => {
      const removing = prev.includes(id);
      const next = removing ? prev.filter((b) => b !== id) : [...prev, id];
      const persist = removing ? removeBursaryBookmark(id) : saveBursaryBookmark(id);
      persist.catch((e) => console.error("Bookmark sync error", e));
      setBookmarkMeta((m) => {
        const nm = { ...m };
        if (removing) delete nm[id];
        else if (!nm[id]) nm[id] = { folder: "General", notes: "" };
        return nm;
      });
      return next;
    });
  };

  const updateBookmarkMeta = (id, partial) => {
    if (isGuest) { navigate("/auth"); return; }
    setBookmarkMeta((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...partial } }));
    if (user?.uid) {
      setDoc(
        doc(db, "users", user.uid, "bursaryBookmarks", id),
        { ...partial, updatedAt: serverTimestamp() },
        { merge: true }
      ).catch((e) => console.error("Meta update error", e));
    }
  };

  // ── Filtering ──
  const filtered = useMemo(() => {
    let list = BURSARIES;
    if (activeTab === "saved") list = list.filter((b) => bookmarks.includes(b.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.provider.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.fields.some((f) => f.toLowerCase().includes(q)) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (fieldFilter !== "all") {
      list = list.filter((b) => b.fields.some((f) => f === fieldFilter));
    }
    if (provinceFilter !== "all") {
      list = list.filter(
        (b) => b.province === "All Provinces" || b.province.includes(provinceFilter)
      );
    }
    if (categoryFilter !== "All") {
      list = list.filter((b) => b.tags.includes(categoryFilter));
    }
    return list;
  }, [search, fieldFilter, provinceFilter, categoryFilter, activeTab, bookmarks]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar-responsive">
        <div className="navbar-container">
          <a
            className="logo"
            href="#"
            style={{
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#2c3e50",
              textDecoration: "none",
            }}
          >
            Grad<span style={{ color: "#3498db" }}>iate</span>
          </a>
          <div className="nav-actions">
            <button
              className="burger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
            </button>
          </div>
          {menuOpen && (
            <div className="burger-menu">
              {isGuest ? (
                <a onClick={() => navigate("/auth")}>Sign In / Create Account</a>
              ) : (
                <a onClick={() => navigate("/Profile")}>
                  {user?.displayName || user?.email || "Guest"}
                </a>
              )}
              <a onClick={() => navigate("/Aplication")}>Application</a>
              <a onClick={() => navigate("/Practise")}>Practise</a>
              <a className="active">Bursaries</a>
              {!isGuest && (
                <a
                  onClick={async () => {
                    setMenuOpen(false);
                    await handleLogout();
                  }}
                >
                  Logout
                </a>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-page">
        {/* Welcome */}
        <header className="dashboard-welcome">
          <h1 className="dashboard-welcome__greeting">
            <FaGraduationCap /> Bursary <span>Finder</span>
          </h1>
          <p className="dashboard-welcome__sub">
            Discover and save bursary opportunities from across South Africa.
          </p>
        </header>

        {/* Search */}
        <div className="dashboard-search">
          <div className="dashboard-search__wrapper">
            <FaSearch className="dashboard-search__icon" />
            <input
              className="dashboard-search__input"
              type="text"
              placeholder="Search bursaries by name, provider, field..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Nav Shortcuts */}
        <div className="dashboard-shortcuts">
          <button
            className="dashboard-shortcut"
            onClick={() => navigate(isGuest ? "/auth" : "/Profile")}
          >
            <FaUserCircle /> {isGuest ? "Sign In / Create Account" : "My Profile"}
          </button>
          <button
            className="dashboard-shortcut"
            onClick={() => navigate("/Aplication")}
          >
            <FaPencilAlt /> Application
          </button>
          <button
            className="dashboard-shortcut"
            onClick={() => navigate("/Practise")}
          >
            <FaPencilAlt /> Past Papers
          </button>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--blue">
              {BURSARIES.length}
            </p>
            <p className="dashboard-stat__label">Bursaries</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">
              {ALL_FIELDS.length}
            </p>
            <p className="dashboard-stat__label">Fields of Study</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--purple">
              {bookmarks.length}
            </p>
            <p className="dashboard-stat__label">Saved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "all" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Bursaries
          </button>
          {!isGuest && (
            <button
              className={`dashboard-tab ${activeTab === "saved" ? "dashboard-tab--active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Saved ({bookmarks.length})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="dashboard-tabs" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
          <span className="dashboard-stat__label" style={{ margin: 0 }}>
            <FaFilter /> Filters
          </span>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }}
          >
            <option value="all">All Fields of Study</option>
            {ALL_FIELDS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }}
          >
            <option value="all">All Provinces</option>
            {ALL_PROVINCES.filter((p) => p !== "All Provinces").map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Bursary Cards */}
        {filtered.length > 0 ? (
          <div className="bursaries-grid" style={{ marginTop: "1.5rem" }}>
            {filtered.map((b) => {
              const saved = bookmarks.includes(b.id);
              const folderValue = bookmarkMeta[b.id]?.folder || "General";
              const noteValue = bookmarkMeta[b.id]?.notes || "";

              return (
                <article className={`bursary-card ${saved ? "matched" : ""}`} key={b.id}>
                  <div className="card-header">
                    <h3>{b.name}</h3>
                    <p className="institution">{b.provider}</p>
                    {saved && <span className="match-badge">Saved</span>}
                  </div>
                  <div className="card-body">
                    <div className="bursary-detail">
                      <FaUniversity /> {b.provider}
                    </div>
                    <div className="bursary-detail">
                      <FaMapMarkerAlt /> {b.province}
                    </div>
                    <div className="bursary-detail">
                      <FaCalendarAlt /> {b.deadline}
                    </div>
                    <div className="bursary-detail">
                      <FaMoneyBillWave /> {b.covers}
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#475569", marginTop: 8 }}>
                      {b.description}
                    </p>
                    <div className="bursary-tags">
                      {b.fields.map((f) => (
                        <span className="tag" key={f}>{f}</span>
                      ))}
                      {b.tags.map((t) => (
                        <span className="tag" key={t} style={{ background: "#e0f2fe", color: "#0369a1" }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Saved meta (folder + notes) when viewing saved tab */}
                    {!isGuest && saved && activeTab === "saved" && (
                      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                        <label style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                          Folder
                        </label>
                        <select
                          value={folderValue}
                          onChange={(e) => updateBookmarkMeta(b.id, { folder: e.target.value })}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 8 }}
                        >
                          {BOOKMARK_FOLDERS.map((folder) => (
                            <option key={`${b.id}-${folder}`} value={folder}>{folder}</option>
                          ))}
                        </select>
                        <label style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                          Notes
                        </label>
                        <textarea
                          value={noteValue}
                          placeholder="Write private notes for this bursary..."
                          onChange={(e) => updateBookmarkMeta(b.id, { notes: e.target.value })}
                          rows={2}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 8, resize: "vertical" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <button
                      className="save-btn"
                      onClick={() => toggleBookmark(b.id)}
                      title={isGuest ? "Sign in to save" : saved ? "Remove from saved" : "Save bursary"}
                    >
                      {!isGuest && saved ? <FaBookmark /> : <FaRegBookmark />}{" "}
                      {saved ? "Saved" : "Save"}
                    </button>
                    <a
                      className="btn-primary"
                      href={b.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0.5rem 1rem",
                        background: "#3498db",
                        color: "#fff",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      Apply <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty__icon" aria-hidden="true"><FaSearch /></div>
            <p className="dashboard-empty__text">
              {activeTab === "saved"
                ? "You haven't saved any bursaries yet. Tap the save button on a bursary to bookmark it."
                : "No bursaries match your current filters."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a className="logo">
                Grad<span>iate</span>
              </a>
              <p>Smart education matching for everyone.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#">How It Works</a>
                <a href="#">Features</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="#" title="Facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" title="LinkedIn" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
            <p className="copyright">
              &copy; 2026 THANDULULO TECHNOLOGIES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
