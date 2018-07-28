####################################################
# Modified by Nazmi Asri                           #
# Original code: http://thecodacus.com/            #
# All right reserved to the respective owner       #
####################################################

# Import OpenCV2 for image processing
import cv2
from picamera import PiCamera
from picamera.array import PiRGBArray
import threading

# Import numpy for matrices calculations
import numpy as np

import os

MODULE_PATH = os.path.dirname(os.path.abspath(__file__))


class RecognitionThread(threading.Thread):
    """Thread class with a stop() method. The thread itself has to check
    regularly for the stopped() condition."""

    def __init__(self, *args, **kwargs):
        super(RecognitionThread, self).__init__(*args, **kwargs)
        self._stop_event = threading.Event()

    def stop(self):
        self._stop_event.set()

    def stopped(self):
        return self._stop_event.is_set()


class Recognition:

    def __init__(self):
        self.face_id = None
        self.cam = PiCamera()
        self.thread = RecognitionThread(target=self.recognize)

    def start(self):
        self.thread.start()

    def stop(self):
        self.thread.stop()
        while not self.thread.stopped():
            sleep(1000)
        self.camera.release()

    def recognize(self):

        # Create Local Binary Patterns Histograms for face recognization
        recognizer = cv2.face.LBPHFaceRecognizer_create()

        # Load the trained mode

        recognizer.read('{}/{}'.format(MODULE_PATH, 'trainer/trainer.yml'))

        # Load prebuilt model for Frontal Face
        cascadePath = '{}/{}'.format(MODULE_PATH,"haarcascade_frontalface_default.xml")

        # Create classifier from prebuilt model
        faceCascade = cv2.CascadeClassifier(cascadePath);

        # Set the font style
        font = cv2.FONT_HERSHEY_SIMPLEX

        # Initialize and start the video frame capture
        self.cam.resolution=(640,480)
        self.cam.framerate=30
        rawCapture = PiRGBArray(self.cam, size=(640,480))
        # Loop
        for frame in self.cam.capture_continuous(rawCapture, format="bgr", use_video_port=True):
            im = frame.array    # Read the video frame

            # Convert the captured frame into grayscale
            gray = cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)

            # Get all face from the video frame
            faces = faceCascade.detectMultiScale(gray, 1.2,5)

            if len(faces) == 0:
                self.face_id = None

            # For each face in faces
            for(x,y,w,h) in faces:

                # Create rectangle around the face
                cv2.rectangle(im, (x-20,y-20), (x+w+20,y+h+20), (0,255,0), 4)

                # Recognize the face belongs to which ID
                id, confidence = recognizer.predict(gray[y:y+h,x:x+w])

                # Check the ID if exist
                if id == 1:
                    self.face_id = 1
                    txt = "Amir {0:.2f}%".format(round(100 - confidence, 2))
                elif id == 2:
                    self.face_id = 2
                    txt = "Asieh {0:.2f}%".format(round(100 - confidence, 2))
                else:
                    self.face_id = None
                    txt = "Unknown"

                # Put text describe who is in the picture
                cv2.rectangle(im, (x-22,y-90), (x+w+22, y-22), (0,255,0), -1)
                cv2.putText(im, txt, (x,y-40), font, 1, (255,255,255), 3)

            # Display the video frame with the bounded rectangle
            cv2.imshow('im',im)

            # If 'q' is pressed, close program
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

            rawCapture.truncate(0)

        # Stop the camera
        self.cam.release()

        # Close all windows
        cv2.destroyAllWindows()


recognition = Recognition()

if __name__ == "__main__":
    recognition.recognize()
