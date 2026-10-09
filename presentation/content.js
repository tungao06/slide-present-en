// ---------------------------------------------------------------------------
// SLIDE CONTENT ONLY (lean version). Styling and layout live in build.js.
// Numbers are quoted verbatim from the two source articles (see REFS).
// ---------------------------------------------------------------------------
const REFS = {
  a2: "Dell'Acqua, F., et al. (2023). Navigating the Jagged Technological Frontier. Harvard Business School Working Paper 24-013.",
  a5: "Otis, N. G., et al. (2026). The Uneven Impact of Generative AI on Entrepreneurial Performance. Management Science, 72(7). doi.org/10.1287/mnsc.2024.06909",
};
const SHORT_REFS = "Dell'Acqua et al. (2023), HBS Working Paper 24-013   ·   Otis et al. (2026), Management Science 72(7), doi.org/10.1287/mnsc.2024.06909";

const PRESENTER = {
  en: { name: "Chayanun Sungsa-ard", id: "Student ID 691401708", degree: "MBA", course: "ENG 501 English for Master's Degree" },
  th: { name: "Chayanun Sungsa-ard", id: "รหัสนักศึกษา 691401708", degree: "MBA", course: "ENG 501 English for Master's Degree" },
};

const EN = {
  tags: { finding: "FINDING", interp: "INTERPRETATION", concept: "CONCEPT" },
  footer: "Chayanun Sungsa-ard  ·  691401708  ·  MBA  ·  ENG 501",
  steps: ["Introduction", "Article 2: Method", "Article 2: Findings", "Article 5: Entrepreneurs", "Discussion"],
  nextLabel: "Next",
  s1: {
    title: "Artificial Intelligence and Work Performance",
    subtitle: "Evidence from two recent field experiments",
    question: "How does AI affect productivity, work quality, and business performance?",
    articles: [
      { label: "Article 2", title: "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality", meta: "Fabrizio Dell'Acqua et al.  ·  Harvard Business School Working Paper 24-013, 2023" },
      { label: "Article 5", title: "The Uneven Impact of Generative Artificial Intelligence on Entrepreneurial Performance: Evidence from a Field Experiment in Kenya", meta: "Nicholas G. Otis et al.  ·  Management Science, Vol. 72, No. 7, 2026  ·  DOI 10.1287/mnsc.2024.06909" },
    ],
    roadmapHead: "Today's path",
    notes: "Good morning. Today I will look at one question: how does AI affect productivity, work quality and business performance? I will use two recent field experiments. Article 2 studies consultants at BCG working with GPT-4. Article 5 studies small-business entrepreneurs in Kenya who received a GPT-4 business assistant. First the office, then the marketplace, and finally what the two studies tell us together.",
  },
  s2: {
    title: "Navigating the Jagged Technological Frontier",
    kicker: "Article 2  ·  Research purpose and method",
    facts: [
      { icon: "FiBriefcase", head: "Partner", body: "Field experiment with Boston Consulting Group (BCG)" },
      { icon: "FiUsers", head: "Participants", body: "758 consultants" },
      { icon: "FiTarget", head: "Focus", body: "Productivity, work quality, and the limits of AI" },
    ],
    condHead: "Three experimental conditions",
    conditions: ["No AI access", "GPT-4 access", "GPT-4 + prompt engineering guidance"],
    conceptHead: "The Jagged Technological Frontier",
    conceptBody: "AI performs some tasks well yet struggles with others that look equally difficult. The boundary is uneven and hard to see.",
    diagram: { inside: "Inside: AI performs well", outside: "Outside: AI struggles" },
    bridge: "What happened when 758 consultants used GPT-4?",
    notes: "Article 2 is a field experiment run with Boston Consulting Group. 758 consultants were randomly assigned to one of three conditions: no AI, GPT-4, or GPT-4 plus a short prompt-engineering overview. The authors study productivity, quality, and where AI's abilities end. They call that boundary the jagged technological frontier: AI handles some tasks well but struggles with others that look equally hard. Keep that picture in mind, because the results split exactly along that line.",
    ref: REFS.a2,
  },
  s3: {
    title: "AI Can Improve Productivity, but Has Limits",
    kicker: "Article 2  ·  Key findings",
    chartTitle: "Change for consultants using AI, tasks inside the frontier",
    chart: { labels: ["Tasks completed", "Task speed", "Quality", "Below-average", "Above-average"], values: [12.2, 25.1, 40, 43, 17] },
    chartNote: "Quality reported as \"more than 40%\" vs. control, plotted at 40. Below-/above-average = performer groups, each vs. its own baseline.",
    outsideHead: "Outside the frontier",
    outsideStat: "−19",
    outsideUnit: "percentage points",
    outsideBody: "AI users were 19 percentage points less likely to produce correct solutions than consultants without AI.",
    unitNote: "A gap between two success rates, not a percentage change.",
    approachHead: "Two successful patterns of AI use",
    approaches: [
      { head: "Centaurs", body: "divide tasks between human and AI" },
      { head: "Cyborgs", body: "integrate AI into every step" },
    ],
    bridge: "Does this hold for real small businesses?",
    notes: "Inside the frontier the gains were large: 12.2% more tasks completed, 25.1% faster, and more than 40% higher quality than the control group. Below-average performers improved by 43% and above-average performers by 17%, each against their own baseline. But for a task chosen to sit outside the frontier, AI users were 19 percentage points less likely to produce a correct solution. Note the unit: that is a gap between two success rates, not a percentage change. The consultants who did well used AI in two ways: Centaurs divided tasks between themselves and the AI, and Cyborgs wove AI into every step. The office result is clear. The next study asks whether it survives contact with a real business.",
    ref: REFS.a2,
  },
  s4: {
    title: "The Uneven Impact of Generative AI on Entrepreneurial Performance",
    kicker: "Article 5  ·  Research purpose and findings",
    facts: [
      { icon: "FiMapPin", head: "Setting", body: "Small-business entrepreneurs in Kenya" },
      { icon: "FiMessageSquare", head: "Intervention", body: "GPT-4-powered AI business assistant giving business advice" },
      { icon: "FiDollarSign", head: "Outcomes", body: "Revenue and profit" },
    ],
    mainHead: "Average effect",
    mainBody: "The null hypothesis of no average treatment effect on revenue and profits could not be rejected.",
    subHead: "By baseline performance",
    bars: [
      { label: "Low performers", text: "nearly 10% worse", value: -10 },
      { label: "High performers", text: "may have benefited by more than 15%", value: 15 },
    ],
    barNote: "Bar lengths are illustrative",
    mechanism: "Similar questions, similar advice. The difference lay in which advice entrepreneurs chose to implement.",
    caution: "Subgroup averages only: not every high performer gains, and not every low performer loses.",
    bridge: "Two studies, one lesson",
    notes: "Article 5 moves from consultants to entrepreneurs in Kenya. Half of the small-business owners received a GPT-4-powered business assistant that gave advice; the outcomes were revenue and profit. On average, the researchers could not reject the null hypothesis of no treatment effect. But the average hides two stories. Entrepreneurs who were low performers at baseline did nearly 10% worse with the assistant, while high performers may have benefited by more than 15%. The questions and the AI advice were similar; the difference lay in which advice the entrepreneurs chose to implement. I want to be careful here: these are subgroup averages, not a rule for every individual.",
    ref: REFS.a5,
  },
  s5: {
    title: "AI Is a Tool, Not a Guarantee of Success",
    kicker: "Discussion and comparison",
    tableHead: ["", "Article 2  ·  Consultants", "Article 5  ·  Entrepreneurs"],
    rows: [
      ["Focus", "Knowledge workers at BCG", "Small businesses in Kenya"],
      ["Main result", "Higher productivity and quality inside AI's capability frontier", "No established average effect on revenue and profit"],
      ["Key insight", "Lower correctness on a task outside the frontier", "Outcomes depended on baseline performance and the advice implemented"],
    ],
    conclusionHead: "Conclusion",
    conclusion: "AI can influence real-world performance, but its impact depends on task suitability, user behavior, and human judgment.",
    takeaways: ["Match the task to AI's strengths", "Evaluate AI advice critically", "Keep human judgment in the loop"],
    closing: "Thank you. Questions are welcome.",
    notes: "Put the two studies side by side. Article 2 shows higher productivity and quality for knowledge work inside AI's frontier, and lower correctness outside it. Article 5 shows no established average effect on revenue and profit, with outcomes that depended on baseline performance and on which recommendations were implemented. The common thread is the human in the loop. AI can influence real performance, but the impact depends on task suitability, user behavior and human judgment. That is why I framed the title as AI being a tool, not a guarantee of success. Thank you, and I welcome your questions.",
    refs: [SHORT_REFS],
  },
};

