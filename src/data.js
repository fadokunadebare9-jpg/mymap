// All the campus data lives here. Edit this file to add places, courses or emergency numbers.
export const CFG = {
  center: [8.4820, 4.6716], zoom: 16, minZoom: 15, maxZoom: 19,
  bounds: [[8.4640, 4.6520], [8.4990, 4.6920]],
  walkMpm: 80, shuttleMpm: 250, shuttleWaitMin: 4, detour: 1.3,
  storeKey: "unilorin-map", dataVersion: 7,
  cartoKey: "cb1_45gb_1_8b692627c641bfcc622acec8" // CARTO raster basemap key (removes the watermark)
};

// EDIT ME: replace blank numbers with official lines from your student handbook.
export const EMERGENCY = [
  { name: "National emergency (police, fire, ambulance)", num: "112" },
  { name: "UNILORIN Security", num: "" },
  { name: "UNILORIN Clinic", num: "" },
  { name: "Fire service", num: "112" }
];

// Category -> label, colour, icon, optional dark glyph (for light backgrounds)
export const CATS = {
  academic: { label: "Faculties", color: "#1565C0", icon: "book" },
  dept: { label: "Departments", color: "#283593", icon: "building" },
  learning: { label: "Lectures & Library", color: "#6D4C41", icon: "book" },
  admin: { label: "Admin", color: "#002147", icon: "building" },
  transit: { label: "Transit", color: "#D4AF37", icon: "bus", dark: 1 },
  hostel: { label: "Hostels", color: "#5E35B1", icon: "home" },
  food: { label: "Food & Cafés", color: "#D84315", icon: "food" },
  bank: { label: "Banks & ATMs", color: "#455A64", icon: "bank" },
  amenity: { label: "Amenities", color: "#EF6C00", icon: "star" },
  medical: { label: "Medical", color: "#C62828", icon: "cross" },
  eco: { label: "Eco-park", color: "#2E7D32", icon: "leaf" },
  hangout: { label: "Hangouts", color: "#00897B", icon: "users" }
};
// Re-files places that were sitting in the wrong category (applied on load, so cached data is fixed too)
export const RECAT = { library: "learning", blk1: "learning", blk2: "learning", cbt: "learning", bank: "bank" };
export const HUBS = ["ps", "gate", "motion", "taxi"];           // get pulsing radar rings
export const SHUTTLE = ["gate", "motion", "senate", "cis", "fet", "arts", "ps", "gate"]; // illustrative loop

