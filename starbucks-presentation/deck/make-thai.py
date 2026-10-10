"""Build the Thai slides (t1..t8) from the English deck files by exact-string translation."""
import re, sys, json, pathlib
ROOT = pathlib.Path(__file__).parent / "project"
SL = ROOT / "slides"

COMMON = [
  # footers / eyebrows / chips
  ("Part 1 · The Foundation &amp; Origin", "ตอนที่ 1 · รากฐานและจุดกำเนิด"),
  ("Part 2 · The Turning Point", "ตอนที่ 2 · จุดเปลี่ยน"),
  ("Part 2 · Concept Development", "ตอนที่ 2 · การพัฒนาแนวคิด"),
  ("Part 3 · Operationalizing Experience", "ตอนที่ 3 · การนำประสบการณ์ไปปฏิบัติจริง"),
  ("Part 3 · Modern Evolution", "ตอนที่ 3 · วิวัฒนาการยุคใหม่"),
  ("Part 4 · Global Impact", "ตอนที่ 4 · ผลกระทบระดับโลก"),
  ("Part 4 · Conclusion &amp; MBA Takeaways", "ตอนที่ 4 · บทสรุปและข้อคิดสำหรับ MBA"),
  ("Part 4 · MBA Lessons", "ตอนที่ 4 · บทเรียนสำหรับ MBA"),
  ("1971 · Pike Place, Seattle", "1971 · ไพก์เพลซ ซีแอตเทิล"),
  ("1983 · The trip to Milan", "1983 · การเดินทางไปมิลาน"),
  (">The Third Place</p>", ">Third Place · บ้านหลังที่สาม</p>"),
  ("Human experience, at scale", "ประสบการณ์แบบมนุษย์ ในสเกลใหญ่"),
  ("The digital Third Place", "บ้านหลังที่สามแบบดิจิทัล"),
  ("Global reach &amp; scale", "การขยายสู่ระดับโลก"),
  ("Lessons for business leaders", "บทเรียนสำหรับผู้นำธุรกิจ"),
  (">Next</p>", ">ถัดไป</p>"),
]
for n in range(1, 9):
  COMMON.append((f"Slide {n} of 8", f"สไลด์ {n} จาก 8"))

