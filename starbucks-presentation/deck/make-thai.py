"""Build the Thai slides (t1..t8) from the English deck files by exact-string translation."""
import re, sys, json, pathlib
ROOT = pathlib.Path(__file__).parent / "project"
SL = ROOT / "slides"

COMMON = [
  # footers / eyebrows / chips — English terms stay in English (ทับศัพท์), Thai carries the sentence
  ("Part 1 · The Foundation &amp; Origin", "Part 1 · รากฐานและจุดกำเนิดของแบรนด์"),
  ("Part 2 · The Turning Point", "Part 2 · จุดเปลี่ยน (Turning Point)"),
  ("Part 2 · Concept Development", "Part 2 · การพัฒนา Concept"),
  ("Part 3 · Operationalizing Experience", "Part 3 · การนำ Experience ไปปฏิบัติจริง"),
  ("Part 3 · Modern Evolution", "Part 3 · วิวัฒนาการยุคใหม่"),
  ("Part 4 · Global Impact", "Part 4 · Global Impact"),
  ("Part 4 · Conclusion &amp; MBA Takeaways", "Part 4 · บทสรุป &amp; MBA Takeaways"),
  ("Part 4 · MBA Lessons", "Part 4 · MBA Lessons"),
  ("1983 · The trip to Milan", "1983 · ทริปไป Milan"),
  ("Human experience, at scale", "ขยาย Human Experience สู่ทุกสาขา"),
  ("The digital Third Place", "Digital Third Place"),
  ("Global reach &amp; scale", "Global Reach &amp; Scale"),
  ("Lessons for business leaders", "บทเรียนสำหรับ Business Leaders"),
  (">Next</p>", ">ถัดไป</p>"),
]
for n in range(1, 9):
  COMMON.append((f"Slide {n} of 8", f"สไลด์ {n} จาก 8"))

