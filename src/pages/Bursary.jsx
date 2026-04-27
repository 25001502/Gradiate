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
  FaClock,
  FaBalanceScale,
  FaMapMarkerAlt,
  FaUniversity,
  FaFilter,
} from "react-icons/fa";

const makeBursary = (
  id,
  name,
  provider,
  fields,
  province,
  deadline,
  applyUrl,
  tags,
  covers,
  description
) => ({
  id,
  name,
  provider,
  fields,
  province,
  deadline,
  applyUrl,
  tags,
  covers,
  description,
});

const BURSARIES = [
  makeBursary("nsfas", "NSFAS Bursary", "National Student Financial Aid Scheme", ["All Fields"], "All Provinces", "Usually November each year", "https://www.nsfas.org.za/content/how-to-apply.html", ["government", "undergraduate"], "Tuition, Accommodation, Books, Living Allowance", "Government-funded aid for qualifying students at public universities and TVET colleges."),
  makeBursary("funza-lushaka", "Funza Lushaka Bursary", "Department of Basic Education", ["Education", "Teaching"], "All Provinces", "Usually January each year", "https://www.funzalushaka.doe.gov.za/", ["government", "teaching"], "Tuition, Accommodation, Books, Stipend", "Teaching bursary with work-back service at public schools after graduation."),
  makeBursary("dhet", "DHET Bursary", "Department of Higher Education and Training", ["All Fields"], "All Provinces", "Varies annually", "https://www.dhet.gov.za/", ["government"], "Tuition, Accommodation", "DHET-backed support focused on scarce skills and access to higher education."),
  makeBursary("dalrrd", "Department of Agriculture Bursary", "DALRRD", ["Agriculture", "Veterinary Science", "Environmental Science"], "All Provinces", "Usually September each year", "https://www.dalrrd.gov.za/", ["government", "agriculture"], "Tuition, Accommodation, Books", "Supports agriculture and rural-development qualifications."),
  makeBursary("dws", "Department of Water and Sanitation Bursary", "Department of Water and Sanitation", ["Engineering", "Hydrology", "Chemistry"], "All Provinces", "Usually September each year", "https://www.dws.gov.za/", ["government", "engineering"], "Tuition, Accommodation, Books, Stipend", "Bursary for water-sector critical skills."),
  makeBursary("saps", "SAPS Bursary", "South African Police Service", ["Law", "Forensic Science", "IT", "Policing"], "All Provinces", "Varies annually", "https://www.saps.gov.za/careers/bursaries.php", ["government"], "Tuition, Accommodation", "Supports studies aligned to law-enforcement careers."),
  makeBursary("dot", "Department of Transport Bursary", "Department of Transport", ["Engineering", "Logistics", "Transport Management"], "All Provinces", "Usually August-September", "https://www.transport.gov.za/", ["government", "transport"], "Tuition, Accommodation, Books", "Transport and logistics pipeline bursary programme."),
  makeBursary("dmre", "DMRE Bursary", "Department of Mineral Resources and Energy", ["Mining Engineering", "Geology", "Energy Studies"], "All Provinces", "Varies annually", "https://www.dmre.gov.za/", ["government", "mining", "energy"], "Tuition, Accommodation, Books, Stipend", "Builds mining and energy-sector professional capacity."),
  makeBursary("gcis", "GCIS Bursary", "Government Communication and Information System", ["Communication", "Journalism", "Media Studies", "IT"], "All Provinces", "Varies annually", "https://www.gcis.gov.za/", ["government", "media"], "Tuition, Accommodation", "For communication and media-focused public-sector careers."),
  makeBursary("dpwi", "Department of Public Works Bursary", "Department of Public Works and Infrastructure", ["Civil Engineering", "Architecture", "Quantity Surveying"], "All Provinces", "Varies annually", "https://www.publicworks.gov.za/", ["government", "construction"], "Tuition, Accommodation, Books", "Built-environment bursaries for infrastructure skills."),

  makeBursary("rand-water", "Rand Water Bursary", "Rand Water", ["Engineering", "Chemistry", "Environmental Science"], "Gauteng", "Usually September each year", "https://www.randwater.co.za/", ["public entity", "engineering"], "Tuition, Accommodation, Books, Stipend", "Supports water utility and treatment related disciplines."),
  makeBursary("umgeni-water", "Umgeni Water Bursary", "Umgeni Water", ["Engineering", "Chemistry", "Environmental Science"], "KwaZulu-Natal", "Usually September each year", "https://www.umgeni.co.za/", ["public entity", "engineering"], "Tuition, Accommodation, Books", "Water-sector bursary with vacation work opportunities."),
  makeBursary("idc", "IDC Bursary", "Industrial Development Corporation", ["Engineering", "Finance", "Economics", "IT"], "All Provinces", "Varies annually", "https://www.idc.co.za/", ["public entity", "finance"], "Tuition, Accommodation, Books", "Supports scarce skills tied to industrial growth and development finance."),
  makeBursary("dbsa", "DBSA Bursary", "Development Bank of Southern Africa", ["Engineering", "Economics", "Finance", "Environmental Science"], "All Provinces", "Varies annually", "https://www.dbsa.org/", ["public entity", "finance"], "Tuition, Accommodation", "Development-finance aligned bursary opportunities."),
  makeBursary("eskom", "Eskom Bursary", "Eskom", ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "IT", "Finance"], "All Provinces", "Usually August-October", "https://www.eskom.co.za/careers/bursary/", ["public entity", "energy", "engineering"], "Tuition, Accommodation, Books, Stipend", "Large utility bursary with vacation work and graduate pipeline."),
  makeBursary("transnet", "Transnet Bursary", "Transnet SOC Ltd", ["Engineering", "IT", "Logistics", "Supply Chain", "Finance"], "All Provinces", "Usually August-September", "https://www.transnet.net/Careers/Pages/Bursaries.aspx", ["public entity", "transport", "engineering"], "Tuition, Accommodation, Books, Stipend", "Transport and logistics sector bursary with practical exposure."),

  makeBursary("sasol", "Sasol Bursary", "Sasol", ["Chemical Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemistry", "IT"], "All Provinces", "Usually March-June each year", "https://www.sasol.com/careers/students-and-graduates", ["corporate", "energy", "engineering"], "Tuition, Accommodation, Books, Meals, Allowance", "One of SA's top STEM bursary programmes."),
  makeBursary("anglo-american", "Anglo American Bursary", "Anglo American", ["Mining Engineering", "Geology", "Metallurgy", "Mechanical Engineering"], "All Provinces", "Usually March-April", "https://www.angloamerican.com/careers/students-and-graduates", ["corporate", "mining"], "Tuition, Accommodation, Books, Stipend", "Mining industry bursary with vacation work."),
  makeBursary("de-beers", "De Beers Bursary", "De Beers Group", ["Mining Engineering", "Geology", "Mechanical Engineering"], "All Provinces", "Usually March each year", "https://www.debeersgroup.com/careers", ["corporate", "mining"], "Tuition, Accommodation, Books", "Supports mining and technical disciplines."),
  makeBursary("harmony", "Harmony Gold Bursary", "Harmony Gold", ["Mining Engineering", "Geology", "Metallurgy"], "Free State, Gauteng", "Usually March-April", "https://www.harmony.co.za/careers/bursary-programme", ["corporate", "mining"], "Tuition, Accommodation, Books", "Mining bursary with operational exposure."),
  makeBursary("sibanye", "Sibanye-Stillwater Bursary", "Sibanye-Stillwater", ["Mining Engineering", "Chemical Engineering", "Geology"], "All Provinces", "Usually March each year", "https://www.sibanyestillwater.com/careers/", ["corporate", "mining"], "Tuition, Accommodation, Books, Stipend", "Critical-skills bursary in precious-metals mining."),
  makeBursary("anglogold", "AngloGold Ashanti Bursary", "AngloGold Ashanti", ["Mining Engineering", "Geology", "Metallurgy"], "All Provinces", "Usually March-April", "https://www.anglogoldashanti.com/careers/", ["corporate", "mining"], "Tuition, Accommodation, Books", "Mining-focused professional bursary route."),
  makeBursary("implats", "Implats Bursary", "Impala Platinum", ["Mining Engineering", "Chemical Engineering", "Geology"], "Limpopo, North West, Gauteng", "Usually March each year", "https://www.implats.co.za/bursaries.php", ["corporate", "mining"], "Tuition, Accommodation, Books, Stipend", "Platinum sector bursary with vacation work."),
  makeBursary("kumba", "Kumba Iron Ore Bursary", "Kumba Iron Ore", ["Mining Engineering", "Mechanical Engineering", "Electrical Engineering", "Geology"], "Northern Cape, Gauteng", "Usually March-April", "https://www.angloamericankumba.com/careers", ["corporate", "mining"], "Tuition, Accommodation, Books", "Iron ore operations-linked bursary stream."),
  makeBursary("samancor", "Samancor Chrome Bursary", "Samancor Chrome", ["Mining Engineering", "Metallurgy", "Chemical Engineering"], "Mpumalanga, Limpopo, North West", "Usually March each year", "https://www.samancorcr.com/", ["corporate", "mining"], "Tuition, Accommodation, Books", "Chrome and metallurgy-focused bursary."),
  makeBursary("arcelor", "ArcelorMittal SA Bursary", "ArcelorMittal South Africa", ["Metallurgy", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering"], "Gauteng, Mpumalanga, KwaZulu-Natal", "Usually September each year", "https://southafrica.arcelormittal.com/", ["corporate", "engineering", "manufacturing"], "Tuition, Accommodation, Books", "Steel industry bursary for engineering and metallurgy."),

  makeBursary("allan-gray", "Allan Gray Orbis Foundation Scholarship", "Allan Gray Orbis Foundation", ["Commerce", "Finance", "Accounting", "Entrepreneurship"], "All Provinces", "Usually March each year", "https://www.allangrayorbis.org/", ["foundation", "finance"], "Tuition, Accommodation, Books, Living Allowance", "Prestigious scholarship with entrepreneurship development."),
  makeBursary("standard-bank", "Standard Bank Bursary", "Standard Bank", ["Finance", "Accounting", "IT", "Data Science", "Actuarial Science"], "All Provinces", "Usually March-April", "https://www.standardbank.com/sbg/standard-bank-group/careers/early-careers", ["corporate", "banking", "finance"], "Tuition, Accommodation, Books", "Banking bursary for high-performing students."),
  makeBursary("absa", "Absa Bursary", "Absa Group", ["Finance", "Accounting", "IT", "Actuarial Science", "Data Science"], "All Provinces", "Usually March-April", "https://www.absa.co.za/about-us/careers/students-and-graduates/", ["corporate", "banking", "finance"], "Tuition, Accommodation, Books", "Financial services bursary across quantitative fields."),
  makeBursary("fnb", "FNB Fund Bursary", "First National Bank", ["IT", "Finance", "Accounting", "Data Analytics"], "All Provinces", "Usually March each year", "https://www.fnb.co.za/about-fnb/careers/students-graduates.html", ["corporate", "banking", "IT"], "Tuition, Accommodation", "Supports digital and finance talent in banking."),
  makeBursary("nedbank", "Nedbank Bursary", "Nedbank", ["Finance", "Accounting", "IT", "Actuarial Science", "Mathematics"], "All Provinces", "Usually March each year", "https://www.nedbank.co.za/content/nedbank/desktop/gt/en/careers.html", ["corporate", "banking", "finance"], "Tuition, Accommodation, Books", "Bursary route into banking and analytics careers."),
  makeBursary("capitec", "Capitec Bursary", "Capitec Bank", ["IT", "Finance", "Actuarial Science", "Data Science"], "All Provinces", "Varies annually", "https://www.capitecbank.co.za/about-us/careers/", ["corporate", "banking", "IT"], "Tuition, Accommodation", "Technology and finance bursary opportunities."),
  makeBursary("investec", "Investec Bursary", "Investec", ["Finance", "Accounting", "IT", "Actuarial Science", "Economics"], "Gauteng, Western Cape", "Usually March each year", "https://www.investec.com/en_za/welcome-to-investec/careers/graduates.html", ["corporate", "banking", "finance"], "Tuition, Accommodation, Books", "Structured bursary with vacation work pathway."),
  makeBursary("old-mutual", "Old Mutual Bursary", "Old Mutual", ["Actuarial Science", "Finance", "Accounting", "IT", "Data Science"], "All Provinces", "Usually March-April", "https://www.oldmutual.co.za/careers/", ["corporate", "insurance", "finance"], "Tuition, Accommodation, Books, Stipend", "Comprehensive insurance and financial services bursary."),
  makeBursary("sanlam", "Sanlam Bursary", "Sanlam", ["Actuarial Science", "Finance", "Accounting", "IT", "Mathematics"], "All Provinces", "Varies annually", "https://www.sanlam.co.za/careers/Pages/default.aspx", ["corporate", "insurance", "finance"], "Tuition, Accommodation, Books", "Supports actuarial and finance students."),
  makeBursary("liberty", "Liberty Bursary", "Liberty Group", ["Actuarial Science", "Finance", "IT", "Mathematics"], "Gauteng", "Varies annually", "https://www.liberty.co.za/careers", ["corporate", "insurance", "finance"], "Tuition, Accommodation", "Insurance-sector bursary for quantitative fields."),
  makeBursary("momentum", "Momentum Bursary", "Momentum Metropolitan", ["Actuarial Science", "Finance", "IT", "Accounting"], "All Provinces", "Varies annually", "https://www.momentum.co.za/momentum/careers", ["corporate", "insurance", "finance"], "Tuition, Accommodation", "Bursary with mentoring in financial services."),
  makeBursary("discovery", "Discovery Bursary", "Discovery", ["Actuarial Science", "Data Science", "IT", "Finance", "Health Sciences"], "Gauteng", "Usually March each year", "https://www.discovery.co.za/corporate/careers-graduates", ["corporate", "insurance", "health"], "Tuition, Accommodation, Books", "Strong graduate pipeline into analytics and health innovation."),

  makeBursary("thuthuka", "Thuthuka Bursary Fund", "SAICA", ["Accounting", "Finance"], "All Provinces", "Usually September each year", "https://www.thuthukabursaryfund.co.za/", ["professional body", "accounting"], "Tuition, Accommodation, Books, Mentorship", "Top accounting bursary for CA(SA) pathway students."),
  makeBursary("deloitte", "Deloitte Bursary", "Deloitte South Africa", ["Accounting", "Finance", "Audit", "IT"], "All Provinces", "Varies annually", "https://www2.deloitte.com/za/en/careers/students.html", ["corporate", "accounting", "big four"], "Tuition, Accommodation, Books", "Big Four bursary and training pipeline."),
  makeBursary("pwc", "PwC Bursary", "PricewaterhouseCoopers", ["Accounting", "Finance", "Audit", "IT"], "All Provinces", "Varies annually", "https://www.pwc.co.za/en/careers/student-careers.html", ["corporate", "accounting", "big four"], "Tuition, Accommodation, Books", "Bursary route to articles and audit careers."),
  makeBursary("kpmg", "KPMG Bursary", "KPMG South Africa", ["Accounting", "Finance", "Audit"], "All Provinces", "Varies annually", "https://home.kpmg/za/en/home/careers/students-and-graduates.html", ["corporate", "accounting", "big four"], "Tuition, Accommodation, Books", "Accounting bursary with graduate opportunities."),
  makeBursary("ey", "EY Bursary", "Ernst & Young South Africa", ["Accounting", "Finance", "Audit", "IT"], "All Provinces", "Varies annually", "https://www.ey.com/en_za/careers/students", ["corporate", "accounting", "big four"], "Tuition, Accommodation, Books", "Supports top accounting students with practical exposure."),

  makeBursary("vodacom", "Vodacom Bursary", "Vodacom", ["IT", "Engineering", "Data Science", "Computer Science"], "All Provinces", "Usually March each year", "https://www.vodacom.co.za/vodacom/careers/", ["corporate", "telecom", "IT"], "Tuition, Accommodation, Books", "Digital talent bursary with telecom practical experience."),
  makeBursary("mtn", "MTN SA Foundation Bursary", "MTN Foundation", ["IT", "Engineering", "Computer Science", "Mathematics"], "All Provinces", "Usually March each year", "https://www.mtn.co.za/Pages/MTN-SA-Foundation.aspx", ["corporate", "telecom", "IT"], "Tuition, Accommodation, Books", "STEM-focused bursary for youth development."),
  makeBursary("telkom", "Telkom Bursary", "Telkom", ["IT", "Engineering", "Computer Science", "Finance"], "All Provinces", "Varies annually", "https://www.telkom.co.za/about-us/careers/", ["corporate", "telecom", "IT"], "Tuition, Accommodation, Books", "Technology and engineering bursary stream."),
  makeBursary("multichoice", "MultiChoice Bursary", "MultiChoice Group", ["IT", "Engineering", "Media", "Data Science", "Finance"], "Gauteng", "Varies annually", "https://www.multichoice.com/careers/", ["corporate", "media", "IT"], "Tuition, Accommodation", "Media-tech bursary opportunities."),

  makeBursary("shoprite", "Shoprite Bursary", "Shoprite Holdings", ["Retail Management", "IT", "Finance", "Supply Chain", "Food Technology"], "All Provinces", "Varies annually", "https://www.shopriteholdings.co.za/careers.html", ["corporate", "retail"], "Tuition, Accommodation", "Retail and supply-chain bursary programme."),
  makeBursary("picknpay", "Pick n Pay Bursary", "Pick n Pay", ["Retail Management", "IT", "Finance", "Supply Chain"], "All Provinces", "Varies annually", "https://www.pnp.co.za/careers", ["corporate", "retail"], "Tuition, Accommodation", "Retail talent development bursary."),
  makeBursary("woolworths", "Woolworths SA Bursary", "Woolworths", ["Retail Management", "Fashion Design", "IT", "Finance", "Food Science"], "Western Cape, Gauteng", "Varies annually", "https://www.woolworths.co.za/corporate/careers", ["corporate", "retail", "fashion"], "Tuition, Accommodation", "Bursary options in food, fashion, retail and tech."),
  makeBursary("tiger", "Tiger Brands Bursary", "Tiger Brands", ["Food Science", "Engineering", "Supply Chain", "Finance"], "Gauteng", "Varies annually", "https://www.tigerbrands.com/careers", ["corporate", "manufacturing"], "Tuition, Accommodation, Books", "FMCG-focused bursary in technical and business fields."),
  makeBursary("sab", "SAB (AB InBev) Bursary", "South African Breweries", ["Engineering", "Finance", "Supply Chain", "Marketing"], "All Provinces", "Usually March each year", "https://www.ab-inbev.com/careers/students-and-graduates/", ["corporate", "manufacturing"], "Tuition, Accommodation, Books", "Manufacturing and supply-chain bursary programme."),

  makeBursary("toyota", "Toyota SA Bursary", "Toyota South Africa", ["Mechanical Engineering", "Electrical Engineering", "Industrial Engineering", "IT"], "KwaZulu-Natal, Gauteng", "Varies annually", "https://www.toyota.co.za/careers", ["corporate", "automotive", "engineering"], "Tuition, Accommodation, Books", "Automotive engineering bursary with plant exposure."),
  makeBursary("bmw", "BMW SA Bursary", "BMW Group South Africa", ["Mechanical Engineering", "Electrical Engineering", "Mechatronics", "IT"], "Gauteng", "Varies annually", "https://www.bmw.co.za/en/topics/offers-and-services/careers.html", ["corporate", "automotive", "engineering"], "Tuition, Accommodation, Books", "Engineering bursary linked to automotive operations."),
  makeBursary("mercedes", "Mercedes-Benz SA Bursary", "Mercedes-Benz South Africa", ["Mechanical Engineering", "Electrical Engineering", "Industrial Engineering"], "Eastern Cape, Gauteng", "Varies annually", "https://www.mercedes-benz.co.za/passengercars/being-an-owner/careers.html", ["corporate", "automotive", "engineering"], "Tuition, Accommodation, Books", "Automotive technical bursary with practical training pathways."),

  makeBursary("sappi", "Sappi Bursary", "Sappi", ["Chemical Engineering", "Mechanical Engineering", "Forestry", "Pulp and Paper Technology"], "KwaZulu-Natal, Mpumalanga, Gauteng", "Usually August-September", "https://www.sappi.com/careers", ["corporate", "forestry", "engineering"], "Tuition, Accommodation, Books, Stipend", "Forestry and process-engineering bursary programme."),
  makeBursary("mondi", "Mondi Bursary", "Mondi Group", ["Chemical Engineering", "Mechanical Engineering", "Electrical Engineering", "Forestry"], "KwaZulu-Natal, Mpumalanga", "Varies annually", "https://www.mondigroup.com/en/careers/", ["corporate", "forestry", "engineering"], "Tuition, Accommodation, Books", "Industrial and forestry skills bursary."),

  makeBursary("netcare", "Netcare Bursary", "Netcare", ["Nursing", "Pharmacy", "Health Sciences"], "All Provinces", "Varies annually", "https://www.netcare.co.za/Netcare-Nursing", ["corporate", "healthcare"], "Tuition, Accommodation", "Healthcare bursary route for nursing and allied fields."),
  makeBursary("life-healthcare", "Life Healthcare Bursary", "Life Healthcare", ["Nursing", "Health Sciences", "Pharmacy"], "All Provinces", "Varies annually", "https://www.lifehealthcare.co.za/careers/", ["corporate", "healthcare"], "Tuition, Accommodation", "Clinical training linked healthcare bursary opportunities."),
  makeBursary("mediclinic", "Mediclinic Bursary", "Mediclinic", ["Nursing", "Pharmacy", "Health Sciences"], "All Provinces", "Varies annually", "https://www.mediclinic.co.za/en/corporate/careers.html", ["corporate", "healthcare"], "Tuition, Accommodation", "Private-hospital network bursary programme."),

  makeBursary("murray-roberts", "Murray and Roberts Bursary", "Murray and Roberts", ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Quantity Surveying"], "Gauteng", "Varies annually", "https://www.murrob.com/careers", ["corporate", "construction", "engineering"], "Tuition, Accommodation, Books", "Infrastructure and construction bursary pathway."),
  makeBursary("clicks", "Clicks Group Bursary", "Clicks Group", ["Pharmacy", "Retail Management", "IT"], "All Provinces", "Varies annually", "https://clicks.co.za/careers", ["corporate", "pharmacy", "retail"], "Tuition, Accommodation", "Pharmacy and retail-focused bursary options."),
  makeBursary("bidvest", "Bidvest Bursary", "Bidvest", ["Finance", "Engineering", "IT", "Supply Chain"], "All Provinces", "Varies annually", "https://www.bidvest.co.za/careers.php", ["corporate", "services"], "Tuition, Accommodation", "Diversified-group bursary programme across critical fields."),

  makeBursary("merseta", "merSETA Bursary", "Manufacturing, Engineering and Related Services SETA", ["Engineering", "Manufacturing", "Mechatronics"], "All Provinces", "Varies annually", "https://www.merseta.org.za/", ["SETA", "engineering"], "Tuition, Stipend", "SETA bursary for manufacturing and engineering skills."),
  makeBursary("bankseta", "BankSETA Bursary", "Banking Sector Education and Training Authority", ["Finance", "Accounting", "IT", "Risk Management"], "All Provinces", "Varies annually", "https://www.bankseta.org.za/", ["SETA", "banking", "finance"], "Tuition, Stipend", "Banking sector scarce-skills bursary support."),
  makeBursary("ewseta", "EWSETA Bursary", "Energy and Water SETA", ["Engineering", "Environmental Science", "Energy Studies"], "All Provinces", "Varies annually", "https://www.ewseta.org.za/", ["SETA", "energy", "engineering"], "Tuition, Stipend", "SETA bursary for energy and water economy skills."),
  makeBursary("chieta", "CHIETA Bursary", "Chemical Industries SETA", ["Chemical Engineering", "Chemistry", "Biotechnology"], "All Provinces", "Varies annually", "https://www.chieta.org.za/", ["SETA", "chemical", "engineering"], "Tuition, Stipend", "Chemical-sector bursary for technical pipeline development."),
  makeBursary("mict", "MICT SETA Bursary", "Media, Information and Communication Technologies SETA", ["IT", "Media", "Film", "Telecommunications"], "All Provinces", "Varies annually", "https://www.mict.org.za/", ["SETA", "IT", "media"], "Tuition, Stipend", "Digital economy and media skills bursary."),
  makeBursary("hwseta", "HWSETA Bursary", "Health and Welfare SETA", ["Nursing", "Social Work", "Psychology", "Public Health"], "All Provinces", "Varies annually", "https://www.hwseta.org.za/", ["SETA", "healthcare", "social work"], "Tuition, Stipend", "Health and social development bursary options."),
];

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
const ALL_CATEGORIES = [
  "All",
  "government",
  "corporate",
  "public entity",
  "foundation",
  "professional body",
  "SETA",
];

const BOOKMARK_FOLDERS = ["General", "Top Choice", "Backup", "Applied"];

const LOGO_COLORS = ["#e2e8f0", "#dbeafe", "#d1fae5", "#fee2e2", "#fef3c7", "#ede9fe"];

const hashString = (input) =>
  input.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const getProviderInitials = (provider) => {
  const words = provider
    .replace(/[^A-Za-z\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);
  if (!words.length) return "BU";
  return words.map((word) => word[0]).join("").toUpperCase();
};

const createLogoDataUri = (provider, id) => {
  const initials = getProviderInitials(provider);
  const color = LOGO_COLORS[hashString(id) % LOGO_COLORS.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='110' viewBox='0 0 160 110'><rect width='160' height='110' rx='16' fill='${color}'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='34' font-weight='700' fill='#1e293b'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getCategoryLabel = (tags) => {
  if (tags.includes("government")) return "Government";
  if (tags.includes("SETA")) return "SETA";
  if (tags.includes("foundation")) return "Foundation";
  if (tags.includes("public entity")) return "Public Entity";
  if (tags.includes("professional body")) return "Professional Body";
  return "Corporate";
};

const getDeadlinePill = (deadlineText) => {
  const normalized = deadlineText.toLowerCase();

  if (normalized.includes("varies")) {
    return {
      label: "Deadline Varies",
      background: "#e2e8f0",
      color: "#334155",
    };
  }

  return {
    label: "Application Open",
    background: "#dcfce7",
    color: "#166534",
  };
};

export default function Bursary() {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkMeta, setBookmarkMeta] = useState({});
  const [compareIds, setCompareIds] = useState([]);
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

    return () => {
      cancelled = true;
    };
  }, [loadBursaryBookmarks, user?.uid]);

  useEffect(() => {
    if (!isGuest) return;

    setBookmarks([]);
    setBookmarkMeta({});
    if (activeTab === "saved") setActiveTab("all");
  }, [activeTab, isGuest]);

  const toggleBookmark = (id) => {
    if (isGuest) {
      navigate("/auth");
      return;
    }

    setBookmarks((prev) => {
      const removing = prev.includes(id);
      const next = removing ? prev.filter((b) => b !== id) : [...prev, id];
      const persist = removing ? removeBursaryBookmark(id) : saveBursaryBookmark(id);

      persist.catch((e) => console.error("Bookmark sync error", e));

      setBookmarkMeta((m) => {
        const nm = { ...m };
        if (removing) {
          delete nm[id];
        } else if (!nm[id]) {
          nm[id] = { folder: "General", notes: "" };
        }
        return nm;
      });

      return next;
    });
  };

  const updateBookmarkMeta = (id, partial) => {
    if (isGuest) {
      navigate("/auth");
      return;
    }

    setBookmarkMeta((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...partial,
      },
    }));

    if (!user?.uid) return;

    setDoc(
      doc(db, "users", user.uid, "bursaryBookmarks", id),
      { ...partial, updatedAt: serverTimestamp() },
      { merge: true }
    ).catch((e) => console.error("Meta update error", e));
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const filtered = useMemo(() => {
    let list = BURSARIES;

    if (activeTab === "saved") {
      list = list.filter((b) => bookmarks.includes(b.id));
    }

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
      list = list.filter((b) => b.fields.includes(fieldFilter));
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

  const compareBursaries = useMemo(
    () => BURSARIES.filter((b) => compareIds.includes(b.id)),
    [compareIds]
  );

  const recommendations = useMemo(() => {
    if (!bookmarks.length) {
      return BURSARIES.slice(0, 3);
    }

    const saved = BURSARIES.filter((b) => bookmarks.includes(b.id));
    const categoryScores = saved.reduce((acc, item) => {
      item.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return BURSARIES
      .filter((b) => !bookmarks.includes(b.id))
      .map((b) => ({
        ...b,
        score: b.tags.reduce((acc, tag) => acc + (categoryScores[tag] || 0), 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [bookmarks]);

  return (
    <div>
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

      <div className="dashboard-page">
        <header className="dashboard-welcome">
          <h1 className="dashboard-welcome__greeting">
            <FaGraduationCap /> Bursary <span>Finder</span>
          </h1>
          <p className="dashboard-welcome__sub">
            Discover and save bursary opportunities from across South Africa.
          </p>
        </header>

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

        <div className="dashboard-shortcuts">
          <button
            className="dashboard-shortcut"
            onClick={() => navigate(isGuest ? "/auth" : "/Profile")}
          >
            <FaUserCircle /> {isGuest ? "Sign In / Create Account" : "My Profile"}
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate("/Aplication")}>
            <FaUniversity /> Application
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate("/Practise")}>
            <FaPencilAlt /> Past Papers
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--blue">{BURSARIES.length}</p>
            <p className="dashboard-stat__label">Bursaries</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">{ALL_FIELDS.length}</p>
            <p className="dashboard-stat__label">Fields of Study</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--purple">{bookmarks.length}</p>
            <p className="dashboard-stat__label">Saved</p>
          </div>
        </div>

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
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }}
          >
            <option value="all">All Provinces</option>
            {ALL_PROVINCES.filter((p) => p !== "All Provinces").map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px" }}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {recommendations.length > 0 && (
          <section className="dashboard-recommendations" aria-label="Smart Recommendations">
            <div className="dashboard-recommendations__header">
              <p className="dashboard-stat__label" style={{ margin: 0 }}>
                Smart Recommendations
              </p>
              <span className="dashboard-recommendations__hint">
                Based on your saved bursaries and preferred categories.
              </span>
            </div>
            <div className="dashboard-recommendations__grid">
              {recommendations.map((b) => {
                const isSaved = bookmarks.includes(b.id);

                return (
                  <button
                    key={`rec-${b.id}`}
                    className={`dashboard-recommendation ${isSaved ? "dashboard-recommendation--saved" : ""}`}
                    onClick={() => toggleBookmark(b.id)}
                  >
                    <span className="dashboard-recommendation__title">{b.name}</span>
                    <span className="dashboard-recommendation__meta">
                      <FaMapMarkerAlt /> {b.province}
                    </span>
                    <span className="dashboard-recommendation__cta">
                      {isSaved ? "Saved" : "Save Recommendation"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {compareBursaries.length > 0 && (
          <section className="dashboard-compare" aria-label="Compare Bursaries">
            <div className="dashboard-compare__header">
              <p className="dashboard-stat__label" style={{ margin: 0 }}>
                <FaBalanceScale /> Compare Bursaries ({compareBursaries.length}/4)
              </p>
              <button
                className="dashboard-tab dashboard-compare__clear"
                onClick={() => setCompareIds([])}
              >
                Clear Compare
              </button>
            </div>
            <div className="dashboard-compare__table-wrap">
              <table className="dashboard-compare__table">
                <thead>
                  <tr>
                    <th>Bursary</th>
                    <th>Provider</th>
                    <th>Province</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {compareBursaries.map((b) => (
                    <tr key={`compare-${b.id}`}>
                      <td data-label="Bursary">{b.name}</td>
                      <td data-label="Provider">{b.provider}</td>
                      <td data-label="Province">{b.province}</td>
                      <td data-label="Deadline">{b.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {filtered.length > 0 ? (
          <div className="uni-grid" key={activeTab}>
            {filtered.map((b) => {
              const saved = bookmarks.includes(b.id);
              const folderValue = bookmarkMeta[b.id]?.folder || "General";
              const noteValue = bookmarkMeta[b.id]?.notes || "";
              const compareSelected = compareIds.includes(b.id);
              const deadlinePill = getDeadlinePill(b.deadline);
              const categoryLabel = getCategoryLabel(b.tags);

              return (
                <article className="uni-card" key={b.id}>
                  <div className="uni-card__header">
                    <img className="uni-card__logo" src={createLogoDataUri(b.provider, b.id)} alt={`${b.provider} logo`} />
                    <button
                      className={`uni-card__bookmark ${!isGuest && saved ? "uni-card__bookmark--active" : ""}`}
                      onClick={() => toggleBookmark(b.id)}
                      aria-label={isGuest ? "Sign in to save bursary" : saved ? "Remove bookmark" : "Add bookmark"}
                      title={
                        isGuest
                          ? "Sign in to save bursaries"
                          : saved
                          ? "Remove from saved"
                          : "Save for later"
                      }
                    >
                      {!isGuest && saved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  <div className="uni-card__body">
                    <h3 className="uni-card__name">{b.name}</h3>
                    <p className="uni-card__location">
                      <FaMapMarkerAlt /> {b.province}
                    </p>

                    <div className="uni-card__status-row">
                      <span className="uni-card__status-pill" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                        {categoryLabel}
                      </span>
                      <span
                        className="uni-card__status-pill uni-card__status-pill--days"
                        style={{ background: deadlinePill.background, color: deadlinePill.color }}
                      >
                        <FaClock className="uni-card__status-icon" />
                        {deadlinePill.label}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "#475569", marginTop: 8 }}>
                      {b.deadline}
                    </p>
                    <p className="uni-card__desc">{b.description}</p>
                    <p style={{ fontSize: "0.83rem", color: "#334155", marginTop: 6 }}>
                      <FaUniversity /> {b.provider}
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>{b.covers}</p>

                    <div className="bursary-tags" style={{ marginTop: 10 }}>
                      {b.fields.slice(0, 3).map((f) => (
                        <span className="tag" key={f}>
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="uni-card__actions" style={{ gap: 8, display: "flex", flexWrap: "wrap", marginTop: 10 }}>
                      <button
                        className="uni-card__btn uni-card__btn--primary uni-card__btn--apply"
                        onClick={() => window.open(b.applyUrl, "_blank", "noopener,noreferrer")}
                      >
                        Apply Now <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                      </button>
                      <button
                        className="uni-card__btn"
                        onClick={() => toggleCompare(b.id)}
                        style={{
                          borderColor: compareSelected ? "#4338ca" : undefined,
                          color: compareSelected ? "#4338ca" : undefined,
                        }}
                      >
                        <FaBalanceScale /> {compareSelected ? "Added to Compare" : "Compare"}
                      </button>
                    </div>

                    {!isGuest && saved && activeTab === "saved" && (
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        <label style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                          Folder
                        </label>
                        <select
                          value={folderValue}
                          onChange={(e) => updateBookmarkMeta(b.id, { folder: e.target.value })}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 8 }}
                        >
                          {BOOKMARK_FOLDERS.map((folder) => (
                            <option key={`${b.id}-${folder}`} value={folder}>
                              {folder}
                            </option>
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
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty__icon" aria-hidden="true">
              <FaSearch />
            </div>
            <p className="dashboard-empty__text">
              {activeTab === "saved"
                ? "You haven't saved any bursaries yet. Tap the bookmark icon to save."
                : "No bursaries match your search."}
            </p>
          </div>
        )}
      </div>

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
            <p className="copyright">&copy; 2026 THANDULULO TECHNOLOGIES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