T = {
"s1-title": [
  ("MBA Business Class · Group Presentation", "วิชาธุรกิจ MBA · การนำเสนอกลุ่ม"),
  ("Crafting a Global Culture: The Starbucks Storytelling Masterclass", "สร้างวัฒนธรรมระดับโลก: มาสเตอร์คลาสการเล่าเรื่องของสตาร์บัคส์"),
  ("How Narrative, Experience, and Identity Built a Multi-Billion Dollar Empire", "เรื่องเล่า ประสบการณ์ และอัตลักษณ์ สร้างอาณาจักรมูลค่าหลายพันล้านดอลลาร์ได้อย่างไร"),
  ("Origins · 1971", "จุดเริ่มต้น · 1971"),
  ("Pike Place Market, Seattle", "ตลาดไพก์เพลซ ซีแอตเทิล"),
  (">The Product<", ">ผลิตภัณฑ์<"),
  ("Whole-Bean Gourmet Coffee", "กาแฟเมล็ดคั่วระดับกูร์เมต์"),
  (">The Symbol<", ">สัญลักษณ์<"),
  ("The Norse Twin-Tailed Siren", "ไซเรนสองหางจากตำนานนอร์ส"),
  ("Now, let's look at where it all began in <span style=\"color:#CBA258\"><b>1971</b></span>…", "ต่อไป เรามาดูกันว่าทุกอย่างเริ่มต้นที่ไหนในปี <span style=\"color:#CBA258\"><b>1971</b></span>…"),
],
"s2-origin": [
  ("Chapter 1: Coffee Beans &amp; Seattle Roots", "บทที่ 1: เมล็ดกาแฟและรากเหง้าในซีแอตเทิล"),
  ("Before the Lattes: A High-End Bean &amp; Spice Retailer", "ก่อนยุคลาเต้: ร้านค้าปลีกเมล็ดกาแฟและเครื่องเทศระดับไฮเอนด์"),
  ("The Founders &amp; Mission", "ผู้ก่อตั้งและพันธกิจ"),
  (">Founded by<", ">ก่อตั้งโดย<"),
  (">Mission<", ">พันธกิจ<"),
  ("Teach Americans how to brew fine <b>dark-roast coffee</b> at home.", "สอนให้คนอเมริกันชงกาแฟ<b>คั่วเข้ม</b>ชั้นดีได้เองที่บ้าน"),
  ("The Siren Mythos", "ตำนานไซเรน"),
  (">Inspired by<", ">แรงบันดาลใจจาก<"),
  ("A 16th-century Norse woodcut siren", "ภาพแกะไม้ไซเรนนอร์สสมัยศตวรรษที่ 16"),
  ("Seattle's nautical tradition", "ประเพณีการเดินเรือของซีแอตเทิล"),
  ("The irresistible pull of fine coffee", "เสน่ห์ของกาแฟชั้นดีที่ยากจะต้านทาน"),
  ("The stage was set, but Starbucks was still missing its biggest magic ingredient… until <span style=\"color:#D4E9E2\"><b>1983</b></span>, and a trip to <span style=\"color:#D4E9E2\"><b>Milan</b></span>.",
   "เวทีถูกจัดเตรียมไว้แล้ว แต่สตาร์บัคส์ยังขาดส่วนผสมวิเศษที่สำคัญที่สุด… จนกระทั่งปี <span style=\"color:#D4E9E2\"><b>1983</b></span> กับการเดินทางไป<span style=\"color:#D4E9E2\"><b>มิลาน</b></span>"),
],
"s3-milan": [
  ("Chapter 2: The Italian Inspiration", "บทที่ 2: แรงบันดาลใจจากอิตาลี"),
  ("How a Trip to Milan Changed Coffee History", "การเดินทางไปมิลานเปลี่ยนประวัติศาสตร์กาแฟได้อย่างไร"),
  (">The Idea<", ">แนวคิด<"),
  ("The Discovery", "การค้นพบ"),
  ("Howard Schultz visits Milan's espresso bars. He notices they aren't just selling drinks: they serve as vibrant <b>community living rooms</b>.",
   "โฮเวิร์ด ชูลต์ซ ไปเยือนบาร์เอสเพรสโซในมิลาน และสังเกตว่าร้านเหล่านั้นไม่ได้แค่ขายเครื่องดื่ม แต่เป็น<b>ห้องนั่งเล่นของชุมชน</b>ที่มีชีวิตชีวา"),
  ("The Vision", "วิสัยทัศน์"),
  ("America needs an authentic espresso culture built around <b>human connection, speed, and craftsmanship</b>.",
   "อเมริกาต้องการวัฒนธรรมเอสเพรสโซแท้ ๆ ที่สร้างขึ้นจาก<b>การเชื่อมโยงระหว่างผู้คน ความรวดเร็ว และฝีมือ</b>"),
  ("The Acquisition", "การเข้าซื้อกิจการ"),
  ("Schultz buys Starbucks for <span style=\"color:#006241\"><b>$3.8M</b></span>, merging his Il Giornale cafe concept into it to launch the modern coffeehouse era.",
   "ชูลต์ซซื้อสตาร์บัคส์ในราคา <span style=\"color:#006241\"><b>3.8 ล้านดอลลาร์</b></span> และรวมแนวคิดร้าน Il Giornale ของเขาเข้าไป เปิดศักราชร้านกาแฟยุคใหม่"),
  ("Schultz didn't just want to sell coffee; he wanted to create <span style=\"color:#006241\"><b>a new space in human life</b></span>…",
   "ชูลต์ซไม่ได้แค่อยากขายกาแฟ เขาอยากสร้าง<span style=\"color:#006241\"><b>พื้นที่ใหม่ในชีวิตของผู้คน</b></span>…"),
],
"s4-third-place": [
  ("Chapter 3: \"The Third Place\" Framework", "บทที่ 3: กรอบแนวคิด \"บ้านหลังที่สาม\""),
  ("The Core Brand Philosophy", "ปรัชญาหลักของแบรนด์"),
  (">1st Place<", ">ที่หนึ่ง<"), (">Home<", ">บ้าน<"),
  (">2nd Place<", ">ที่สอง<"), (">Work<", ">ที่ทำงาน<"),
  (">3rd Place<", ">ที่สาม<"), (">Starbucks<", ">สตาร์บัคส์<"),
  ("Pillar 1 · The Third Place", "เสาหลักที่ 1 · บ้านหลังที่สาม"),
  ("A comforting, pressure-free sanctuary between home and work.", "ที่พักพิงอันอบอุ่น ปราศจากความกดดัน ระหว่างบ้านกับที่ทำงาน"),
  ("Pillar 2 · Emotional Connection", "เสาหลักที่ 2 · ความผูกพันทางอารมณ์"),
  ("\"We aren't in the coffee business serving people; we're in the people business serving coffee.\"", "\"เราไม่ได้อยู่ในธุรกิจกาแฟที่ให้บริการผู้คน แต่เราอยู่ในธุรกิจผู้คนที่ให้บริการกาแฟ\""),
  (">Howard Schultz<", ">โฮเวิร์ด ชูลต์ซ<"),
  ("Pillar 3 · Atmosphere as a Product", "เสาหลักที่ 3 · บรรยากาศคือผลิตภัณฑ์"),
  ("Warm lighting", "แสงไฟอบอุ่น"), ("Wooden textures", "พื้นผิวไม้"), ("Acoustic music", "ดนตรีอะคูสติก"), ("Welcoming aroma", "กลิ่นหอมชวนต้อนรับ"),
  ("Now that we understand the strategic concept of the Third Place, how did Starbucks <span style=\"color:#D4E9E2\"><b>scale this human experience</b></span> to thousands of stores?",
   "เมื่อเข้าใจแนวคิดเชิงกลยุทธ์ของบ้านหลังที่สามแล้ว สตาร์บัคส์<span style=\"color:#D4E9E2\"><b>ขยายประสบการณ์แบบมนุษย์นี้</b></span>ไปสู่ร้านหลายพันสาขาได้อย่างไร?"),
],
"s5-touchpoints": [
  ("Chapter 4: Storytelling Through Touchpoints", "บทที่ 4: การเล่าเรื่องผ่านจุดสัมผัส"),
  ("Turning Everyday Rituals into Brand Loyalty", "เปลี่ยนกิจวัตรประจำวันให้เป็นความภักดีต่อแบรนด์"),
  ("Touchpoint 1", "จุดสัมผัสที่ 1"), ("Touchpoint 2", "จุดสัมผัสที่ 2"), ("Touchpoint 3", "จุดสัมผัสที่ 3"),
  ("Personalization &amp; Connection", "ความเป็นส่วนตัวและการเชื่อมโยง"),
  ("Customer names on cups, eye-contact barista service, and customizable handcrafted beverages.", "เขียนชื่อลูกค้าบนแก้ว บาริสต้าสบตาขณะให้บริการ และเครื่องดื่มที่ปรับแต่งได้ตามใจ"),
  ("Sensory Consistency", "ความสม่ำเสมอทางประสาทสัมผัส"),
  ("Consistent ambient design, signature scents, and curated music playlists across global stores.", "การออกแบบบรรยากาศ กลิ่นเอกลักษณ์ และเพลย์ลิสต์ที่คัดสรร เหมือนกันทุกสาขาทั่วโลก"),
  ("Community Customization", "ปรับให้เข้ากับชุมชน"),
  ("Store architecture that reflects neighborhood heritage while keeping core brand values.", "สถาปัตยกรรมร้านที่สะท้อนมรดกของย่านนั้น ๆ โดยยังคงคุณค่าหลักของแบรนด์"),
  ("As customer lifestyles changed, Starbucks had to bring \"The Third Place\" into the <span style=\"color:#006241\"><b>digital age</b></span>…",
   "เมื่อไลฟ์สไตล์ของลูกค้าเปลี่ยนไป สตาร์บัคส์ต้องพา \"บ้านหลังที่สาม\" เข้าสู่<span style=\"color:#006241\"><b>ยุคดิจิทัล</b></span>…"),
],
"s6-digital": [
  ("Chapter 5: The Digital \"Third Place\"", "บทที่ 5: \"บ้านหลังที่สาม\" แบบดิจิทัล"),
  ("Blending Physical Hospitality with Digital Convenience", "ผสานการต้อนรับที่หน้าร้านเข้ากับความสะดวกแบบดิจิทัล"),
  ("Starbucks Rewards App", "แอป Starbucks Rewards"),
  ("Gamified loyalty program driving <span style=\"color:#006241\"><b>over 30M active members</b></span>.", "โปรแกรมสะสมคะแนนแบบเกม มีสมาชิกใช้งาน<span style=\"color:#006241\"><b>กว่า 30 ล้านคน</b></span>"),
  ("Mobile Order &amp; Pay", "Mobile Order &amp; Pay"),
  ("Seamless, friction-free customer convenience.", "สั่งและจ่ายล่วงหน้า สะดวก ไร้รอยต่อ"),
  ("Digital Personalization", "การปรับแต่งเฉพาะบุคคลแบบดิจิทัล"),
  ("AI-driven recommendation engine tailoring offers to individual tastes.", "ระบบแนะนำด้วย AI ที่ปรับข้อเสนอให้ตรงรสนิยมของแต่ละคน"),
  ("Modern Omnichannel", "ออมนิแชนแนลยุคใหม่"),
  ("Human connection preserved through drive-thru and delivery channels.", "รักษาการเชื่อมโยงกับผู้คนไว้ ทั้งผ่านไดรฟ์ทรูและบริการเดลิเวอรี"),
  ("Having mastered both physical experience and digital innovation, what is the <span style=\"color:#D4E9E2\"><b>global business impact</b></span>?",
   "เมื่อเชี่ยวชาญทั้งประสบการณ์หน้าร้านและนวัตกรรมดิจิทัลแล้ว <span style=\"color:#D4E9E2\"><b>ผลกระทบทางธุรกิจระดับโลก</b></span>เป็นอย่างไร?"),
],
"s7-global": [
  ("Chapter 6: Global Reach &amp; Scale", "บทที่ 6: การเข้าถึงและขยายสู่ระดับโลก"),
  ("Expanding the Narrative Across Borders", "ขยายเรื่องเล่าข้ามพรมแดน"),
  ("Stores worldwide", "สาขาทั่วโลก"), ("Global markets", "ตลาดทั่วโลก"),
  ("Key growth strategy", "กลยุทธ์การเติบโตหลัก"),
  ("Strategic joint ventures", "ร่วมทุนเชิงกลยุทธ์"),
  ("Local partners to enter and grow in new markets.", "จับมือพันธมิตรท้องถิ่นเพื่อเข้าสู่และเติบโตในตลาดใหม่"),
  ("Market customization", "ปรับให้เข้ากับแต่ละตลาด"),
  ("Local menus, for example Teavana and matcha drinks in Asia.", "เมนูท้องถิ่น เช่น Teavana และเครื่องดื่มมัทฉะในเอเชีย"),
  ("Reserve Roasteries", "Reserve Roasteries"),
  ("High-end flagships that act as the brand's storytellers.", "ร้านแฟล็กชิประดับไฮเอนด์ที่ทำหน้าที่เป็นนักเล่าเรื่องของแบรนด์"),
  ("So what can <span style=\"color:#006241\"><b>business leaders</b></span> learn from this story?", "แล้ว<span style=\"color:#006241\"><b>ผู้นำธุรกิจ</b></span>เรียนรู้อะไรได้บ้างจากเรื่องราวนี้?"),
],
"s8-takeaways": [
  ("Key Business Lessons &amp; Summary", "บทเรียนทางธุรกิจที่สำคัญและบทสรุป"),
  ("What Business Leaders Can Learn from Starbucks", "สิ่งที่ผู้นำธุรกิจเรียนรู้ได้จากสตาร์บัคส์"),
  ("Lesson 1", "บทเรียนที่ 1"), ("Lesson 2", "บทเรียนที่ 2"), ("Lesson 3", "บทเรียนที่ 3"),
  ("Product vs. Experience", "ผลิตภัณฑ์ vs. ประสบการณ์"),
  ("Products can be commoditized; brand experience builds competitive moats.", "ผลิตภัณฑ์ถูกทำให้เป็นสินค้าโภคภัณฑ์ได้ แต่ประสบการณ์แบรนด์สร้างคูเมืองทางการแข่งขัน"),
  ("Authenticity &amp; Consistency", "ความจริงใจและความสม่ำเสมอ"),
  ("Core brand values must stay consistent, even during rapid global expansion.", "คุณค่าหลักของแบรนด์ต้องคงที่ แม้ขยายตัวทั่วโลกอย่างรวดเร็ว"),
  ("Strategic Adaptability", "ความสามารถในการปรับตัวเชิงกลยุทธ์"),
  ("Merge the physical third-place atmosphere with a cutting-edge digital ecosystem.", "ผสานบรรยากาศบ้านหลังที่สามเข้ากับระบบนิเวศดิจิทัลล้ำสมัย"),
  ("In a world that is increasingly digital and isolated, the hunger for authentic human connection has never been greater.", "ในโลกที่เป็นดิจิทัลและโดดเดี่ยวมากขึ้นทุกที ความโหยหาการเชื่อมโยงที่แท้จริงระหว่างมนุษย์ไม่เคยยิ่งใหญ่เท่านี้มาก่อน"),
  ("Thank you! We welcome any questions from the class.", "ขอบคุณครับ/ค่ะ ยินดีรับทุกคำถามจากเพื่อน ๆ ในชั้นเรียน"),
],
}