// [id, name, category, lat, lng, tag, description, keywords]
export const DEFAULT_PLACES = [
  ["ps", "PS (Permanent Site) Bus Stop", "transit", 8.4790, 4.6700, "Transit hub", "Main pick-up and drop-off point for buses and tricycles.", "bus keke shuttle park"],
  ["gate", "Main Gate", "transit", 8.4700, 4.6665, "Gateway", "Principal entrance. Keep your admission letter or ID handy.", "entrance security"],
  ["motion", "Motion Ground", "transit", 8.4765, 4.6735, "Open ground", "Large field for orientation, matriculation and events.", "field sports orientation"],
  ["taxi", "Taxi Park", "transit", 8.4795, 4.6685, "Taxi & keke", "Taxis and tricycles to town and nearby areas.", "cab keke ride"],
  ["senate", "Senate Building (7-storey)", "admin", 8.4822, 4.6716, "Administration", "Seat of the Vice-Chancellor, Registry and top management.", "vc registry clearance admin"],
  ["affairs", "Student Affairs", "admin", 8.4815, 4.6728, "Student welfare", "Hostel matters, ID issues, welfare and student conduct.", "dean welfare id"],
  ["sub", "Student Union Building (SUB)", "admin", 8.4808, 4.6700, "Student life", "Student union offices, eateries and shops.", "suag food canteen"],
  ["library", "Central Library", "academic", 8.4830, 4.6700, "Library", "Reading halls and learning resources. Register early.", "books study reading"],
  ["cis", "Faculty of CIS", "academic", 8.4845, 4.6725, "Faculty · CIS", "Communication & Information Sciences: computer science, IT, mass communication.", "csc ift mac ict computer"],
  ["arts", "Faculty of Arts", "academic", 8.4838, 4.6688, "Faculty · Arts", "English, History, Languages, Religions and related departments.", "english history linguistics"],
  ["fet", "Faculty of Engineering & Tech (FET)", "academic", 8.4850, 4.6760, "Faculty · FET", "Engineering departments and workshops.", "engineering civil mechanical electrical"],
  ["blk1", "Block 1–5 Lecture Theatres", "academic", 8.4828, 4.6742, "Lecture halls", "Shared theatres for general courses and 100-level classes.", "block 1 2 3 4 5 lecture gst"],
  ["blk2", "Block 6–10 Lecture Theatres", "academic", 8.4835, 4.6752, "Lecture halls", "More shared lecture halls. Check your timetable for the room.", "block 6 7 8 9 10 lecture"],
  ["cbt", "CBT Centre", "academic", 8.4820, 4.6748, "Computer tests", "Computer-based tests and exams. Arrive early with your ID.", "cbt exam test"],
  ["v-lagos", "Village I · Lagos", "hostel", 8.4860, 4.6690, "Hostel · Village", "On-campus residence. Confirm allocation with hostel management.", "village 1 lagos"],
  ["v-abuja", "Village II · Abuja", "hostel", 8.4868, 4.6705, "Hostel · Village", "On-campus residence near the faculties.", "village 2 abuja"],
  ["v-zamfara", "Village III · Zamfara", "hostel", 8.4872, 4.6722, "Hostel · Village", "On-campus residence. Bring your own bedding.", "village 3 zamfara"],
  ["arafims", "Arafims Hostel 1 & 2", "hostel", 8.4775, 4.6760, "Private · Male", "Private accommodation near campus.", "private hostel male"],
  ["sanusi", "Sanusi Hostel 1 & 2", "hostel", 8.4770, 4.6778, "Private · Male", "Private accommodation popular with students.", "private hostel male"],
  ["vegas", "Las Vegas Hostel", "hostel", 8.4760, 4.6765, "Private hostel", "Private accommodation close to Motion Ground.", "private hostel"],
  ["clinic", "UNILORIN Clinic", "medical", 8.4802, 4.6672, "Health centre", "Student health centre. Bring your ID and complete medical registration.", "hospital doctor sick"],
  ["eco", "Dam / Eco-Park", "eco", 8.4875, 4.6770, "Green space", "Quiet natural spot for relaxing and study breaks.", "dam garden nature"],
  ["audit", "Main Auditorium", "amenity", 8.4812, 4.6738, "Events hall", "Venue for ceremonies, convocation and major programmes.", "hall events"],
  ["mosque", "Central Mosque", "amenity", 8.4800, 4.6715, "Worship", "Central place of Muslim worship on campus.", "prayer jumat"],
  ["bank", "Commercial / Banking Area", "amenity", 8.4798, 4.6695, "ATMs & food", "Banks, ATMs, eateries and shops. Queues build at semester start.", "atm bank cash pos food"],
  // --- Added in v3. Names come from student write-ups; positions are rough guesses, so please correct them.
  ["walkin", "Walk-In Hostel", "hostel", 8.4742, 4.6722, "Hostel", "On-campus residence close to the main lecture areas.", "walk in accommodation"],
  ["sanrab", "Sanrab Hostel", "hostel", 8.4735, 4.6755, "Hostel", "Student hostel complex. Bring your own bedding and padlock.", "accommodation"],
  ["item7", "Item 7", "food", 8.4796, 4.6706, "Restaurant", "One of the most popular campus eateries, known for rice dishes.", "rice restaurant lunch dinner"],
  ["grubtown", "Grub Town", "food", 8.4803, 4.6724, "Restaurant", "Comfortable spot with swallow, rice, beans, snacks and pastries.", "snacks meat pie burger swallow"],
  ["bakery", "The Bakery", "food", 8.4810, 4.6692, "Café & bakery", "Fresh bread, coffee, ice cream and snacks in a relaxed setting. A bit pricey.", "coffee ice cream bread cafe"],
  ["pepsi", "Pepsi Village", "food", 8.4786, 4.6741, "Eateries", "Cluster of small food and drink spots.", "drinks food shawarma"],
  ["bukas", "SUB Bukas", "food", 8.4806, 4.6697, "Cheap eats", "Budget buka stalls opposite the Student Union Building.", "buka cheap rice amala"],
  // --- Added in v4: private & cooperative hostels. Positions are PLACEHOLDERS (grouped by type); please correct them.
  ["h-pyramid-hostel", "Pyramid Hostel", "hostel", 8.4748, 4.679, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-health-care-hostel", "Health Care Hostel", "hostel", 8.4748, 4.6795, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-sky-hostel", "Sky Hostel", "hostel", 8.4748, 4.68, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-takleemah-hostel", "Takleemah Hostel", "hostel", 8.4748, 4.6805, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-zapel-hostel", "Zapel Hostel", "hostel", 8.4744, 4.679, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-kikilomo-runsenwe-hostel", "Kikilomo Runsenwe Hostel", "hostel", 8.4744, 4.6795, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-international-male-hostel", "International Male Hostel", "hostel", 8.4744, 4.68, "Private · Male", "Private male hostel near campus. Confirm location and rooms with seniors.", "private hostel male accommodation"],
  ["h-rubiks-hostel", "Rubiks Hostel", "hostel", 8.4722, 4.677, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-hawa-hostel", "Hawa Hostel", "hostel", 8.4722, 4.6774, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-atlantic-height-hostel", "Atlantic Height Hostel", "hostel", 8.4722, 4.6778, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-queens-hostel", "Queens Hostel", "hostel", 8.4722, 4.6782, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-charis-hostel", "Charis Hostel", "hostel", 8.4722, 4.6786, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-el-mubarak-hostel", "El-Mubarak Hostel", "hostel", 8.4722, 4.679, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-easy-quiet-hostel", "Easy & Quiet Hostel", "hostel", 8.4718, 4.677, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-edge-hostel", "Edge Hostel", "hostel", 8.4718, 4.6774, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-al-mutawakil-hostel", "Al-Mutawakil Hostel", "hostel", 8.4718, 4.6778, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-moremi-hostel", "Moremi Hostel", "hostel", 8.4718, 4.6782, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-ibidun-hostel", "Ibidun Hostel", "hostel", 8.4718, 4.6786, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-albanic-hostel", "Albanic Hostel", "hostel", 8.4718, 4.679, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-robiat-ajike-hostel", "Robiat Ajike Hostel", "hostel", 8.4714, 4.677, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-michael-hostel", "Michael Hostel", "hostel", 8.4714, 4.6774, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-bethany-hostel", "Bethany Hostel", "hostel", 8.4714, 4.6778, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-kam-abioye-hostel", "KAM Abioye Hostel", "hostel", 8.4714, 4.6782, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-habibah-abake-hostel", "Habibah Abake Hostel", "hostel", 8.4714, 4.6786, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-probitad-doctrina-hostel", "Probitad Doctrina Hostel", "hostel", 8.4714, 4.679, "Private · Female", "Private female hostel near campus. Confirm location and rooms with seniors.", "private hostel female accommodation"],
  ["h-trunil-hostel-village-v", "Trunil Hostel (Village V)", "hostel", 8.488, 4.669, "PPP hostel", "High-capacity private PPP hostel.", "trunil village 5 v ppp hostel accommodation"],
  ["h-unilorin-scientific-multipurpose-cooperative-hostel", "Unilorin Scientific Multipurpose Cooperative Hostel", "hostel", 8.488, 4.6705, "Cooperative hostel", "Joint cooperative private hostel.", "cooperative scientific multipurpose hostel accommodation"],
  ["h-pace-setters-staff-multipurpose-cooperative-hostel", "Pace-Setters Staff Multipurpose Cooperative Hostel", "hostel", 8.488, 4.672, "Cooperative hostel", "Joint cooperative private hostel for staff.", "cooperative pacesetters staff multipurpose hostel accommodation"],
  // --- Added in v5: remaining faculties and banks. Positions are PLACEHOLDERS; please correct them.
  ["college-of-health-sciences", "College of Health Sciences", "academic", 8.479, 4.665, "College · Health Sciences", "Basic Medical Sciences, Clinical Sciences and Basic Clinical Sciences.", "medicine health basic medical clinical anatomy physiology nursing"],
  ["faculty-of-agriculture", "Faculty of Agriculture", "academic", 8.4868, 4.6748, "Faculty · Agriculture", "Agricultural departments, farms and labs.", "agric agriculture farm crop animal"],
  ["faculty-of-education", "Faculty of Education", "academic", 8.4842, 4.6705, "Faculty · Education", "Education departments and teacher training.", "education teaching"],
  ["faculty-of-environmental-sciences", "Faculty of Environmental Sciences", "academic", 8.486, 4.6765, "Faculty · Environmental Sci.", "Architecture, urban planning, surveying and related departments.", "environmental architecture estate surveying planning"],
  ["faculty-of-law", "Faculty of Law", "academic", 8.4835, 4.667, "Faculty · Law", "Law faculty with its own law library.", "law legal"],
  ["faculty-of-life-sciences", "Faculty of Life Sciences", "academic", 8.4846, 4.678, "Faculty · Life Sciences", "Biology-related departments and labs.", "life sciences biology microbiology zoology botany"],
  ["faculty-of-management-sciences", "Faculty of Management Sciences", "academic", 8.4852, 4.674, "Faculty · Management", "Accounting, business, finance and related departments.", "management accounting business marketing"],
  ["faculty-of-pharmaceutical-sciences", "Faculty of Pharmaceutical Sciences", "academic", 8.4855, 4.6792, "Faculty · Pharmacy", "Pharmacy departments and labs.", "pharmacy pharmaceutical drugs"],
  ["faculty-of-physical-sciences", "Faculty of Physical Sciences", "academic", 8.4838, 4.6775, "Faculty · Physical Sci.", "Maths, physics, chemistry, statistics and related departments.", "physical sciences maths physics chemistry statistics"],
  ["faculty-of-social-sciences", "Faculty of Social Sciences", "academic", 8.4856, 4.67, "Faculty · Social Sci.", "Economics, political science, sociology and related departments.", "social sciences economics political sociology psychology"],
  ["faculty-of-veterinary-medicine", "Faculty of Veterinary Medicine", "academic", 8.4878, 4.6735, "Faculty · Veterinary", "Veterinary medicine departments and clinic.", "veterinary vet animals"],
  ["bk-guaranty-trust-bank", "Guaranty Trust Bank (GTBank)", "amenity", 8.4805, 4.6704, "Bank · ATM", "Full branch and e-branch/ATM hub near the student centre.", "gtb gtbank atm bank cash"],
  ["bk-zenith-bank", "Zenith Bank", "amenity", 8.4799, 4.6691, "Bank", "Campus branch in the banking zone.", "atm bank cash"],
  ["bk-access-bank", "Access Bank", "amenity", 8.4797, 4.6694, "Bank", "Campus branch in the banking zone.", "atm bank cash"],
  ["bk-united-bank-for-africa", "United Bank for Africa (UBA)", "amenity", 8.4796, 4.6698, "Bank", "Campus branch in the banking zone.", "uba atm bank cash"],
  ["bk-unilorin-microfinance-bank", "Unilorin Microfinance Bank", "amenity", 8.48, 4.6699, "Microfinance bank", "Local campus bank serving university staff and accounts.", "microfinance bank staff"],
  ["bk-jaiz-bank", "Jaiz Bank", "amenity", 8.4795, 4.669, "Bank", "Campus branch in the banking zone.", "jaiz non-interest atm bank cash"]
];

// Course-code prefixes -> place (Lecture Hall Finder). Extend freely.
export const HALLS = [
  [/^(CIS|CSC|IFT|MAC|ICT|TCS|LIS|ICS)$/, "cis"],
  [/^(FET|EGR|MEE|CVE|EEE|CHE|ABE|BME|CPE|MME|WRE|FBE)$/, "fet"],
  [/^(ENL|HIS|LIN|CRS|IRS|ARA|YOR|THR|PHI|FRE|PFA|CST)$/, "arts"],
  [/^(CBT|EXAM)$/, "cbt"],
  [/^(GST|GNS|GES|MTH|PHY|CHM|BIO|STA|BCH)$/, "blk1"],
  [/^(AGR|ANS|CSP|AEE|AGE|FST)$/, "faculty-of-agriculture"],
  [/^(EDU|ECE|ARE|SED|GCE)$/, "faculty-of-education"],
  [/^(ENV|URP|QSV|EST|ARC|BLD|SVG)$/, "faculty-of-environmental-sciences"],
  [/^(LAW|JIL|PPL|CPL)$/, "faculty-of-law"],
  [/^(MCB|ZOO|PLB|MBI|BOT)$/, "faculty-of-life-sciences"],
  [/^(ACC|BUS|FIN|MKT|MGT|ENT|PAD)$/, "faculty-of-management-sciences"],
  [/^(PHA|PCL|PCG|PMB|PHC)$/, "faculty-of-pharmaceutical-sciences"],
  [/^(ECO|SOC|POL|PSY|GEO|SSC|DSS)$/, "faculty-of-social-sciences"],
  [/^(VET|VPH|VAN)$/, "faculty-of-veterinary-medicine"],
  [/^(ANA|PHS|BMS|MED|NUR|MLS|ANT)$/, "college-of-health-sciences"]
];

// Courses of study: [faculty key, programme, degree, years for UTME entry]. Direct Entry skips 100L. Verify with your department handbook.
export const FAC = {
  agric: ["Faculty of Agriculture", "faculty-of-agriculture"], arts: ["Faculty of Arts", "arts"],
  bms: ["Basic Medical Sciences", "college-of-health-sciences"], clin: ["Clinical Sciences", "college-of-health-sciences"],
  cis: ["Faculty of CIS", "cis"], edu: ["Faculty of Education", "faculty-of-education"], eng: ["Faculty of Engineering & Tech", "fet"],
  env: ["Faculty of Environmental Sciences", "faculty-of-environmental-sciences"], law: ["Faculty of Law", "faculty-of-law"],
  life: ["Faculty of Life Sciences", "faculty-of-life-sciences"], mgt: ["Faculty of Management Sciences", "faculty-of-management-sciences"],
  pharm: ["Faculty of Pharmaceutical Sciences", "faculty-of-pharmaceutical-sciences"], phys: ["Faculty of Physical Sciences", "faculty-of-physical-sciences"],
  soc: ["Faculty of Social Sciences", "faculty-of-social-sciences"], vet: ["Faculty of Veterinary Medicine", "faculty-of-veterinary-medicine"]
};
export const COURSES = [
  ["agric", "Agricultural Economics & Farm Management", "B.Agric.", 5], ["agric", "Agricultural Extension & Rural Development", "B.Sc.", 4],
  ["agric", "Agronomy", "B.Agric.", 5], ["agric", "Animal Production", "B.Agric.", 5], ["agric", "Crop Protection", "B.Agric.", 5],
  ["agric", "Aquaculture & Fisheries", "B.Aqua. & Fisheries", 4], ["agric", "Forestry & Wildlife Management", "B.Forestry", 4], ["agric", "Home Economics & Food Science", "B.Sc.", 4],
  ["arts", "Arabic", "B.A.", 4], ["arts", "Christian Studies", "B.A.", 4], ["arts", "English", "B.A.", 4], ["arts", "French", "B.A.", 4],
  ["arts", "History & International Studies", "B.A.", 4], ["arts", "Islamic Studies", "B.A.", 4], ["arts", "Linguistics", "B.A.", 4],
  ["arts", "Performing Arts", "B.A.", 4], ["arts", "Philosophy", "B.A.", 4], ["arts", "Yoruba", "B.A.", 4],
  ["bms", "Anatomy", "B.Sc.", 4], ["bms", "Physiology", "B.Sc.", 4], ["bms", "Nursing Science", "B.NSc.", 5],
  ["clin", "Medicine & Surgery", "MBBS", 6],
  ["cis", "Computer Science", "B.Sc.", 4], ["cis", "Information & Communication Science", "B.Sc.", 4], ["cis", "Library & Information Science", "B.LIS", 4],
  ["cis", "Mass Communication", "B.Sc.", 4], ["cis", "Telecommunication Science", "B.Sc.", 4],
  ["edu", "Primary Education Studies", "B.Ed.", 4], ["edu", "Arts Education (English, French, Arabic, Yoruba, CRS, IRS, History)", "B.A.Ed.", 4],
  ["edu", "Social Sciences Education (Economics, Geography, Social Studies)", "B.Ed.", 4], ["edu", "Science Education (Maths, Physics, Chemistry, Biology, Agric Science)", "B.Sc.Ed.", 4],
  ["edu", "Counsellor Education", "B.Ed.", 4], ["edu", "Adult & Non-Formal Education", "B.Ed.", 4], ["edu", "Business Education", "B.Ed.", 4], ["edu", "Computer Science Education", "B.Ed.", 4],
  ["edu", "Educational Technology", "B.Ed.", 4], ["edu", "Health Education", "B.Sc.Ed.", 4], ["edu", "Human Kinetics Education", "B.Ed.", 4],
  ["edu", "Building Technology Education", "B.Tech.Ed.", 4], ["edu", "Electrical/Electronics Technology Education", "B.Tech.Ed.", 4],
  ["edu", "Metalwork Technology Education", "B.Tech.Ed.", 4], ["edu", "Woodwork Technology Education", "B.Tech.Ed.", 4],
  ["eng", "Agricultural & Biosystems Engineering", "B.Eng.", 5], ["eng", "Biomedical Engineering", "B.Eng.", 5], ["eng", "Chemical Engineering", "B.Eng.", 5],
  ["eng", "Civil Engineering", "B.Eng.", 5], ["eng", "Computer Engineering", "B.Eng.", 5], ["eng", "Electrical & Electronics Engineering", "B.Eng.", 5],
  ["eng", "Food Engineering", "B.Eng.", 5], ["eng", "Materials & Metallurgical Engineering", "B.Eng.", 5], ["eng", "Mechanical Engineering", "B.Eng.", 5],
  ["eng", "Water Resources & Environmental Engineering", "B.Eng.", 5],
  ["env", "Architecture", "B.Sc. (Arch.)", 5], ["env", "Estate Management", "B.Sc.", 4], ["env", "Quantity Surveying", "B.Sc.", 4],
  ["env", "Surveying & Geoinformatics", "B.Sc.", 4], ["env", "Urban & Regional Planning", "B.Sc.", 4],
  ["law", "Law (Common Law)", "LL.B.", 5], ["law", "Law (Common & Islamic Law)", "LL.B.", 5],
  ["life", "Biochemistry", "B.Sc.", 4], ["life", "Microbiology", "B.Sc.", 4], ["life", "Plant Biology", "B.Sc.", 4], ["life", "Zoology", "B.Sc.", 4],
  ["mgt", "Accounting", "B.Sc.", 4], ["mgt", "Business Administration", "B.Sc.", 4], ["mgt", "Finance", "B.Sc.", 4], ["mgt", "Marketing", "B.Sc.", 4], ["mgt", "Public Administration", "B.Sc.", 4],
  ["pharm", "Pharmacy", "Pharm.D.", 6],
  ["phys", "Chemistry", "B.Sc.", 4], ["phys", "Geology & Mineral Sciences", "B.Sc.", 4], ["phys", "Industrial Chemistry", "B.Sc.", 4],
  ["phys", "Mathematics", "B.Sc.", 4], ["phys", "Physics", "B.Sc.", 4], ["phys", "Statistics", "B.Sc.", 4],
  ["soc", "Economics", "B.Sc.", 4], ["soc", "Geography & Environmental Management", "B.Sc.", 4], ["soc", "Political Science", "B.Sc.", 4], ["soc", "Psychology", "B.Sc.", 4], ["soc", "Sociology", "B.Sc.", 4],
  ["vet", "Veterinary Medicine", "DVM", 6]
];
// One pin per department building, grouped just south of its faculty. POSITIONS ARE APPROXIMATE: drag-correct by adding a pin, then export it.
export const dId = n => "d-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
(() => {
  const cnt = {};
  COURSES.forEach(([f, n, d, y]) => {
    const fp = DEFAULT_PLACES.find(r => r[0] === FAC[f][1]), i = cnt[f] = (cnt[f] ?? -1) + 1;
    const lat = +(fp[3] - 0.00022 * (1 + Math.floor(i / 4))).toFixed(5), lng = +(fp[4] + 0.00026 * ((i % 4) - 1.5)).toFixed(5);
    DEFAULT_PLACES.push([dId(n), n.replace(/\s*\(.*\)/, "") + " Dept.", "dept", lat, lng, "Dept · " + FAC[f][0].replace("Faculty of ", ""),
    `${d} · ${y} years (100L–${y * 100}L). Belongs to the ${FAC[f][0]}. Exact building spot not yet verified; confirm the entrance with seniors.`, `${n} ${FAC[f][0]} department building`]);
  });
})();

// Photos: id -> Wikimedia Commons file name (free-licensed). Add more with  id: "File name.jpg"
// You can also use a full https:// URL (e.g. your own hosted image). Places without an entry keep the icon placeholder.
export const PHOTOS = {
  gate: "Unilorin main gate.jpg",
  senate: "University of Ilorin (unilorin) Senate building.jpg",
  arts: "University of Ilorin faculty of arts building.jpg",
  audit: "University of Ilorin Main Auditorium (front view).jpg",
  mosque: "University of Ilorin Central Mosque (front view) 02.jpg",
  eco: "University of ilorin lake, ilorin , Nigeria. The University of ilorin dam 07.jpg"
};
export const photoURL = id => { const f = PHOTOS[id]; if (!f) return ""; return /^https?:/.test(f) ? f : "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(f) + "?width=500"; };
