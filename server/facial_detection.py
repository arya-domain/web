import numpy as np
import cv2
import base64

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def handle_image(data):
    try:
        # Decode base64 image data
        img_data = base64.b64decode(data["image"].split(",")[1])
        npimg = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        # Draw rectangles around faces
        for x, y, w, h in faces:
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # Encode the processed image
        _, img_encoded = cv2.imencode(".jpg", img)
        img_base64 = base64.b64encode(img_encoded).decode()

        return img_base64

    except Exception as e:
        print(f"Error in handle_image: {str(e)}")
        return None