ASIDE = {
"s1-title": "สวัสดีทุกคน หัวข้อของเราคือสตาร์บัคส์ใช้การเล่าเรื่องอย่างไรในการเติบโตจากร้านเดียวในซีแอตเทิลสู่แบรนด์ระดับโลก เราจะเล่าเป็นสี่ตอน: จุดกำเนิด จุดเปลี่ยน การนำประสบการณ์ไปปฏิบัติจริง และผลกระทบระดับโลกพร้อมบทเรียนสำหรับผู้นำธุรกิจ สามสิ่งที่อยากให้จำไว้ตั้งแต่ต้น: จุดเริ่มต้นในปี 1971 ที่ตลาดไพก์เพลซ ผลิตภัณฑ์คือกาแฟเมล็ดคั่วระดับกูร์เมต์ และสัญลักษณ์คือไซเรนสองหาง ต่อไป เรามาดูกันว่าทุกอย่างเริ่มต้นที่ไหนในปี 1971",
"s2-origin": "ก่อนยุคลาเต้ สตาร์บัคส์เป็นร้านค้าปลีกเมล็ดกาแฟและเครื่องเทศระดับไฮเอนด์ ก่อตั้งในปี 1971 โดย Jerry Baldwin, Zev Siegl และ Gordon Bowker ด้วยพันธกิจที่เรียบง่าย: สอนให้คนอเมริกันชงกาแฟคั่วเข้มชั้นดีได้เองที่บ้าน ชื่อและโลโก้ก็เป็นการเล่าเรื่องตั้งแต่แรก: ไซเรนสองหางมาจากภาพแกะไม้นอร์สสมัยศตวรรษที่ 16 สื่อถึงประเพณีการเดินเรือของซีแอตเทิลและเสน่ห์ของกาแฟชั้นดีที่ยากจะต้านทาน เวทีถูกจัดเตรียมไว้แล้ว แต่สตาร์บัคส์ยังขาดส่วนผสมวิเศษที่สำคัญที่สุด จนกระทั่งปี 1983 กับการเดินทางไปมิลาน",
"s3-milan": "ในปี 1983 โฮเวิร์ด ชูลต์ซ ไปเยือนบาร์เอสเพรสโซในมิลาน เขาสังเกตว่าร้านเหล่านั้นไม่ได้แค่ขายเครื่องดื่ม แต่เป็นห้องนั่งเล่นของชุมชนที่มีชีวิตชีวา วิสัยทัศน์ของเขาคืออเมริกาต้องการวัฒนธรรมเอสเพรสโซแท้ ๆ ที่สร้างขึ้นจากการเชื่อมโยงระหว่างผู้คน ความรวดเร็ว และฝีมือ ในปี 1987 เขาซื้อสตาร์บัคส์ในราคา 3.8 ล้านดอลลาร์ และรวมแนวคิดร้าน Il Giornale ของเขาเข้าไป เปิดศักราชร้านกาแฟยุคใหม่ ชูลต์ซไม่ได้แค่อยากขายกาแฟ เขาอยากสร้างพื้นที่ใหม่ในชีวิตของผู้คน",
"s4-third-place": "คำตอบของชูลต์ซคือบ้านหลังที่สาม บ้านคือที่หนึ่ง ที่ทำงานคือที่สอง และสตาร์บัคส์คือที่สาม: ที่พักพิงอันอบอุ่น ปราศจากความกดดัน ระหว่างสองที่นั้น เสาหลักที่สองคือความผูกพันทางอารมณ์ ดังคำของชูลต์ซ: เราไม่ได้อยู่ในธุรกิจกาแฟที่ให้บริการผู้คน แต่เราอยู่ในธุรกิจผู้คนที่ให้บริการกาแฟ เสาหลักที่สามมองบรรยากาศเป็นผลิตภัณฑ์: แสงไฟอบอุ่น พื้นผิวไม้ ดนตรีอะคูสติก และกลิ่นหอมชวนต้อนรับ เมื่อเข้าใจบ้านหลังที่สามแล้ว สตาร์บัคส์ขยายประสบการณ์แบบมนุษย์นี้ไปสู่ร้านหลายพันสาขาได้อย่างไร",
"s5-touchpoints": "จะรักษาประสบการณ์แบบมนุษย์ไว้ในร้านหลายพันสาขาได้อย่างไร ผ่านจุดสัมผัสในชีวิตประจำวัน หนึ่ง ความเป็นส่วนตัวและการเชื่อมโยง: ชื่อบนแก้ว บาริสต้าสบตา และเครื่องดื่มที่ปรับแต่งด้วยมือ สอง ความสม่ำเสมอทางประสาทสัมผัส: การออกแบบบรรยากาศ กลิ่นเอกลักษณ์ และเพลย์ลิสต์เดียวกันในร้านทั่วโลก สาม ปรับให้เข้ากับชุมชน: สถาปัตยกรรมร้านสะท้อนมรดกของย่าน ขณะที่คุณค่าหลักของแบรนด์คงเดิม เมื่อไลฟ์สไตล์ของลูกค้าเปลี่ยนไป สตาร์บัคส์ต้องพาบ้านหลังที่สามเข้าสู่ยุคดิจิทัล",
"s6-digital": "ฝั่งดิจิทัลต่อยอดแนวคิดเดียวกัน แอป Starbucks Rewards เป็นโปรแกรมสะสมคะแนนแบบเกมที่มีสมาชิกใช้งานกว่า 30 ล้านคน Mobile Order and Pay ตัดความยุ่งยากออกจากการมาร้าน การปรับแต่งเฉพาะบุคคลใช้ระบบแนะนำด้วย AI ปรับข้อเสนอให้ตรงรสนิยมแต่ละคน และโมเดลออมนิแชนแนลรักษาการเชื่อมโยงกับผู้คนไว้แม้ผ่านไดรฟ์ทรูและเดลิเวอรี เมื่อเชี่ยวชาญทั้งประสบการณ์หน้าร้านและนวัตกรรมดิจิทัลแล้ว ผลกระทบทางธุรกิจระดับโลกเป็นอย่างไร",
"s7-global": "วันนี้เรื่องราวนี้ถูกเล่าในร้านกว่า 38,000 สาขา ในกว่า 80 ตลาดทั่วโลก สามกลยุทธ์ที่ทำให้ขยายได้ขนาดนี้: การร่วมทุนเชิงกลยุทธ์กับพันธมิตรท้องถิ่นเปิดตลาดใหม่ การปรับให้เข้ากับแต่ละตลาดปรับเมนู เช่น Teavana และเครื่องดื่มมัทฉะในเอเชีย และ Reserve Roasteries ระดับไฮเอนด์ทำหน้าที่เป็นแฟล็กชิปนักเล่าเรื่องของทั้งแบรนด์ แล้วผู้นำธุรกิจเรียนรู้อะไรได้บ้างจากเรื่องราวนี้",
"s8-takeaways": "สามบทเรียนสำหรับผู้นำธุรกิจ หนึ่ง ผลิตภัณฑ์กับประสบการณ์: ผลิตภัณฑ์ถูกทำให้เป็นสินค้าโภคภัณฑ์ได้ แต่ประสบการณ์แบรนด์สร้างคูเมืองทางการแข่งขัน สอง ความจริงใจและความสม่ำเสมอ: คุณค่าหลักของแบรนด์ต้องคงเดิมแม้ขยายตัวทั่วโลกอย่างรวดเร็ว สาม ความสามารถในการปรับตัวเชิงกลยุทธ์: สตาร์บัคส์ผสานบรรยากาศบ้านหลังที่สามเข้ากับระบบนิเวศดิจิทัลล้ำสมัย ขอปิดท้ายด้วยข้อคิดนี้: ในโลกที่เป็นดิจิทัลและโดดเดี่ยวมากขึ้นทุกที ความโหยหาการเชื่อมโยงที่แท้จริงระหว่างมนุษย์ไม่เคยยิ่งใหญ่เท่านี้มาก่อน ขอบคุณครับ/ค่ะ ยินดีรับทุกคำถามจากเพื่อน ๆ ในชั้นเรียน",
}