const TH = {
  tags: { finding: "ผลการวิจัย", interp: "การตีความ", concept: "แนวคิด" },
  footer: "Chayanun Sungsa-ard  ·  691401708  ·  MBA  ·  ENG 501",
  steps: ["บทนำ", "บทความ 2: วิธีวิจัย", "บทความ 2: ผลการศึกษา", "บทความ 5: ผู้ประกอบการ", "อภิปรายผล"],
  nextLabel: "ถัดไป",
  s1: {
    title: "ปัญญาประดิษฐ์กับประสิทธิภาพการทำงาน",
    subtitle: "หลักฐานจากการทดลองภาคสนามสองชิ้นล่าสุด",
    question: "AI ส่งผลต่อผลิตภาพ คุณภาพงาน และผลการดำเนินธุรกิจอย่างไร?",
    articles: [
      { label: "บทความที่ 2", title: "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality", meta: "Fabrizio Dell'Acqua et al.  ·  Harvard Business School Working Paper 24-013, 2023" },
      { label: "บทความที่ 5", title: "The Uneven Impact of Generative Artificial Intelligence on Entrepreneurial Performance: Evidence from a Field Experiment in Kenya", meta: "Nicholas G. Otis et al.  ·  Management Science, Vol. 72, No. 7, 2026  ·  DOI 10.1287/mnsc.2024.06909" },
    ],
    roadmapHead: "ลำดับการนำเสนอ",
    notes: "สวัสดีครับ วันนี้ผมจะตอบคำถามเดียวคือ AI ส่งผลต่อผลิตภาพ คุณภาพงาน และผลการดำเนินธุรกิจอย่างไร โดยใช้การทดลองภาคสนามสองชิ้น บทความที่ 2 ศึกษาที่ปรึกษาของ BCG ที่ใช้ GPT-4 ส่วนบทความที่ 5 ศึกษาผู้ประกอบการรายย่อยในเคนยาที่ได้รับผู้ช่วยธุรกิจ GPT-4 เราจะเริ่มจากในสำนักงาน ไปสู่ตลาดจริง แล้วสรุปสิ่งที่สองงานบอกเราร่วมกัน",
  },
  s2: {
    title: "การนำทางในพรมแดนเทคโนโลยีที่ไม่สม่ำเสมอ",
    kicker: "บทความที่ 2  ·  วัตถุประสงค์และวิธีวิจัย",
    facts: [
      { icon: "FiBriefcase", head: "องค์กรที่ร่วมวิจัย", body: "การทดลองภาคสนามร่วมกับ Boston Consulting Group (BCG)" },
      { icon: "FiUsers", head: "ผู้เข้าร่วม", body: "ที่ปรึกษา 758 คน" },
      { icon: "FiTarget", head: "ประเด็นที่ศึกษา", body: "ผลิตภาพ คุณภาพงาน และขอบเขตความสามารถของ AI" },
    ],
    condHead: "เงื่อนไขการทดลองสามกลุ่ม",
    conditions: ["ไม่ใช้ AI", "ใช้ GPT-4", "ใช้ GPT-4 + คำแนะนำการเขียน prompt"],
    conceptHead: "Jagged Technological Frontier",
    conceptBody: "AI ทำงานบางอย่างได้ดี แต่ทำงานอื่นที่ดูยากพอกันได้ไม่ดี เส้นแบ่งนี้ไม่สม่ำเสมอและมองเห็นได้ยาก",
    diagram: { inside: "ภายใน: AI ทำได้ดี", outside: "ภายนอก: AI ทำได้ไม่ดี" },
    bridge: "เมื่อที่ปรึกษา 758 คนใช้ GPT-4 จริง เกิดอะไรขึ้น?",
    notes: "บทความที่ 2 เป็นการทดลองภาคสนามร่วมกับ Boston Consulting Group ที่ปรึกษา 758 คนถูกสุ่มเข้าสามกลุ่ม คือไม่ใช้ AI ใช้ GPT-4 และใช้ GPT-4 พร้อมคำแนะนำการเขียน prompt ผู้วิจัยศึกษาผลิตภาพ คุณภาพ และจุดที่ความสามารถของ AI สิ้นสุด ซึ่งเรียกว่า jagged technological frontier คือ AI ทำงานบางอย่างได้ดี แต่ทำงานอื่นที่ดูยากพอกันได้ไม่ดี ขอให้จำภาพนี้ไว้ เพราะผลการศึกษาแยกตามเส้นนี้พอดี",
    ref: REFS.a2,
  },
  s3: {
    title: "AI ช่วยเพิ่มประสิทธิภาพ แต่มีข้อจำกัด",
    kicker: "บทความที่ 2  ·  ผลการศึกษาที่สำคัญ",
    chartTitle: "การเปลี่ยนแปลงของที่ปรึกษาที่ใช้ AI ในงานภายในพรมแดน",
    chart: { labels: ["งานที่ทำเสร็จ", "ความเร็ว", "คุณภาพ", "กลุ่มต่ำกว่าค่าเฉลี่ย", "กลุ่มสูงกว่าค่าเฉลี่ย"], values: [12.2, 25.1, 40, 43, 17] },
    chartNote: "คุณภาพรายงานว่า \"มากกว่า 40%\" เทียบกลุ่มควบคุม แสดงที่ 40 ส่วนกลุ่มต่ำ/สูงกว่าค่าเฉลี่ยคือการพัฒนาเทียบคะแนนเดิมของกลุ่มนั้น",
    outsideHead: "งานภายนอกพรมแดน",
    outsideStat: "−19",
    outsideUnit: "จุดร้อยละ (percentage points)",
    outsideBody: "ผู้ใช้ AI มีโอกาสได้คำตอบที่ถูกต้องน้อยกว่าผู้ไม่ใช้ AI อยู่ 19 จุดร้อยละ",
    unitNote: "คือส่วนต่างของอัตราความถูกต้องสองกลุ่ม ไม่ใช่ร้อยละการเปลี่ยนแปลง",
    approachHead: "รูปแบบการใช้ AI ที่ประสบความสำเร็จสองแบบ",
    approaches: [
      { head: "Centaurs (เซนทอร์)", body: "แบ่งงานระหว่างคนกับ AI" },
      { head: "Cyborgs (ไซบอร์ก)", body: "ผสาน AI เข้าไปในทุกขั้นตอน" },
    ],
    bridge: "ผลแบบนี้จะเป็นจริงกับธุรกิจขนาดเล็กจริงหรือไม่?",
    notes: "ภายในพรมแดน ผลดีมีขนาดใหญ่ คือทำงานเสร็จเพิ่มขึ้น 12.2% เร็วขึ้น 25.1% และคุณภาพสูงกว่ากลุ่มควบคุมมากกว่า 40% กลุ่มผลงานต่ำกว่าค่าเฉลี่ยดีขึ้น 43% กลุ่มสูงกว่าค่าเฉลี่ยดีขึ้น 17% เทียบกับคะแนนเดิมของตนเอง แต่สำหรับงานที่เลือกให้อยู่นอกพรมแดน ผู้ใช้ AI มีโอกาสได้คำตอบถูกน้อยกว่า 19 จุดร้อยละ สังเกตหน่วยด้วยครับ นี่คือส่วนต่างของอัตราความถูกต้อง ไม่ใช่ร้อยละการเปลี่ยนแปลง ที่ปรึกษาที่ทำได้ดีใช้ AI สองแบบ คือ Centaurs ที่แบ่งงานระหว่างตัวเองกับ AI และ Cyborgs ที่ผสาน AI เข้าไปทุกขั้นตอน ผลในสำนักงานชัดเจน งานถัดไปถามว่าผลนี้จะอยู่รอดเมื่อเจอธุรกิจจริงหรือไม่",
    ref: REFS.a2,
  },
  s4: {
    title: "ผลกระทบของ AI ต่อผู้ประกอบการที่แตกต่างกัน",
    kicker: "บทความที่ 5  ·  วัตถุประสงค์และผลการศึกษา",
    facts: [
      { icon: "FiMapPin", head: "บริบท", body: "ผู้ประกอบการธุรกิจขนาดเล็กในประเทศเคนยา" },
      { icon: "FiMessageSquare", head: "สิ่งที่ทดลอง", body: "ผู้ช่วยธุรกิจ AI ที่ขับเคลื่อนด้วย GPT-4 ให้คำแนะนำทางธุรกิจ" },
      { icon: "FiDollarSign", head: "ตัวแปรผลลัพธ์", body: "รายได้และกำไร" },
    ],
    mainHead: "ผลโดยเฉลี่ย",
    mainBody: "ไม่สามารถปฏิเสธสมมติฐานว่าง (null hypothesis) ที่ว่าไม่มีผลเฉลี่ยต่อรายได้และกำไร",
    subHead: "แยกตามผลงานตั้งต้น",
    bars: [
      { label: "กลุ่มผลงานต่ำ", text: "แย่ลงเกือบ 10%", value: -10 },
      { label: "กลุ่มผลงานสูง", text: "อาจได้ประโยชน์มากกว่า 15%", value: 15 },
    ],
    barNote: "ความยาวแท่งเป็นเพียงภาพประกอบ",
    mechanism: "คำถามและคำแนะนำใกล้เคียงกัน ความต่างอยู่ที่คำแนะนำที่ผู้ประกอบการเลือกนำไปปฏิบัติ",
    caution: "เป็นค่าเฉลี่ยของกลุ่มย่อย ไม่ใช่ว่าคนเก่งทุกคนจะได้ประโยชน์ หรือคนอ่อนทุกคนจะเสียประโยชน์",
    bridge: "สองงานวิจัย บทเรียนเดียว",
    notes: "บทความที่ 5 ย้ายจากที่ปรึกษาไปสู่ผู้ประกอบการในเคนยา เจ้าของธุรกิจขนาดเล็กครึ่งหนึ่งได้รับผู้ช่วยธุรกิจที่ขับเคลื่อนด้วย GPT-4 ซึ่งให้คำแนะนำ ตัวแปรผลลัพธ์คือรายได้และกำไร โดยเฉลี่ยผู้วิจัยไม่สามารถปฏิเสธสมมติฐานว่างที่ว่าไม่มีผลของการทดลอง แต่ค่าเฉลี่ยซ่อนสองเรื่องไว้ ผู้ประกอบการที่ผลงานต่ำตั้งแต่ต้นแย่ลงเกือบ 10% ขณะที่กลุ่มผลงานสูงอาจได้ประโยชน์มากกว่า 15% คำถามและคำแนะนำของ AI ใกล้เคียงกัน ความต่างอยู่ที่คำแนะนำที่ผู้ประกอบการเลือกนำไปปฏิบัติ ขอย้ำว่านี่คือค่าเฉลี่ยของกลุ่มย่อย ไม่ใช่กฎสำหรับทุกคน",
    ref: REFS.a5,
  },
  s5: {
    title: "AI เป็นเครื่องมือ ไม่ใช่หลักประกันความสำเร็จ",
    kicker: "อภิปรายผลและเปรียบเทียบ",
    tableHead: ["", "บทความที่ 2  ·  ที่ปรึกษา", "บทความที่ 5  ·  ผู้ประกอบการ"],
    rows: [
      ["กลุ่มที่ศึกษา", "พนักงานความรู้ที่ BCG", "ธุรกิจขนาดเล็กในเคนยา"],
      ["ผลหลัก", "ผลิตภาพและคุณภาพสูงขึ้นภายในพรมแดนความสามารถของ AI", "ไม่พบผลเฉลี่ยต่อรายได้และกำไรอย่างชัดเจน"],
      ["ข้อค้นพบสำคัญ", "ความถูกต้องลดลงในงานนอกพรมแดน", "ผลขึ้นกับผลงานตั้งต้นและคำแนะนำที่เลือกนำไปใช้"],
    ],
    conclusionHead: "บทสรุป",
    conclusion: "AI ส่งผลต่อผลการทำงานจริงได้ แต่ผลกระทบขึ้นอยู่กับความเหมาะสมของงาน พฤติกรรมของผู้ใช้ และวิจารณญาณของมนุษย์",
    takeaways: ["เลือกงานให้ตรงกับจุดแข็งของ AI", "ประเมินคำแนะนำของ AI อย่างมีวิจารณญาณ", "ให้มนุษย์ตัดสินใจขั้นสุดท้าย"],
    closing: "ขอบคุณครับ ยินดีรับคำถาม",
    notes: "เมื่อวางสองงานเคียงกัน บทความที่ 2 แสดงว่าผลิตภาพและคุณภาพของงานความรู้สูงขึ้นภายในพรมแดนของ AI แต่ความถูกต้องลดลงนอกพรมแดน บทความที่ 5 ไม่พบผลเฉลี่ยต่อรายได้และกำไรอย่างชัดเจน และผลลัพธ์ขึ้นกับผลงานตั้งต้นและคำแนะนำที่เลือกนำไปใช้ จุดร่วมคือมนุษย์ที่อยู่ในกระบวนการ AI ส่งผลต่อผลการทำงานจริงได้ แต่ขึ้นอยู่กับความเหมาะสมของงาน พฤติกรรมของผู้ใช้ และวิจารณญาณของมนุษย์ นี่คือเหตุผลที่ผมตั้งชื่อว่า AI เป็นเครื่องมือ ไม่ใช่หลักประกันความสำเร็จ ขอบคุณครับ ยินดีรับคำถาม",
    refs: [SHORT_REFS],
  },
};

module.exports = { EN, TH, REFS, PRESENTER };
