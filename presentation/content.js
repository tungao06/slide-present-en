// ---------------------------------------------------------------------------
// SLIDE CONTENT ONLY. Edit text here; styling and layout live in build.js.
// Numbers are quoted verbatim from the two source articles (see REFS).
// ---------------------------------------------------------------------------
const SHORT_REFS = "Dell'Acqua et al. (2023), Harvard Business School Working Paper 24-013   |   Otis et al. (2026), Management Science, 72(7), https://doi.org/10.1287/mnsc.2024.06909";
const REFS = {
  a2: "Dell'Acqua, F., McFowland III, E., Mollick, E., Lifshitz-Assaf, H., Kellogg, K. C., Rajendran, S., Krayer, L., Candelon, F., & Lakhani, K. R. (2023). Navigating the Jagged Technological Frontier. Harvard Business School Working Paper 24-013.",
  a5: "Otis, N. G., Clarke, R., Delecourt, S., Holtz, D., & Koning, R. (2026). The Uneven Impact of Generative Artificial Intelligence on Entrepreneurial Performance: Evidence from a Field Experiment in Kenya. Management Science, 72(7). https://doi.org/10.1287/mnsc.2024.06909",
};

const PRESENTER = {
  en: { name: "Chayanun Sungsa-ard", id: "Student ID 691401708", degree: "Master of Business Administration (MBA)", course: "ENG 501 English for Master's Degree" },
  th: { name: "Chayanun Sungsa-ard", id: "รหัสนักศึกษา 691401708", degree: "หลักสูตรบริหารธุรกิจมหาบัณฑิต (MBA)", course: "ENG 501 English for Master's Degree" },
};