T = {
"s1-title": [
  ("Crafting a Global Culture: The Starbucks Storytelling Masterclass", "สร้างวัฒนธรรมระดับโลก: Storytelling Masterclass ของ Starbucks"),
  ("How Narrative, Experience, and Identity Built a Multi-Billion Dollar Empire", "Narrative, Experience และ Identity สร้างอาณาจักรมูลค่าหลายพันล้านดอลลาร์ได้อย่างไร"),
  ("Origins · 1971", "จุดเริ่มต้น · 1971"),
  (">The Product<", ">ผลิตภัณฑ์<"),
  (">The Symbol<", ">สัญลักษณ์<"),
  ("The Norse Twin-Tailed Siren", "Siren สองหางจากตำนาน Norse"),
  ("Now, let's look at where it all began in <span style=\"color:#448361\"><b>1971</b></span>…", "ต่อไป มาดูกันว่าทุกอย่างเริ่มต้นที่ไหนในปี <span style=\"color:#448361\"><b>1971</b></span>…"),
],
"s2-origin": [
  ("Chapter 1: Coffee Beans &amp; Seattle Roots", "บทที่ 1: Coffee Beans &amp; Seattle Roots"),
  ("Before the Lattes: A High-End Bean &amp; Spice Retailer", "ก่อนยุค Latte: ร้านขายเมล็ดกาแฟและเครื่องเทศระดับ High-End"),
  ("The Founders &amp; Mission", "ผู้ก่อตั้ง &amp; Mission"),
  (">Founded by<", ">ก่อตั้งโดย<"),
  ("Teach Americans how to brew fine <b>dark-roast coffee</b> at home.", "สอนให้คนอเมริกันชงกาแฟ <b>Dark Roast</b> ชั้นดีได้เองที่บ้าน"),
  ("The Siren Mythos", "ตำนาน Siren"),
  (">Inspired by<", ">แรงบันดาลใจจาก<"),
  ("A 16th-century Norse woodcut siren", "ภาพแกะไม้ Siren แบบ Norse สมัยศตวรรษที่ 16"),
  ("Seattle's nautical tradition", "ประเพณีการเดินเรือของ Seattle"),
  ("The irresistible pull of fine coffee", "เสน่ห์ของกาแฟชั้นดีที่ยากจะต้านทาน"),
  ("The stage was set, but Starbucks was still missing its biggest magic ingredient… until <span style=\"color:#448361\"><b>1983</b></span>, and a trip to <span style=\"color:#448361\"><b>Milan</b></span>.",
   "เวทีพร้อมแล้ว แต่ Starbucks ยังขาดส่วนผสมวิเศษที่สำคัญที่สุด… จนกระทั่งปี <span style=\"color:#448361\"><b>1983</b></span> กับทริปไป <span style=\"color:#448361\"><b>Milan</b></span>"),
],
"s3-milan": [
  ("Chapter 2: The Italian Inspiration", "บทที่ 2: แรงบันดาลใจจาก Italy"),
  ("How a Trip to Milan Changed Coffee History", "ทริปไป Milan เปลี่ยนประวัติศาสตร์กาแฟได้อย่างไร"),
  ("Howard Schultz visits Milan's espresso bars. He notices they aren't just selling drinks: they serve as vibrant <b>community living rooms</b>.",
   "Howard Schultz ไปเยือน Espresso Bar ใน Milan และสังเกตว่าร้านเหล่านั้นไม่ได้แค่ขายเครื่องดื่ม แต่เป็น <b>Community Living Room</b> ที่มีชีวิตชีวา"),
  ("America needs an authentic espresso culture built around <b>human connection, speed, and craftsmanship</b>.",
   "อเมริกาต้องการวัฒนธรรม Espresso แท้ ๆ ที่สร้างจาก <b>Human Connection, Speed และ Craftsmanship</b>"),
  ("Schultz buys Starbucks for <span style=\"color:#448361\"><b>$3.8M</b></span>, merging his Il Giornale cafe concept into it to launch the modern coffeehouse era.",
   "Schultz ซื้อ Starbucks ในราคา <span style=\"color:#448361\"><b>$3.8M</b></span> และรวม Concept ร้าน Il Giornale ของเขาเข้าไป เปิดศักราช Coffeehouse ยุคใหม่"),
  ("Schultz didn't just want to sell coffee; he wanted to create <span style=\"color:#448361\"><b>a new space in human life</b></span>…",
   "Schultz ไม่ได้แค่อยากขายกาแฟ เขาอยากสร้าง<span style=\"color:#448361\"><b>พื้นที่ใหม่ในชีวิตของผู้คน</b></span>…"),
],
"s4-third-place": [
  ("Chapter 3: \"The Third Place\" Framework", "บทที่ 3: Framework \"The Third Place\""),
  ("The Core Brand Philosophy", "ปรัชญาหลักของแบรนด์ (Core Brand Philosophy)"),
  (">Home<", ">บ้าน<"), (">Work<", ">ที่ทำงาน<"),
  ("A comforting, pressure-free sanctuary between home and work.", "ที่พักพิงอันอบอุ่น ไร้ความกดดัน ระหว่างบ้านกับที่ทำงาน"),
  ("\"We aren't in the coffee business serving people; we're in the people business serving coffee.\"", "\"เราไม่ได้อยู่ในธุรกิจกาแฟที่ให้บริการผู้คน แต่เราอยู่ในธุรกิจผู้คนที่ให้บริการกาแฟ\""),
  ("Pillar 3 · Atmosphere as a Product", "Pillar 3 · Atmosphere คือ Product"),
  ("Warm lighting", "แสงไฟอบอุ่น"), ("Wooden textures", "Texture ไม้"), ("Acoustic music", "ดนตรี Acoustic"), ("Welcoming aroma", "กลิ่นหอมชวนต้อนรับ"),
  ("Now that we understand the strategic concept of the Third Place, how did Starbucks <span style=\"color:#448361\"><b>scale this human experience</b></span> to thousands of stores?",
   "เมื่อเข้าใจ Concept เชิงกลยุทธ์ของ Third Place แล้ว Starbucks <span style=\"color:#448361\"><b>ขยาย Human Experience นี้</b></span>ไปสู่ร้านหลายพันสาขาได้อย่างไร?"),
],
"s5-touchpoints": [
  ("Chapter 4: Storytelling Through Touchpoints", "บทที่ 4: Storytelling ผ่าน Touchpoints"),
  ("Turning Everyday Rituals into Brand Loyalty", "เปลี่ยน Ritual ประจำวันให้เป็น Brand Loyalty"),
  ("Customer names on cups, eye-contact barista service, and customizable handcrafted beverages.", "เขียนชื่อลูกค้าบนแก้ว Barista สบตาขณะให้บริการ และเครื่องดื่ม Handcrafted ที่ Customize ได้"),
  ("Consistent ambient design, signature scents, and curated music playlists across global stores.", "Ambient Design, กลิ่น Signature และ Playlist ที่คัดสรร เหมือนกันทุกสาขาทั่วโลก"),
  ("Store architecture that reflects neighborhood heritage while keeping core brand values.", "สถาปัตยกรรมร้านที่สะท้อน Heritage ของย่านนั้น ๆ โดยยังคง Core Values ของแบรนด์"),
  ("As customer lifestyles changed, Starbucks had to bring \"The Third Place\" into the <span style=\"color:#448361\"><b>digital age</b></span>…",
   "เมื่อ Lifestyle ของลูกค้าเปลี่ยนไป Starbucks ต้องพา \"The Third Place\" เข้าสู่<span style=\"color:#448361\"><b>ยุค Digital</b></span>…"),
],
"s6-digital": [
  ("Chapter 5: The Digital \"Third Place\"", "บทที่ 5: Digital \"Third Place\""),
  ("Blending Physical Hospitality with Digital Convenience", "ผสาน Physical Hospitality เข้ากับ Digital Convenience"),
  ("Gamified loyalty program driving <span style=\"color:#448361\"><b>over 30M active members</b></span>.", "Loyalty Program แบบ Gamified มี <span style=\"color:#448361\"><b>Active Member กว่า 30 ล้านคน</b></span>"),
  ("Seamless, friction-free customer convenience.", "สั่งและจ่ายล่วงหน้า สะดวก ไร้ Friction"),
  ("AI-driven recommendation engine tailoring offers to individual tastes.", "Recommendation Engine ที่ขับเคลื่อนด้วย AI ปรับข้อเสนอให้ตรงรสนิยมของแต่ละคน"),
  ("Human connection preserved through drive-thru and delivery channels.", "รักษา Human Connection ไว้ ทั้งผ่าน Drive-thru และ Delivery"),
  ("Having mastered both physical experience and digital innovation, what is the <span style=\"color:#448361\"><b>global business impact</b></span>?",
   "เมื่อเชี่ยวชาญทั้ง Physical Experience และ Digital Innovation แล้ว <span style=\"color:#448361\"><b>Global Business Impact</b></span> เป็นอย่างไร?"),
],
"s7-global": [
  ("Chapter 6: Global Reach &amp; Scale", "บทที่ 6: Global Reach &amp; Scale"),
  ("Expanding the Narrative Across Borders", "ขยาย Narrative ข้ามพรมแดน"),
  ("Stores worldwide", "สาขาทั่วโลก"), ("Global markets", "ตลาดทั่วโลก"),
  ("Local partners to enter and grow in new markets.", "จับมือ Partner ท้องถิ่นเพื่อเข้าสู่และเติบโตในตลาดใหม่"),
  ("Local menus, for example Teavana and matcha drinks in Asia.", "เมนูท้องถิ่น เช่น Teavana และเครื่องดื่ม Matcha ในเอเชีย"),
  ("High-end flagships that act as the brand's storytellers.", "Flagship ระดับ High-End ที่ทำหน้าที่เป็น Storyteller ของแบรนด์"),
  ("So what can <span style=\"color:#448361\"><b>business leaders</b></span> learn from this story?", "แล้ว <span style=\"color:#448361\"><b>Business Leader</b></span> เรียนรู้อะไรได้บ้างจากเรื่องราวนี้?"),
],
"s8-takeaways": [
  ("Key Business Lessons &amp; Summary", "บทเรียนทางธุรกิจที่สำคัญ &amp; สรุป"),
  ("What Business Leaders Can Learn from Starbucks", "สิ่งที่ Business Leader เรียนรู้ได้จาก Starbucks"),
  ("Lesson 1", "บทเรียนที่ 1"), ("Lesson 2", "บทเรียนที่ 2"), ("Lesson 3", "บทเรียนที่ 3"),
  ("Products can be commoditized; brand experience builds competitive moats.", "Product ถูกทำให้เป็น Commodity ได้ แต่ Brand Experience สร้าง Competitive Moat"),
  ("Core brand values must stay consistent, even during rapid global expansion.", "Core Brand Values ต้องคงที่ แม้ขยายทั่วโลกอย่างรวดเร็ว"),
  ("Merge the physical third-place atmosphere with a cutting-edge digital ecosystem.", "ผสานบรรยากาศ Third Place แบบ Physical เข้ากับ Digital Ecosystem ที่ล้ำสมัย"),
  ("In a world that is increasingly digital and isolated, the hunger for authentic human connection has never been greater.", "ในโลกที่ Digital และโดดเดี่ยวมากขึ้นทุกที ความโหยหา Human Connection ที่แท้จริงไม่เคยยิ่งใหญ่เท่านี้มาก่อน"),
  ("Thank you! We welcome any questions from the class.", "ขอบคุณครับ/ค่ะ ยินดีรับทุกคำถามจากเพื่อน ๆ ในชั้นเรียน"),
],
}

