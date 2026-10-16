# แปลง VDO การเรียน → รูปสไลด์ + transcript

สคริปต์ `extract_video.py` จะทำ 3 อย่างกับวิดีโอแต่ละไฟล์ใน `MGT520/videos/`

1. ดึงรูปทุกครั้งที่สไลด์เปลี่ยน (และอย่างน้อยทุก 60 วินาที)
2. ถอดเสียงภาษาไทยด้วย Whisper เป็น `transcript.srt` / `transcript.txt` พร้อมเวลา
3. รวมเป็น `notes.md` คือรูปสไลด์แต่ละหน้าตามด้วยสิ่งที่ อ. พูดตอนสไลด์นั้น

ผลลัพธ์อยู่ที่ `MGT520/extracted/<ชื่อวิดีโอ>/`

## ติดตั้ง (Windows + การ์ดจอ NVIDIA, ครั้งเดียว)

```bash
winget install Gyan.FFmpeg
pip install -U faster-whisper ctranslate2 pypdf nvidia-cublas-cu12 "nvidia-cudnn-cu12>=9,<10"
python MGT520/tools/extract_video.py --check-gpu     # ต้องขึ้น "cuda OK"
```

ถ้าไม่ขึ้น `cuda OK` ให้อัปเดตไดรเวอร์การ์ดจอ (ต้อง 525 ขึ้นไป เช็กด้วย `nvidia-smi`) แล้วรัน `--check-gpu` ใหม่
สคริปต์จะหยุดทันทีถ้าใช้การ์ดจอไม่ได้ ไม่แอบไปใช้ CPU ที่ช้ากว่ามาก (ถ้าต้องการใช้ CPU จริงๆ ให้ใส่ `--cpu`)

## รัน

```bash
# ต้องมีไฟล์วิดีโอจริงใน MGT520/videos (ถ้าเป็นแค่ pointer ให้ copy จาก iCloud มาทับ)
python MGT520/tools/extract_video.py "MGT520/videos/01-วัฒนธรรมองค์กร ep3.mp4"   # ลองไฟล์เดียวก่อน
python MGT520/tools/extract_video.py                                             # ทำทุกไฟล์
```

## โมเดลภาษาไทย (แนะนำ ถ้า large-v3 ถอดผิดเยอะ)

Thonburian Whisper (`biodatlab/whisper-th-large-v3-combined`) คือ Whisper large-v3 ที่ฝึกเพิ่มด้วยเสียงภาษาไทย
ต้องแปลงเป็นรูปแบบของ faster-whisper ครั้งเดียว (ดาวน์โหลดหลาย GB เก็บไว้ที่ `MGT520/models/` ไม่ขึ้น Git)

```bash
pip install transformers torch
python MGT520/tools/convert_thai_model.py
python MGT520/tools/extract_video.py "MGT520/videos/01-วัฒนธรรมองค์กร ep3.mp4" --model thai
```

ตัวเลือก

| ตัวเลือก | ใช้เมื่อ |
|---|---|
| `--prompt "ชื่อคน, ศัพท์"` | อ. พูดชื่อหรือศัพท์เฉพาะที่ระบบสะกดผิด |
| `--no-vad` | เนื้อหาบางช่วงหายไป: ถอดทุกวินาที ไม่ตัดช่วงที่คิดว่าเงียบ |
| `--no-prompt` | ไม่ส่งศัพท์จากสไลด์ให้ Whisper (ถ้าสงสัยว่าทำให้ข้ามหรือซ้ำ) |
| `--beam 10` | อยากให้ถอดเสียงละเอียดขึ้นอีก (ช้าลงประมาณ 2 เท่า) |
| `--precision float32` | การ์ดจอมี VRAM 10 GB ขึ้นไป: ความละเอียดตัวเลขเต็ม |
| `--frames-only` | เอาแค่รูป ไม่ถอดเสียง |
| `--scene 0.05` | สไลด์เปลี่ยนแล้วไม่ได้รูป: จับละเอียดขึ้น |
| `--scene 0.2` | ได้รูปซ้ำเยอะเกิน (เช่นมีกล้องหน้า อ. ซ้อนอยู่) |

## ค่าเริ่มต้นเน้นความแม่นยำ

- Whisper `large-v3` (รุ่นที่แม่นที่สุด) บนการ์ดจอแบบ float16 และ beam search 5
- ดึงศัพท์ภาษาอังกฤษจาก PDF สไลด์เรื่องเดียวกัน (เลข `01-` `02-` ...) ไปช่วยให้สะกดชื่อและศัพท์ถูก
- ประโยคที่ระบบไม่มั่นใจจะมี `[?]` นำหน้า ให้เทียบกับวิดีโอตามเวลาที่ระบุ
- รูปเก็บความละเอียดเต็มของวิดีโอ และจับหลังสไลด์เปลี่ยน 1.5 วินาที เพื่อไม่ให้ได้ภาพที่กำลังเปลี่ยนสไลด์

## เสร็จแล้ว push ขึ้น Git

```powershell
git add MGT520/extracted
git commit -m "MGT520: extracted frames and transcripts"
git push
```
