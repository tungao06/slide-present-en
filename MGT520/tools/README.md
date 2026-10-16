# แปลง VDO การเรียน → รูปสไลด์ + transcript

สคริปต์ `extract_video.py` จะทำ 3 อย่างกับวิดีโอแต่ละไฟล์ใน `MGT520/videos/`

1. ดึงรูปทุกครั้งที่สไลด์เปลี่ยน (และอย่างน้อยทุก 60 วินาที)
2. ถอดเสียงภาษาไทยด้วย Whisper เป็น `transcript.srt` / `transcript.txt` พร้อมเวลา
3. รวมเป็น `notes.md` คือรูปสไลด์แต่ละหน้าตามด้วยสิ่งที่ อ. พูดตอนสไลด์นั้น

ผลลัพธ์อยู่ที่ `MGT520/extracted/<ชื่อวิดีโอ>/`

## ติดตั้ง (Windows, ครั้งเดียว)

```powershell
winget install Gyan.FFmpeg      # แล้วปิดเปิด PowerShell ใหม่
winget install Python.Python.3.12
pip install faster-whisper
```

## รัน

```powershell
cd slide-present-en
git lfs pull                                   # ให้มีไฟล์วิดีโอจริงในเครื่อง
python MGT520/tools/extract_video.py           # ทำทุกไฟล์
python MGT520/tools/extract_video.py "MGT520/videos/03-ภาวะผู้นำ ep1.mp4"   # ไฟล์เดียว
```

ตัวเลือกที่ใช้บ่อย

| ตัวเลือก | ใช้เมื่อ |
|---|---|
| `--model small` | เครื่องช้า: เร็วขึ้นมากแต่ถอดเสียงแม่นน้อยลง (ค่าเริ่มต้นคือ `large-v3`) |
| `--frames-only` | เอาแค่รูป ไม่ถอดเสียง |
| `--scene 0.05` | สไลด์เปลี่ยนแล้วไม่ได้รูป: จับละเอียดขึ้น |
| `--scene 0.2` | ได้รูปซ้ำเยอะเกิน (เช่นมีกล้องหน้า อ. ซ้อนอยู่) |

ใช้ CPU อย่างเดียว `large-v3` ใช้เวลาประมาณเท่ากับความยาววิดีโอหรือนานกว่า ถ้ามีการ์ดจอ NVIDIA จะใช้ให้อัตโนมัติ

## เสร็จแล้ว push ขึ้น Git

```powershell
git add MGT520/extracted
git commit -m "MGT520: extracted frames and transcripts"
git push
```