# Layout tweaks for Thai glyphs: taller line boxes, no tracking, slightly smaller body copy.
STYLE = [
  ("'DM Sans', Arial, sans-serif", "'Sarabun', 'DM Sans', Arial, sans-serif"),
  ("'Fraunces', Georgia, serif", "'Pridi', 'Fraunces', Georgia, serif"),
  ("letter-spacing:3px;", ""), ("letter-spacing:2px;", ""), ("letter-spacing:1px;", ""),
  ("text-transform:uppercase;", ""),
  ("font-size:72px;font-weight:600;line-height:1.08", "font-size:66px;font-weight:600;line-height:1.3"),
  ("font-size:64px;font-weight:600;line-height:1.1", "font-size:58px;font-weight:600;line-height:1.3"),
  ("font-size:36px;font-weight:600;line-height:1.2", "font-size:34px;font-weight:600;line-height:1.4"),
  ("font-size:34px;font-weight:600;line-height:1.2", "font-size:32px;font-weight:600;line-height:1.4"),
  ("font-size:34px;line-height:1.3", "font-size:32px;line-height:1.5"),
  ("font-size:28px;line-height:1.4", "font-size:27px;line-height:1.55"),
  ("font-size:27px;line-height:1.4", "font-size:26px;line-height:1.55"),
  ("font-size:28px;line-height:1.35", "font-size:27px;line-height:1.5"),
  ("font-size:28px;font-style:italic;line-height:1.4", "font-size:27px;font-style:italic;line-height:1.55"),
  ("font-size:36px;font-style:italic;line-height:1.35", "font-size:32px;font-style:italic;line-height:1.55"),
  ("font-size:28px;font-style:italic;", "font-size:27px;line-height:1.5;"),
  ("font-size:30px;font-weight:700;", "font-size:28px;font-weight:700;line-height:1.5;"),
  ("font-size:24px;", "font-size:24px;line-height:1.5;"),
]