ASIDE = {
"s1-title": "สวัสดีทุกคน หัวข้อของเราคือ Starbucks ใช้ Storytelling อย่างไรในการเติบโตจากร้านเดียวใน Seattle สู่แบรนด์ระดับโลก เราจะเล่าเป็นสี่ Part: จุดกำเนิด จุดเปลี่ยน การนำ Experience ไปปฏิบัติจริง และ Global Impact พร้อมบทเรียนสำหรับ Business Leader สามสิ่งที่อยากให้จำไว้ตั้งแต่ต้น: จุดเริ่มต้นในปี 1971 ที่ Pike Place Market ผลิตภัณฑ์คือ Whole-Bean Gourmet Coffee และสัญลักษณ์คือ Siren สองหาง ต่อไป มาดูกันว่าทุกอย่างเริ่มต้นที่ไหนในปี 1971",
"s2-origin": "ก่อนยุค Latte Starbucks เป็นร้านขายเมล็ดกาแฟและเครื่องเทศระดับ High-End ก่อตั้งในปี 1971 โดย Jerry Baldwin, Zev Siegl และ Gordon Bowker ด้วย Mission ที่เรียบง่าย: สอนให้คนอเมริกันชงกาแฟ Dark Roast ชั้นดีได้เองที่บ้าน ชื่อและโลโก้ก็เป็น Storytelling ตั้งแต่แรก: Siren สองหางมาจากภาพแกะไม้แบบ Norse สมัยศตวรรษที่ 16 สื่อถึงประเพณีการเดินเรือของ Seattle และเสน่ห์ของกาแฟชั้นดีที่ยากจะต้านทาน เวทีพร้อมแล้ว แต่ Starbucks ยังขาดส่วนผสมวิเศษที่สำคัญที่สุด จนกระทั่งปี 1983 กับทริปไป Milan",
"s3-milan": "ในปี 1983 Howard Schultz ไปเยือน Espresso Bar ใน Milan เขาสังเกตว่าร้านเหล่านั้นไม่ได้แค่ขายเครื่องดื่ม แต่เป็น Community Living Room ที่มีชีวิตชีวา Vision ของเขาคืออเมริกาต้องการวัฒนธรรม Espresso แท้ ๆ ที่สร้างจาก Human Connection, Speed และ Craftsmanship ในปี 1987 เขาซื้อ Starbucks ในราคา 3.8 ล้านดอลลาร์ และรวม Concept ร้าน Il Giornale ของเขาเข้าไป เปิดศักราช Coffeehouse ยุคใหม่ Schultz ไม่ได้แค่อยากขายกาแฟ เขาอยากสร้างพื้นที่ใหม่ในชีวิตของผู้คน",
"s4-third-place": "คำตอบของ Schultz คือ The Third Place บ้านคือ 1st Place ที่ทำงานคือ 2nd Place และ Starbucks คือ 3rd Place: ที่พักพิงอันอบอุ่น ไร้ความกดดัน ระหว่างสองที่นั้น Pillar ที่สองคือ Emotional Connection ดังคำของ Schultz: เราไม่ได้อยู่ในธุรกิจกาแฟที่ให้บริการผู้คน แต่เราอยู่ในธุรกิจผู้คนที่ให้บริการกาแฟ Pillar ที่สามมอง Atmosphere เป็น Product: แสงไฟอบอุ่น Texture ไม้ ดนตรี Acoustic และกลิ่นหอมชวนต้อนรับ เมื่อเข้าใจ Third Place แล้ว Starbucks ขยาย Human Experience นี้ไปสู่ร้านหลายพันสาขาได้อย่างไร",
"s5-touchpoints": "จะรักษา Human Experience ไว้ในร้านหลายพันสาขาได้อย่างไร ผ่าน Touchpoint ในชีวิตประจำวัน หนึ่ง Personalization และ Connection: ชื่อบนแก้ว Barista สบตา และเครื่องดื่ม Handcrafted ที่ Customize ได้ สอง Sensory Consistency: Ambient Design กลิ่น Signature และ Playlist เดียวกันในร้านทั่วโลก สาม Community Customization: สถาปัตยกรรมร้านสะท้อน Heritage ของย่าน ขณะที่ Core Values ของแบรนด์คงเดิม เมื่อ Lifestyle ของลูกค้าเปลี่ยนไป Starbucks ต้องพา Third Place เข้าสู่ยุค Digital",
"s6-digital": "ฝั่ง Digital ต่อยอด Concept เดียวกัน แอป Starbucks Rewards เป็น Loyalty Program แบบ Gamified ที่มี Active Member กว่า 30 ล้านคน Mobile Order and Pay ตัด Friction ออกจากการมาร้าน Digital Personalization ใช้ Recommendation Engine ที่ขับเคลื่อนด้วย AI ปรับข้อเสนอให้ตรงรสนิยมแต่ละคน และโมเดล Omnichannel รักษา Human Connection ไว้แม้ผ่าน Drive-thru และ Delivery เมื่อเชี่ยวชาญทั้ง Physical Experience และ Digital Innovation แล้ว Global Business Impact เป็นอย่างไร",
"s7-global": "วันนี้เรื่องราวนี้ถูกเล่าในร้านกว่า 38,000 สาขา ในกว่า 80 ตลาดทั่วโลก สามกลยุทธ์ที่ทำให้ขยายได้ขนาดนี้: Strategic Joint Venture กับ Partner ท้องถิ่นเปิดตลาดใหม่ Market Customization ปรับเมนู เช่น Teavana และเครื่องดื่ม Matcha ในเอเชีย และ Reserve Roasteries ระดับ High-End ทำหน้าที่เป็น Flagship Storyteller ของทั้งแบรนด์ แล้ว Business Leader เรียนรู้อะไรได้บ้างจากเรื่องราวนี้",
"s8-takeaways": "สามบทเรียนสำหรับ Business Leader หนึ่ง Product กับ Experience: Product ถูกทำให้เป็น Commodity ได้ แต่ Brand Experience สร้าง Competitive Moat สอง Authenticity และ Consistency: Core Brand Values ต้องคงเดิมแม้ขยายทั่วโลกอย่างรวดเร็ว สาม Strategic Adaptability: Starbucks ผสานบรรยากาศ Third Place แบบ Physical เข้ากับ Digital Ecosystem ที่ล้ำสมัย ขอปิดท้ายด้วยข้อคิดนี้: ในโลกที่ Digital และโดดเดี่ยวมากขึ้นทุกที ความโหยหา Human Connection ที่แท้จริงไม่เคยยิ่งใหญ่เท่านี้มาก่อน ขอบคุณครับ/ค่ะ ยินดีรับทุกคำถามจากเพื่อน ๆ ในชั้นเรียน",
}

# Layout tweaks for Thai glyphs: taller line boxes, no tracking, slightly smaller body copy.
STYLE = [
  ("'Inter', Arial, sans-serif", "'Noto Sans Thai', 'Inter', Arial, sans-serif"),
  ("letter-spacing:3px;", ""), ("letter-spacing:2px;", ""), ("letter-spacing:1px;", ""),
  ("text-transform:uppercase;", ""),
  ("font-size:72px;font-weight:700;line-height:1.12", "font-size:66px;font-weight:700;line-height:1.3"),
  ("font-size:60px;font-weight:700;line-height:1.15", "font-size:56px;font-weight:700;line-height:1.3"),
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
(ROOT / "deck.json").write_text(json.dumps(deck, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
print("order:", deck["order"])