const EN = {
  tags: { finding: "FINDING (reported in the article)", interp: "INTERPRETATION", concept: "CONCEPT" },
  footer: "Chayanun Sungsa-ard  |  691401708  |  MBA  |  ENG 501",
  steps: ["Introduction", "Article 2: Method", "Article 2: Findings", "Article 5: Entrepreneurs", "Discussion"],
  nextLabel: "Next",
  s1: {
    title: "Artificial Intelligence and Work Performance",
    subtitle: "Evidence from two recent field experiments",
    question: "Central question: How does AI affect productivity, work quality, and business performance?",
    articles: [
      { label: "Article 2", title: "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality", meta: "Fabrizio Dell'Acqua et al.  |  Harvard Business School Working Paper 24-013, 2023" },
      { label: "Article 5", title: "The Uneven Impact of Generative Artificial Intelligence on Entrepreneurial Performance: Evidence from a Field Experiment in Kenya", meta: "Nicholas G. Otis et al.  |  Management Science, Vol. 72, No. 7, 2026  |  DOI 10.1287/mnsc.2024.06909" },
    ],
    roadmapHead: "Today's path",
    notes: "Good morning. Today I will look at one question: how does AI affect productivity, work quality and business performance? I will use two recent field experiments. Article 2 studies consultants at BCG working with GPT-4. Article 5 studies small-business entrepreneurs in Kenya who received a GPT-4 business assistant. First the office, then the marketplace, and finally what the two studies tell us together.",
  },
  s2: {
    title: "Navigating the Jagged Technological Frontier",
    kicker: "Article 2  |  Research purpose and method",
    byline: "Fabrizio Dell'Acqua et al.  |  Harvard Business School Working Paper 24-013, 2023",
    facts: [
      { icon: "FiBriefcase", head: "Research partner", body: "Field experiment conducted with Boston Consulting Group (BCG)" },
      { icon: "FiUsers", head: "Participants", body: "758 consultants took part" },
      { icon: "FiTarget", head: "Research focus", body: "Productivity, work quality, and the boundaries of AI capability" },
    ],
    condHead: "Three experimental conditions",
    conditions: ["No AI access", "GPT-4 access", "GPT-4 access with prompt engineering guidance"],
    conceptHead: "The \"Jagged Technological Frontier\"",
    conceptBody: "AI can perform some tasks well while struggling with other tasks that appear similarly difficult. The boundary is uneven, so workers cannot assume that a task is \"safe\" for AI just because it looks easy.",
    diagram: { inside: "Inside the frontier: AI performs well", outside: "Outside the frontier: AI struggles", axis: "Tasks of similar apparent difficulty" },
    bridge: "So what happened when 758 consultants actually used GPT-4?",
    notes: "Article 2 is a field experiment run with Boston Consulting Group. 758 consultants were randomly assigned to one of three conditions: no AI, GPT-4, or GPT-4 plus a short prompt-engineering overview. The authors study productivity, quality, and where AI's abilities end. They call that boundary the jagged technological frontier: AI handles some tasks well but struggles with others that look equally hard. Keep that picture in mind, because the results split exactly along that line.",
    ref: REFS.a2,
  },
  s3: {
    title: "AI Can Improve Productivity, but Has Limits",
    kicker: "Article 2  |  Key findings",
    chartTitle: "Percentage change for consultants using AI (tasks within the frontier)",
    chart: {
      labels: ["Tasks completed", "Task speed", "Quality", "Below-average", "Above-average"],
      values: [12.2, 25.1, 40, 43, 17],
    },
    chartNote: "Quality is reported as \"more than 40%\" higher than the control group; the bar is plotted at 40. Below-/above-average rows are performer groups, each improving against its own baseline score.",
    outsideHead: "Outside the frontier",
    outsideStat: "−19",
    outsideUnit: "percentage points",
    outsideBody: "For a task selected to be outside the frontier, AI users were 19 percentage points less likely to produce correct solutions than consultants without AI.",
    unitNote: "Percentage change (e.g. +12.2%) compares to a baseline. Percentage points (−19) is the gap between two success rates.",
    approachHead: "Two successful patterns of AI use",
    approaches: [
      { icon: "FiGitBranch", head: "Centaurs", body: "Divide tasks between humans and AI, delegating sub-tasks to whichever is better suited." },
      { icon: "FiRefreshCw", head: "Cyborgs", body: "Integrate AI continuously into the workflow, moving back and forth with the tool." },
    ],
    bridge: "Does this hold outside the office, for real small businesses?",
    notes: "Inside the frontier the gains were large: 12.2% more tasks completed, 25.1% faster, and more than 40% higher quality than the control group. Below-average performers improved by 43% and above-average performers by 17%, each against their own baseline. But for a task chosen to sit outside the frontier, AI users were 19 percentage points less likely to produce a correct solution. Note the unit: that is a gap between two success rates, not a percentage change. The consultants who did well used AI in two ways: Centaurs divided tasks between themselves and the AI, and Cyborgs wove AI into every step. The office result is clear. The next study asks whether it survives contact with a real business.",
    ref: REFS.a2,
  },
  s4: {
    title: "The Uneven Impact of Generative AI on Entrepreneurial Performance",
    kicker: "Article 5  |  Research purpose and findings",
    byline: "Nicholas G. Otis et al.  |  Management Science, Vol. 72, No. 7, 2026  |  DOI 10.1287/mnsc.2024.06909",
    facts: [
      { icon: "FiMapPin", head: "Setting", body: "Field experiment with small-business entrepreneurs in Kenya" },
      { icon: "FiMessageSquare", head: "Intervention", body: "Access to a GPT-4-powered AI business assistant that gave business advice" },
      { icon: "FiDollarSign", head: "Outcomes examined", body: "Small-business revenue and profit" },
    ],
    mainHead: "Average effect",
    mainBody: "The researchers could not reject the null hypothesis of no average treatment effect on revenue and profits.",
    subHead: "Subgroup results by baseline performance",
    bars: [
      { label: "Low performers at baseline", text: "nearly 10% worse", value: -10 },
      { label: "High performers at baseline", text: "may have benefited by more than 15%", value: 15 },
    ],
    barNote: "Bar lengths are illustrative of the reported figures",
    mechanism: "The difference did not appear to result from differences in the questions asked or the AI advice given, but from the advice entrepreneurs chose to implement.",
    caution: "Caution: these are subgroup averages. They do not show that every high-performing entrepreneur benefits or that every low-performing entrepreneur loses.",
    bridge: "Two studies, one lesson: what do they tell us together?",
    notes: "Article 5 moves from consultants to entrepreneurs in Kenya. Half of the small-business owners received a GPT-4-powered business assistant that gave advice; the outcomes were revenue and profit. On average, the researchers could not reject the null hypothesis of no treatment effect. But the average hides two stories. Entrepreneurs who were low performers at baseline did nearly 10% worse with the assistant, while high performers may have benefited by more than 15%. The questions and the AI advice were similar; the difference lay in which advice the entrepreneurs chose to implement. I want to be careful here: these are subgroup averages, not a rule for every individual.",
    ref: REFS.a5,
  },
  s5: {
    title: "AI Is a Tool, Not a Guarantee of Success",
    kicker: "Discussion and comparison",
    tableHead: ["", "Article 2  |  Dell'Acqua et al. (2023)", "Article 5  |  Otis et al. (2026)"],
    rows: [
      ["Focus", "Knowledge workers and consultants (BCG)", "Entrepreneurs in Kenya"],
      ["Main result", "Higher productivity and work quality for tasks within AI's capability frontier", "No established average treatment effect on revenue and profits"],
      ["Key limitation or insight", "Reduced correctness on a task outside that frontier", "Outcomes differed by baseline performance and by which AI recommendations were implemented"],
    ],
    conclusionHead: "Conclusion",
    conclusion: "AI can influence real-world performance, but its impact depends on task suitability, user behavior, and human judgment.",
    takeaways: ["Match the task to what AI does well", "Evaluate AI advice critically before acting", "Keep human judgment in the loop"],
    closing: "Thank you. Questions are welcome.",
    notes: "Put the two studies side by side. Article 2 shows higher productivity and quality for knowledge work inside AI's frontier, and lower correctness outside it. Article 5 shows no established average effect on revenue and profit, with outcomes that depended on baseline performance and on which recommendations were implemented. The common thread is the human in the loop. AI can influence real performance, but the impact depends on task suitability, user behavior and human judgment. That is why I framed the title as AI being a tool, not a guarantee of success. Thank you, and I welcome your questions.",
    refs: [SHORT_REFS],
  },
};

