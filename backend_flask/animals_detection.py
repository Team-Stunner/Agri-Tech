import cv2
import os
import google.generativeai as genai
from PIL import Image
import csv
import time
from twilio.rest import Client

# === Twilio Credentials (hardcoded for now — replace with env vars later) ===
FARM_OWNER_NUMBER = "+91"
TWILIO_ACCOUNT_SID = "AC61136c14a13ea6750afebe63dc786be3"
TWILIO_AUTH_TOKEN = "7c369e13e5a83b7779d52e0017570e41"
TWILIO_PHONE_NUMBER = "+16193617879"

# Twilio Client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# === Gemini API Setup ===
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Input video path
video_path = r'D:\Github Things\github clones\ANIMAL-DETECTION\animal detection in farmland\animal detection.mp4'
cap = cv2.VideoCapture(video_path)

# Extract 1 frame per second (30 FPS video)
frame_interval = 30
frame_count = 0
saved_frame_count = 0

# Output folders and files
output_folder = 'detected_frames'
os.makedirs(output_folder, exist_ok=True)

log_file = 'detection_log.csv'
if not os.path.exists(log_file):
    with open(log_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Frame', 'Animal Detected'])

# Track last detected animal
last_animal_detected = None

# === ALERT FUNCTIONS ===
def send_sms(animal):
    message = twilio_client.messages.create(
        body=f"⚠ Animal Detected: {animal}",
        from_=TWILIO_PHONE_NUMBER,
        to=FARM_OWNER_NUMBER
    )
    print(f"📩 SMS sent: SID {message.sid}")

def make_call(animal):
    call = twilio_client.calls.create(
        twiml=f'<Response><Say voice="alice">Alert! {animal} has been detected in the video feed. Please take action.</Say></Response>',
        from_=TWILIO_PHONE_NUMBER,
        to=FARM_OWNER_NUMBER
    )
    print(f"📞 Call initiated: SID {call.sid}")

# === Gemini-based Frame Analysis ===
def check_for_animal(image_path):
    img = Image.open(image_path)

    while True:
        try:
            response = model.generate_content([
                "Does this image contain an animal? If yes, tell me which animal it is. Respond only with the animal name.",
                img
            ])
            return response.text.strip()
        except Exception as e:
            if "ResourceExhausted" in str(e):
                print("⚠ API limit hit. Waiting 30 seconds before retrying...")
                time.sleep(30)
            else:
                print("❌ Unexpected error:", e)
                return "Error"

# === Process Video Frames and Display OpenCV Window ===
while True:
    success, frame = cap.read()
    if not success:
        break

    if frame_count % frame_interval == 0:
        temp_filename = f"frame_{saved_frame_count}.jpg"
        temp_path = os.path.join(output_folder, temp_filename)
        cv2.imwrite(temp_path, frame)

        print(f"\n🔍 Analyzing {temp_filename}...")
        result = check_for_animal(temp_path)

        if "no" not in result.lower() and "not" not in result.lower():
            if result.lower() != (last_animal_detected or "").lower():
                print(f"✅ New animal detected: {result}")
                last_animal_detected = result

                # Save to CSV
                with open(log_file, 'a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow([temp_filename, result])

                # Display detection on the video frame
                cv2.putText(frame, f"Animal Detected: {result}", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

                # Send alerts
                send_sms(result)
                make_call(result)
            else:
                print(f"⏩ Duplicate animal '{result}' already detected. Skipping this frame.")
                os.remove(temp_path)
        else:
            print("❌ No animal detected. Deleting frame.")
            os.remove(temp_path)

        saved_frame_count += 1

    # Display the frame in OpenCV window with detection status
    cv2.imshow('Animal Detection Feed', frame)

    # Add wait and exit conditions
    if cv2.waitKey(1) & 0xFF == ord('q'):  # Exit on pressing 'q'
        break

    frame_count += 1
    time.sleep(1)  # Throttle frame rate for processing

# Release the video and close windows
cap.release()
cv2.destroyAllWindows()

print("\n✅ Done! All alerts sent. Check 'detected_frames' and 'detection_log.csv'.")
