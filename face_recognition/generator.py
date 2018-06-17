import cv2
from picamera import PiCamera
from picamera.array import PiRGBArray

# cam = cv2.VideoCapture(0)
cam = PiCamera()
cam.resolution=(640,480)
cam.framerate=30
rawCapture = PiRGBArray(cam, size=(640,480))
                        
face_detector=cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
i=0
offset=0
name=raw_input('enter your id')
for frame in cam.capture_continuous(rawCapture, format="bgr", use_video_port=True):
    im = frame.array
    gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray, 1.3, 5)
    for(x,y,w,h) in faces:
        print i
        i=i+1
        cv2.imwrite("dataset/User."+name +'.'+ str(i) + ".jpg", gray[y-offset:y+h+offset,x-offset:x+w+offset])
        cv2.rectangle(im,(x-offset,y-offset),(x+w+offset,y+h+offset),(225,0,0),2)
        cv2.imshow('im',im[y-offset:y+h+offset,x-offset:x+w+offset])
    if i>100:
        cam.release()
        cv2.destroyAllWindows()
        break
    cv2.waitKey(100)
    rawCapture.truncate(0)