def convert(sid):
  s = (SL / f"{sid}.html").read_text(encoding="utf8")
  for a, b in COMMON + T[sid]:
    if a not in s:
      continue
    s = s.replace(a, b)
  s = re.sub(r"<aside>.*?</aside>", "<aside>" + ASIDE[sid] + "</aside>", s, flags=re.S)
  for a, b in STYLE:
    s = s.replace(a, b)
  tid = "t" + sid[1:]
  s = s.replace(f'id="{sid}"', f'id="{tid}"')
  s = re.sub(r'id="key(\d)"', r'id="tkey\1"', s)
  if sid == "s1-title":
    s = s.replace('data-transition="magic"', 'data-transition="fade"', 1)
  leftovers = re.findall(r">([A-Za-z][A-Za-z ,.'&;:!?-]{14,})<", s)
  leftovers = [t for t in leftovers if t not in ("Jerry Baldwin", "Gordon Bowker", "Reserve Roasteries", "Mobile Order &amp; Pay")]
  if leftovers: print("  untranslated?", sid, leftovers[:6])
  (SL / f"{tid}.html").write_text(s, encoding="utf8")
  return tid

COMMON_OPTIONAL = set(a for a, _ in COMMON)
order = []
for sid in ["s1-title", "s2-origin", "s3-milan", "s4-third-place", "s5-touchpoints", "s6-digital", "s7-global", "s8-takeaways"]:
  for a, _ in T[sid]:
    src = (SL / f"{sid}.html").read_text(encoding="utf8")
    assert a in src, (sid, a[:50])
  order.append(convert(sid))

deck = json.loads((ROOT / "deck.json").read_text(encoding="utf8"))
deck["order"] = [o for o in deck["order"] if not o.startswith("t")] + order
deck["sections"] = {k: v for k, v in deck["sections"].items() if not k.startswith("thai")}
deck["sections"]["thai"] = {"description": "Thai version: slides 9-16 repeat the whole story in Thai (ฉบับภาษาไทย).", "start": "t1-title"}
deck["faces"]["pridi"] = {"family": "Pridi", "href": "https://fonts.googleapis.com/css2?family=Pridi:wght@400;500;600&display=swap"}
deck["faces"]["sarabun"] = {"family": "Sarabun", "href": "https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,400;0,500;0,700;1,400&display=swap"}
(ROOT / "deck.json").write_text(json.dumps(deck, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
print("order:", deck["order"])
