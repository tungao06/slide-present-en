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
| `--vad` | อยากให้เร็วขึ้น: ข้ามช่วงเงียบ แต่เสียงพูดเบาๆ อาจหาย (ปิดไว้เป็นค่าเริ่มต้น) |
| `--no-prompt` | ไม่ส่งศัพท์จากสไลด์ให้ Whisper (ถ้าสงสัยว่าทำให้ข้ามหรือซ้ำ) |
| `--beam 5` | อยากให้เร็วขึ้นเกือบเท่าตัว แม่นลดลงเล็กน้อย |
| `--frames-only` | เอาแค่รูป ไม่ถอดเสียง |
| `--scene 0.05` | สไลด์เปลี่ยนแล้วไม่ได้รูป: จับละเอียดขึ้น |
| `--scene 0.2` | ได้รูปซ้ำเยอะเกิน (เช่นมีกล้องหน้า อ. ซ้อนอยู่) |

## ค่าเริ่มต้น: ละเอียดและครบที่สุด

- ใช้โมเดลภาษาไทย (Thonburian Whisper) อัตโนมัติถ้าแปลงไว้แล้ว ไม่งั้นใช้ `large-v3`
- ถอดเสียง**ทุกวินาที** ไม่ตัดช่วงที่คิดว่าเงียบทิ้ง เนื้อหาจะไม่หาย
- beam search 10 (ค้นหาประโยคที่น่าจะถูกที่สุดจาก 10 ทาง) บนการ์ดจอ float16
- ไม่ทิ้งประโยคไหนเลย ประโยคที่ไม่มั่นใจ วนซ้ำ หรืออาจเป็นช่วงเงียบ จะมี `[?]` นำหน้าให้เทียบกับวิดีโอ
- รูปความละเอียดเต็ม ทุกครั้งที่สไลด์เปลี่ยน (จับหลังเปลี่ยนเสร็จ 1.5 วินาที) และอย่างน้อยทุก 30 วินาที

## เสร็จแล้ว push ขึ้น Git

```powershell
git add MGT520/extracted
git commit -m "MGT520: extracted frames and transcripts"
git push
```