const TH = {
  tags: { finding: "ผลการวิจัย (รายงานในบทความ)", interp: "การตีความ", concept: "แนวคิด" },
  footer: "Chayanun Sungsa-ard  |  691401708  |  MBA  |  ENG 501",
  steps: ["บทนำ", "บทความ 2: วิธีวิจัย", "บทความ 2: ผลการศึกษา", "บทความ 5: ผู้ประกอบการ", "อภิปรายผล"],
  nextLabel: "ถัดไป",
  s1: {
    title: "ปัญญาประดิษฐ์กับประสิทธิภาพการทำงาน",
    subtitle: "หลักฐานจากการทดลองภาคสนามสองชิ้นล่าสุด",
    question: "คำถามหลัก: AI ส่งผลต่อผลิตภาพ คุณภาพงาน และผลการดำเนินธุรกิจอย่างไร?",
    articles: [
      { label: "บทความที่ 2", title: "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality", meta: "Fabrizio Dell'Acqua et al.  |  Harvard Business School Working Paper 24-013, 2023" },
      { label: "บทความที่ 5", title: "The Uneven Impact of Generative Artificial Intelligence on Entrepreneurial Performance: Evidence from a Field Experiment in Kenya", meta: "Nicholas G. Otis et al.  |  Management Science, Vol. 72, No. 7, 2026  |  DOI 10.1287/mnsc.2024.06909" },
    ],
    roadmapHead: "ลำดับการนำเสนอ",
    notes: "สวัสดีครับ วันนี้ผมจะตอบคำถามเดียวคือ AI ส่งผลต่อผลิตภาพ คุณภาพงาน และผลการดำเนินธุรกิจอย่างไร โดยใช้การทดลองภาคสนามสองชิ้น บทความที่ 2 ศึกษาที่ปรึกษาของ BCG ที่ใช้ GPT-4 ส่วนบทความที่ 5 ศึกษาผู้ประกอบการรายย่อยในเคนยาที่ได้รับผู้ช่วยธุรกิจ GPT-4 เราจะเริ่มจากในสำนักงาน ไปสู่ตลาดจริง แล้วสรุปสิ่งที่สองงานบอกเราร่วมกัน",
  },
  s2: {
    title: "การนำทางในพรมแดนเทคโนโลยีที่ไม่สม่ำเสมอ",
    kicker: "บทความที่ 2  |  วัตถุประสงค์และวิธีวิจัย",
    byline: "Fabrizio Dell'Acqua et al.  |  Harvard Business School Working Paper 24-013, 2023",
    facts: [
      { icon: "FiBriefcase", head: "องค์กรที่ร่วมวิจัย", body: "การทดลองภาคสนามร่วมกับ Boston Consulting Group (BCG)" },
      { icon: "FiUsers", head: "ผู้เข้าร่วม", body: "ที่ปรึกษาจำนวน 758 คน" },
      { icon: "FiTarget", head: "ประเด็นที่ศึกษา", body: "ผลิตภาพ คุณภาพงาน และขอบเขตความสามารถของ AI" },
    ],
    condHead: "เงื่อนไขการทดลองสามกลุ่ม",
    conditions: ["ไม่สามารถใช้ AI", "ใช้ GPT-4 ได้", "ใช้ GPT-4 ได้ พร้อมคำแนะนำการเขียน prompt"],
    conceptHead: "\"Jagged Technological Frontier\"",
    conceptBody: "AI ทำงานบางอย่างได้ดี แต่กลับทำงานอื่นที่ดูยากพอกันได้ไม่ดี เส้นแบ่งนี้ไม่สม่ำเสมอ ผู้ใช้จึงไม่ควรสรุปว่างานใด \"ปลอดภัย\" ที่จะมอบให้ AI เพียงเพราะงานนั้นดูง่าย",
    diagram: { inside: "ภายในพรมแดน: AI ทำได้ดี", outside: "ภายนอกพรมแดน: AI ทำได้ไม่ดี", axis: "งานที่ดูยากในระดับใกล้เคียงกัน" },
    bridge: "แล้วเมื่อที่ปรึกษา 758 คนใช้ GPT-4 จริง เกิดอะไรขึ้น?",
    notes: "บทความที่ 2 เป็นการทดลองภาคสนามร่วมกับ Boston Consulting Group ที่ปรึกษา 758 คนถูกสุ่มเข้าสามกลุ่ม คือไม่ใช้ AI ใช้ GPT-4 และใช้ GPT-4 พร้อมคำแนะนำการเขียน prompt ผู้วิจัยศึกษาผลิตภาพ คุณภาพ และจุดที่ความสามารถของ AI สิ้นสุด ซึ่งเรียกว่า jagged technological frontier คือ AI ทำงานบางอย่างได้ดี แต่ทำงานอื่นที่ดูยากพอกันได้ไม่ดี ขอให้จำภาพนี้ไว้ เพราะผลการศึกษาแยกตามเส้นนี้พอดี",
    ref: REFS.a2,
  },
  s3: {
    title: "AI ช่วยเพิ่มประสิทธิภาพ แต่มีข้อจำกัด",
    kicker: "บทความที่ 2  |  ผลการศึกษาที่สำคัญ",
    chartTitle: "ร้อยละการเปลี่ยนแปลงของที่ปรึกษาที่ใช้ AI (งานภายในพรมแดน)",
    chart: {
      labels: ["งานที่ทำเสร็จ", "ความเร็วในการทำงาน", "คุณภาพเทียบกลุ่มควบคุม", "กลุ่มผลงานต่ำกว่าค่าเฉลี่ย", "กลุ่มผลงานสูงกว่าค่าเฉลี่ย"],
      values: [12.2, 25.1, 40, 43, 17],
    },
    chartNote: "คุณภาพรายงานว่าสูงขึ้น \"มากกว่า 40%\" แท่งกราฟจึงแสดงที่ 40 ส่วนตัวเลขของแต่ละกลุ่มคือการพัฒนาเทียบกับคะแนนเดิมของกลุ่มนั้นเอง",
    outsideHead: "งานภายนอกพรมแดน",
    outsideStat: "−19",
    outsideUnit: "จุดร้อยละ (percentage points)",
    outsideBody: "สำหรับงานที่เลือกให้อยู่นอกพรมแดน ผู้ใช้ AI มีโอกาสได้คำตอบที่ถูกต้องน้อยกว่าผู้ไม่ใช้ AI อยู่ 19 จุดร้อยละ",
    unitNote: "ร้อยละการเปลี่ยนแปลง (เช่น +12.2%) เทียบกับค่าฐานเดิม ส่วนจุดร้อยละ (−19) คือส่วนต่างระหว่างอัตราความถูกต้องของสองกลุ่ม",
    approachHead: "รูปแบบการใช้ AI ที่ประสบความสำเร็จสองแบบ",
    approaches: [
      { icon: "FiGitBranch", head: "Centaurs (เซนทอร์)", body: "แบ่งงานระหว่างคนกับ AI โดยมอบงานย่อยให้ฝ่ายที่เหมาะสมกว่า" },
      { icon: "FiRefreshCw", head: "Cyborgs (ไซบอร์ก)", body: "ผสาน AI เข้ากับขั้นตอนการทำงานอย่างต่อเนื่อง สลับไปมากับเครื่องมือตลอดเวลา" },
    ],
    bridge: "ผลแบบนี้จะยังเป็นจริงนอกสำนักงาน กับธุรกิจขนาดเล็กจริงหรือไม่?",
    notes: "ภายในพรมแดน ผลดีมีขนาดใหญ่ คือทำงานเสร็จเพิ่มขึ้น 12.2% เร็วขึ้น 25.1% และคุณภาพสูงกว่ากลุ่มควบคุมมากกว่า 40% กลุ่มผลงานต่ำกว่าค่าเฉลี่ยดีขึ้น 43% กลุ่มสูงกว่าค่าเฉลี่ยดีขึ้น 17% เทียบกับคะแนนเดิมของตนเอง แต่สำหรับงานที่เลือกให้อยู่นอกพรมแดน ผู้ใช้ AI มีโอกาสได้คำตอบถูกน้อยกว่า 19 จุดร้อยละ สังเกตหน่วยด้วยครับ นี่คือส่วนต่างของอัตราความถูกต้อง ไม่ใช่ร้อยละการเปลี่ยนแปลง ที่ปรึกษาที่ทำได้ดีใช้ AI สองแบบ คือ Centaurs ที่แบ่งงานระหว่างตัวเองกับ AI และ Cyborgs ที่ผสาน AI เข้าไปทุกขั้นตอน ผลในสำนักงานชัดเจน งานถัดไปถามว่าผลนี้จะอยู่รอดเมื่อเจอธุรกิจจริงหรือไม่",
    ref: REFS.a2,
  },
  s4: {
    title: "ผลกระทบของ AI ต่อผู้ประกอบการที่แตกต่างกัน",
    kicker: "บทความที่ 5  |  วัตถุประสงค์และผลการศึกษา",
    byline: "Nicholas G. Otis et al.  |  Management Science, Vol. 72, No. 7, 2026  |  DOI 10.1287/mnsc.2024.06909",
    facts: [
      { icon: "FiMapPin", head: "บริบทการศึกษา", body: "การทดลองภาคสนามกับผู้ประกอบการธุรกิจขนาดเล็กในประเทศเคนยา" },
      { icon: "FiMessageSquare", head: "สิ่งที่ทดลอง", body: "การเข้าถึงผู้ช่วยธุรกิจ AI ที่ขับเคลื่อนด้วย GPT-4 ซึ่งให้คำแนะนำทางธุรกิจ" },
      { icon: "FiDollarSign", head: "ตัวแปรผลลัพธ์", body: "รายได้และกำไรของธุรกิจขนาดเล็ก" },
    ],
    mainHead: "ผลโดยเฉลี่ย",
    mainBody: "ผู้วิจัยไม่สามารถปฏิเสธสมมติฐานว่าง (null hypothesis) ที่ว่าไม่มีผลเฉลี่ยของการทดลองต่อรายได้และกำไร",
    subHead: "ผลแยกตามกลุ่มผลการดำเนินงานตั้งต้น",
    bars: [
      { label: "กลุ่มผลงานต่ำตั้งแต่ต้น", text: "แย่ลงเกือบ 10%", value: -10 },
      { label: "กลุ่มผลงานสูงตั้งแต่ต้น", text: "อาจได้ประโยชน์มากกว่า 15%", value: 15 },
    ],
    barNote: "ความยาวแท่งเป็นเพียงภาพประกอบของตัวเลขที่รายงาน",
    mechanism: "ความแตกต่างนี้ไม่ได้มาจากคำถามที่ถามหรือคำแนะนำที่ AI ให้ แต่มาจากคำแนะนำที่ผู้ประกอบการเลือกนำไปปฏิบัติ",
    caution: "ข้อควรระวัง: ตัวเลขนี้เป็นค่าเฉลี่ยของกลุ่มย่อย ไม่ได้แสดงว่าผู้ประกอบการที่เก่งทุกคนจะได้ประโยชน์ หรือผู้ประกอบการที่อ่อนทุกคนจะเสียประโยชน์",
    bridge: "สองงานวิจัย บทเรียนเดียว: เมื่อมองร่วมกันบอกอะไรเรา?",
    notes: "บทความที่ 5 ย้ายจากที่ปรึกษาไปสู่ผู้ประกอบการในเคนยา เจ้าของธุรกิจขนาดเล็กครึ่งหนึ่งได้รับผู้ช่วยธุรกิจที่ขับเคลื่อนด้วย GPT-4 ซึ่งให้คำแนะนำ ตัวแปรผลลัพธ์คือรายได้และกำไร โดยเฉลี่ยผู้วิจัยไม่สามารถปฏิเสธสมมติฐานว่างที่ว่าไม่มีผลของการทดลอง แต่ค่าเฉลี่ยซ่อนสองเรื่องไว้ ผู้ประกอบการที่ผลงานต่ำตั้งแต่ต้นแย่ลงเกือบ 10% ขณะที่กลุ่มผลงานสูงอาจได้ประโยชน์มากกว่า 15% คำถามและคำแนะนำของ AI ใกล้เคียงกัน ความต่างอยู่ที่คำแนะนำที่ผู้ประกอบการเลือกนำไปปฏิบัติ ขอย้ำว่านี่คือค่าเฉลี่ยของกลุ่มย่อย ไม่ใช่กฎสำหรับทุกคน",
    ref: REFS.a5,
  },
  s5: {
    title: "AI เป็นเครื่องมือ ไม่ใช่หลักประกันความสำเร็จ",
    kicker: "อภิปรายผลและเปรียบเทียบ",
    tableHead: ["", "บทความที่ 2  |  Dell'Acqua et al. (2023)", "บทความที่ 5  |  Otis et al. (2026)"],
    rows: [
      ["กลุ่มที่ศึกษา", "พนักงานความรู้และที่ปรึกษา (BCG)", "ผู้ประกอบการในประเทศเคนยา"],
      ["ผลหลัก", "ผลิตภาพและคุณภาพงานสูงขึ้นสำหรับงานภายในพรมแดนความสามารถของ AI", "ไม่พบผลเฉลี่ยของการทดลองต่อรายได้และกำไรอย่างชัดเจน"],
      ["ข้อจำกัดหรือข้อค้นพบสำคัญ", "ความถูกต้องลดลงในงานที่อยู่นอกพรมแดนนั้น", "ผลลัพธ์ต่างกันตามผลการดำเนินงานตั้งต้น และตามคำแนะนำของ AI ที่เลือกนำไปปฏิบัติ"],
    ],
    conclusionHead: "บทสรุป",
    conclusion: "AI ส่งผลต่อผลการทำงานจริงได้ แต่ผลกระทบขึ้นอยู่กับความเหมาะสมของงาน พฤติกรรมของผู้ใช้ และวิจารณญาณของมนุษย์",
    takeaways: ["เลือกงานให้เหมาะกับสิ่งที่ AI ทำได้ดี", "ประเมินคำแนะนำของ AI อย่างมีวิจารณญาณก่อนนำไปใช้", "ให้มนุษย์เป็นผู้ตัดสินใจขั้นสุดท้าย"],
    closing: "ขอบคุณครับ ยินดีรับคำถาม",
    notes: "เมื่อวางสองงานเคียงกัน บทความที่ 2 แสดงว่าผลิตภาพและคุณภาพของงานความรู้สูงขึ้นภายในพรมแดนของ AI แต่ความถูกต้องลดลงนอกพรมแดน บทความที่ 5 ไม่พบผลเฉลี่ยต่อรายได้และกำไรอย่างชัดเจน และผลลัพธ์ขึ้นกับผลงานตั้งต้นและคำแนะนำที่เลือกนำไปใช้ จุดร่วมคือมนุษย์ที่อยู่ในกระบวนการ AI ส่งผลต่อผลการทำงานจริงได้ แต่ขึ้นอยู่กับความเหมาะสมของงาน พฤติกรรมของผู้ใช้ และวิจารณญาณของมนุษย์ นี่คือเหตุผลที่ผมตั้งชื่อว่า AI เป็นเครื่องมือ ไม่ใช่หลักประกันความสำเร็จ ขอบคุณครับ ยินดีรับคำถาม",
    refs: [SHORT_REFS],
  },
};

module.exports = { EN, TH, REFS, PRESENTER };
